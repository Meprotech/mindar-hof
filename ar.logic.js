(function() {
    // Only allow these domains to run your code
    const allowed = ['meprotech.app', 'localhost', 'vercel.app']; 
    const currentHost = window.location.hostname;
    const isLegal = allowed.some(d => currentHost.includes(d));

    if (!isLegal) {
        document.body.innerHTML = "<div style='color:white;text-align:center;margin-top:20%'><h1>UNAUTHORIZED DOMAIN</h1><p>License required for MEPROTECH solutions.</p></div>";
        throw new Error("Domain Lock: Access Denied");
    }
})();

import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const setup = async () => {
    const status = document.getElementById('status');
    const progress = document.getElementById('progress-bar');
    const startBtn = document.getElementById('startButton');

    const mindarThree = new MindARThree({
        container: document.querySelector("#container"),
        imageTargetSrc: './assets/targets.mind',
    });

    const {renderer, scene, camera} = mindarThree;
    
    // Fix Color Space Warning
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(1, 10, 1);
    scene.add(sun);

    const anchor = mindarThree.addAnchor(0);
    const loader = new GLTFLoader();

    // Parallel loading logic
    try {
        const [modelGltf] = await Promise.all([
            new Promise((res, rej) => {
                loader.load('./assets/model.glb', res, (xhr) => {
                    if (xhr.lengthComputable) {
                        progress.style.width = (xhr.loaded / xhr.total * 100) + '%';
                    }
                }, rej);
            }),
            mindarThree.start()
        ]);

        anchor.group.add(modelGltf.scene);
        
        status.innerText = "System Ready";
        document.getElementById('progress-container').style.display = 'none';
        startBtn.style.display = 'block';

        startBtn.addEventListener('click', () => {
            document.getElementById('overlay').style.opacity = '0';
            setTimeout(() => document.getElementById('overlay').style.display = 'none', 800);
            
            const uiHelper = document.getElementById('ui-helper');
            uiHelper.style.display = 'block';
            setTimeout(() => uiHelper.style.opacity = '1', 100);

            renderer.setAnimationLoop(() => {
                renderer.render(scene, camera);
            });
        });

        anchor.onTargetFound = () => {
            document.getElementById('ui-helper').style.opacity = '0';
        };
        anchor.onTargetLost = () => {
            document.getElementById('ui-helper').style.opacity = '1';
        };

    } catch (err) {
        status.innerText = "Check Connection";
        console.error(err);
    }
}

setup();