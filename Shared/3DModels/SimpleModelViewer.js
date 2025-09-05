import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer, SobelOperatorShader } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { LuminosityShader } from 'three/examples/jsm/Addons.js';


function main() {
    document.querySelectorAll('.ModelViewer').forEach(CreateScene);
}

function CreateScene(viewerElement) {
    const canvas = viewerElement;
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

    const fov = 39.5978;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 1000;
    var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 15);

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.update();


    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.update();

    const scene = new THREE.Scene();
    // //Creates Directional Light
    // {
    //
    //     const color = 0xFFFFFF;
    //     const intensity = 3;
    //     const light = new THREE.DirectionalLight(color, intensity);
    //     light.position.set(- 1, 2, 4);
    //     scene.add(light);
    //
    // }

    //Imports GLTF
    {
        const gltfLoader = new GLTFLoader();
        const url = './Shared/3DModels/ExportedModels/' + viewerElement.id + '.glb';
        //console.log(url);
        gltfLoader.load(
            url, (gltf) => {
                const root = gltf.scene;
                //root.position.set(0, -2.4, 0);
                scene.add(root);
                if (gltf.cameras[0] != null) {
                    camera = gltf.cameras[0].clone();

                    camera.aspect = canvas.clientWidth / canvas.clientHeight;
                    camera.updateProjectionMatrix();
                    controls = new OrbitControls(camera, renderer.domElement);
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
            //composer.setSize(canvas.width, canvas.height);

        }

        controls.update();
        renderer.render(scene, camera);

        requestAnimationFrame(render);

    }

    requestAnimationFrame(render);

}

main();
