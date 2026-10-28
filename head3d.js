// Tête 3D en arrière-plan du hero (modèle Blender exporté en .glb)
// Uniquement sur grand écran : sur mobile, Three.js n'est même pas téléchargé
if (window.matchMedia('(min-width: 1100px)').matches) {
    init();
}

async function init() {
    const THREE = await import('three');
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');

    const container = document.getElementById('hero-3d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Vue de 3/4 depuis le haut : 40° sur le côté, 28° au-dessus
    const YAW = THREE.MathUtils.degToRad(40);
    const PITCH = THREE.MathUtils.degToRad(28);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Éclairage chaud : lumière principale en haut, face au visage, débouchage léger à gauche
    scene.add(new THREE.HemisphereLight(0xfff9f0, 0x3a2a2a, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(2, 6, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffe0e6, 0.5);
    fill.position.set(-4, 2, 4);
    scene.add(fill);

    const pivot = new THREE.Group();
    scene.add(pivot);

    let center = new THREE.Vector3();
    let radius = 0;
    let distance = 10;

    // Recule la caméra pour que tout le modèle tienne dans le cadre, quel que soit son format
    function fitCamera() {
        const vFov = THREE.MathUtils.degToRad(camera.fov);
        const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
        distance = radius / Math.sin(Math.min(vFov, hFov) / 2) * 1.05;
    }

    function placeCamera() {
        camera.position.set(
            center.x + distance * Math.cos(PITCH) * Math.sin(YAW),
            center.y + distance * Math.sin(PITCH),
            center.z + distance * Math.cos(PITCH) * Math.cos(YAW)
        );
        camera.lookAt(center);
    }

    function resize() {
        const { width, height } = container.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        if (radius) {
            fitCamera();
            placeCamera();
        }
        renderer.render(scene, camera);
    }

    new GLTFLoader().load('assets/3d/tete_matheo.glb', gltf => {
        const model = gltf.scene;

        // Centrer le modèle sur le pivot pour qu'il tourne sur lui-même
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        box.getCenter(center);
        model.position.sub(center);
        center.set(0, 0, 0);
        pivot.add(model);

        // Contour noir façon « sticker » : copie agrandie de chaque bloc, vue de l'intérieur
        const outline = new THREE.MeshBasicMaterial({ color: 0x1f1f1f, side: THREE.BackSide });
        const meshes = [];
        model.traverse(obj => { if (obj.isMesh) meshes.push(obj); });
        meshes.forEach(obj => {
            const hull = new THREE.Mesh(obj.geometry, outline);
            hull.scale.setScalar(1.04);
            obj.add(hull);
        });

        radius = size.length() / 2;
        resize();

        container.classList.add('is-loaded');

        if (!reduceMotion) animate();
    });

    // Légère inclinaison qui suit la souris, et flottement lent
    const pointer = { x: 0, y: 0 };
    window.addEventListener('pointermove', e => {
        pointer.x = e.clientX / window.innerWidth - 0.5;
        pointer.y = e.clientY / window.innerHeight - 0.5;
    });

    let visible = true;
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(container);

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        if (!visible || document.hidden) return;

        const t = clock.getElapsedTime();
        pivot.rotation.y += (pointer.x * 0.35 - pivot.rotation.y) * 0.05;
        pivot.rotation.x += (pointer.y * 0.2 - pivot.rotation.x) * 0.05;
        pivot.position.y = Math.sin(t * 1.2) * 0.06;
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', resize);
}
