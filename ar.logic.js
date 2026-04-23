import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const setup = async () => {
    // UI Selectors
    const statusText = document.getElementById('status-text');
    const progressBar = document.getElementById('progress-bar');
    const startButton = document.getElementById('startButton');
    const overlay = document.getElementById('overlay');
    const hud = document.getElementById('hud');
    const vFinder = document.getElementById('v-finder');
    const header = document.getElementById('hud-header');

    const mindarThree = new MindARThree({
        container: document.querySelector("#container"),
        imageTargetSrc: './assets/config.bin',
    });

    const {renderer, scene, camera} = mindarThree;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(1, 10, 5);
    scene.add(light);

    const anchor = mindarThree.addAnchor(0);
    const loader = new GLTFLoader();

    try {
        statusText.innerText = "LOADING ASSETS...";
        const [modelGltf] = await Promise.all([
            new Promise((res, rej) => {
                loader.load('./assets/asset.bin', res, (xhr) => {
                    if (xhr.lengthComputable) {
                        progressBar.style.width = (xhr.loaded / xhr.total * 100) + '%';
                    }
                }, rej);
            }),
            mindarThree.start()
        ]);

        anchor.group.add(modelGltf.scene);
        statusText.innerText = "READY";
        startButton.style.display = 'block';

        startButton.addEventListener('click', () => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
                hud.style.opacity = '1';
            }, 800);

            renderer.setAnimationLoop(() => {
                if (anchor.group.children.length > 0) {
                    anchor.group.children[0].rotation.y += 0.005;
                }
                renderer.render(scene, camera);
            });
        });

        anchor.onTargetFound = () => {
            vFinder.style.opacity = "0";
            header.innerText = "LOCKED";
        };
        anchor.onTargetLost = () => {
            vFinder.style.opacity = "1";
            header.innerText = "SEARCHING...";
        };

    } catch (err) {
        statusText.innerText = "ERROR LOADING";
        console.error(err);
    }
}
setup();