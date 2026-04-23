import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

(function() {
    // 1. DOMAIN LOCK (Add your domains here)
    const allowed = ['meprotech.app', 'vercel.app', 'localhost'];
    if (!allowed.some(d => window.location.hostname.includes(d))) {
        document.getElementById('lock-screen').style.display = 'flex';
        throw new Error("Unauthorized Domain");
    }

    const setup = async () => {
        // UI References - MATCHING HTML EXACTLY
        const statusText = document.getElementById('status-text');
        const progressBar = document.getElementById('progress-bar');
        const startButton = document.getElementById('startButton');
        const overlay = document.getElementById('overlay');
        const hud = document.getElementById('hud');
        const vFinder = document.getElementById('v-finder');
        const header = document.getElementById('hud-header');

        const mindarThree = new MindARThree({
            container: document.querySelector("#container"),
            imageTargetSrc: './assets/config.bin', // Your renamed .mind file
        });

        const {renderer, scene, camera} = mindarThree;

        // FIX: Remove warning and set correct color space
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        scene.add(new THREE.AmbientLight(0xffffff, 1.2));
        const sun = new THREE.DirectionalLight(0xffffff, 1.0);
        sun.position.set(1, 10, 5);
        scene.add(sun);

        const anchor = mindarThree.addAnchor(0);
        const loader = new GLTFLoader();

        try {
            statusText.innerText = "LOADING ASSETS";
            const [modelGltf] = await Promise.all([
                new Promise((res, rej) => {
                    loader.load('./assets/asset.bin', res, (xhr) => {
                        if (xhr.lengthComputable) {
                            const percent = (xhr.loaded / xhr.total * 100);
                            progressBar.style.width = percent + '%';
                        }
                    }, rej);
                }),
                mindarThree.start()
            ]);

            anchor.group.add(modelGltf.scene);
            
            statusText.innerText = "READY FOR XR";
            progressBar.style.width = "100%";
            startButton.style.display = 'block';

            startButton.addEventListener('click', () => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.display = 'none';
                    hud.style.opacity = '1';
                }, 800);

                renderer.setAnimationLoop(() => {
                    if (anchor.group.children.length > 0) {
                        anchor.group.children[0].rotation.y += 0.005; // Subtle auto-rotate
                    }
                    renderer.render(scene, camera);
                });
            });

            // Target Feedback
            anchor.onTargetFound = () => {
                vFinder.style.opacity = "0";
                header.innerText = "ASSET LOCKED";
            };
            anchor.onTargetLost = () => {
                vFinder.style.opacity = "1";
                header.innerText = "VISUALIZING ASSET";
            };

        } catch (err) {
            statusText.innerText = "HARDWARE ERROR";
            console.error(err);
        }
    }

    setup();
})();