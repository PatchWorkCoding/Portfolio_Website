import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CreateCompositor } from './Compositor/AsciiCompositor';

function main() {
    document.querySelectorAll('.ModelViewer').forEach(CreateScene);
}

function CreateScene(viewerElement) {
    var textColor = window.getComputedStyle(document.documentElement).getPropertyValue('--text-color');
    var accentColor = window.getComputedStyle(document.documentElement).getPropertyValue('--accent-color');

    const canvas = viewerElement;
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

    const fov = 39.5978;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 1000;
    var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 15);

    var controls = null;
    var compositor = null;

    const scene = new THREE.Scene();

    //Imports GLTF
    {
        const gltfLoader = new GLTFLoader();
        const url = '/Portfolio_Website/Shared/3DModels/ExportedModels/' + viewerElement.id + '.glb';
        //console.log(url);
        gltfLoader.load(
            url, (gltf) => {
                const root = gltf.scene;
                scene.add(root);
                if (gltf.cameras[0] != null) {
                    camera = gltf.cameras[0].clone();

                    camera.aspect = canvas.clientWidth / canvas.clientHeight;
                    camera.updateProjectionMatrix();


                    for (let i = 0; i < viewerElement.classList.length; i++) {
                        switch (viewerElement.classList[i]) {
                            case "OrbitControlled":
                                controls = new OrbitControls(camera, renderer.domElement);
                                controls.update();
                                break;
                            case "AsciiEffect":
                                compositor = CreateCompositor('Shared/3DModels/Textures/ASCII_Lumanince_Ramp_8x8-1.png', accentColor, renderer, camera, scene);
                                break;
                        }
                     }

                    camera.needsUpdate = true;
                }
            },
            undefined,
            (error) => {
                console.error('Error loading GLTF:', error);
            }
        );

    }


    //const light = new THREE.AmbientLight(0x404040); // soft white light
    //scene.add(light);

    function resizeRendererToDisplaySize(renderer) {

        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {

            renderer.setSize(width, height, false);
        }

        return needResize;

    }

    let then = 0;
    function render(now) {

        now *= 0.001; // convert to seconds
        const deltaTime = now - then;
        then = now;

        if (resizeRendererToDisplaySize(renderer)) {

            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();

            if (compositor != null)
                compositor.setSize(canvas.width, canvas.height);
        }

        if (controls != null)
            controls.update();

        if (compositor != null) {
            compositor.render();

        }
        else {
            renderer.render(scene, camera);
            //console.log("Called");
        }

        requestAnimationFrame(render);

    }

    requestAnimationFrame(render);

}

main();

/* Parses the Id Present on the Element Viewer in order to properly setup the Canvas 
* Input: 
* a string in the format: ModelName|CompositorName|UseOrbitControl?
*       Example: ObelesickScene|Ascii|False
* Output:
* A string for the model Name, A string for the compis
*/

