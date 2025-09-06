import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer, SobelOperatorShader } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { LuminosityShader } from 'three/examples/jsm/Addons.js';

function main() {

    const canvas = document.querySelector('#ObeliskScene');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

    const fov = 39.5978;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 15);


    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    const scene = new THREE.Scene();

    var textColor = window.getComputedStyle(document.documentElement).getPropertyValue('--text-color');
    var accentColor = window.getComputedStyle(document.documentElement).getPropertyValue('--accent-color');

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const greyScalePass = new ShaderPass(LuminosityShader);
    composer.addPass(greyScalePass);
    
    /*
        const DirectionalGaussianBlurPass = {
            uniforms: {
                pixelWidth: { value: 1.0 / canvas.clientWidth },
                pixelHeight: { value: 1.0 / canvas.clientHeight },
                convolutionSize: {value: 6},
                std: {value: 1.6},
                blurDirection: { value: new THREE.Vector2(1,0) },
                blurScalar: {value: 2},
                tDiffuse: { value: null }
            },
            vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
            }
        `,
            fragmentShader: `
            uniform float pixelWidth;
            uniform float pixelHeight;
            uniform int convolutionSize;
            uniform float std;
            uniform vec2 blurDirection;
            uniform float blurScalar;
            uniform sampler2D tDiffuse;
            float pi = 3.14159265358979323846;
            
            varying vec2 vUv;
          
            float gaussian(float _std, float _dst) {
                return (1.0 / sqrt(2.0 * pi * _std * _std)) * exp(-(_dst * _dst) / (2.0 * _std * _std));
            } 
    
            void main() {
    
                float gaussianSum1 = 0.0;
                float gaussianSum2 = 0.0;
                float kernelSum1 = 0.0;
                float kernelSum2 = 0.0;
                vec2 pixelOffset = (blurDirection * vec2(pixelWidth, pixelHeight));
    
                for(int i = -convolutionSize; i <= convolutionSize; i++) {
                    float value = texture2D(tDiffuse, vUv + pixelOffset * float(i)).r;    
    
                    float gaussian1 = gaussian(std, float(i));
                    float gaussian2 = gaussian(std * blurScalar, float(i));
    
                    gaussianSum1 += value * gaussian1;
                    gaussianSum2 += value * gaussian2;
                    
                    kernelSum1 += gaussian1;
                    kernelSum2 += gaussian2;
                }
    
                gl_FragColor = vec4(texture2D(tDiffuse, vUv).r, gaussianSum1 / kernelSum1, gaussianSum2 / kernelSum2, 0);
    
            }
        `,
        };
    
        const HorizontalBlurPass = new ShaderPass(DirectionalGaussianBlurPass);
        composer.addPass(HorizontalBlurPass);
    
        const VerticalBlurPass = new ShaderPass(DirectionalGaussianBlurPass);
        VerticalBlurPass.uniforms.blurDirection.value = new THREE.Vector2(0,1);
        composer.addPass(VerticalBlurPass);
        
        const DifferenceOfGaussians = {
            uniforms: {
                threshold: {value: 0.05},
                tau: {value: 1},
                tDiffuse: { value: null }
            },
            vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
            }
        `,
            fragmentShader: `
            uniform float threshold;
            uniform sampler2D tDiffuse;
            uniform float tau;
            
            varying vec2 vUv;
    
            void main() {
                //float diff = ( (1.0 + tau) * (texture2D(tDiffuse, vUv).g) - (tau * texture2D(tDiffuse, vUv).b)) > threshold ? 1.0 : 0.0;
                float diff = (texture2D(tDiffuse, vUv).g - texture2D(tDiffuse, vUv).b) > threshold ? 1.0 : 0.0;
                gl_FragColor = vec4(diff, diff, diff, 1);
            }
        `,
        };
    
        const DoGPass = new ShaderPass(DifferenceOfGaussians);
        composer.addPass(DoGPass);
       
    const SobelAsciiEdgeDetector = {

        uniforms: {

            'tDiffuse': { value: null },
            'threshold': { value: 0.5 },
            'resolution': { value: new THREE.Vector2(canvas.clientWidth, canvas.clientHeight) }

        },

        vertexShader: /* glsl

        varying vec2 vUv;

        void main() {

            vUv = uv;

            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

        }`,

        fragmentShader: /* glsl 
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform float threshold;
        varying vec2 vUv;

        float pi = 3.14159265358979323846;

        void main() {

            vec2 texel = vec2( 1.0 / resolution.x, 1.0 / resolution.y );

        // kernel definition (in glsl matrices are filled in column-major order)

            const mat3 Gx = mat3( -1, -2, -1, 0, 0, 0, 1, 2, 1 ); // x direction kernel
            const mat3 Gy = mat3( -1, 0, 1, -2, 0, 2, -1, 0, 1 ); // y direction kernel

        // fetch the 3x3 neighbourhood of a fragment

        // first column

            float tx0y0 = texture2D( tDiffuse, vUv + texel * vec2( -1, -1 ) ).r;
            float tx0y1 = texture2D( tDiffuse, vUv + texel * vec2( -1,  0 ) ).r;
            float tx0y2 = texture2D( tDiffuse, vUv + texel * vec2( -1,  1 ) ).r;

        // second column

            float tx1y0 = texture2D( tDiffuse, vUv + texel * vec2(  0, -1 ) ).r;
            float tx1y1 = texture2D( tDiffuse, vUv + texel * vec2(  0,  0 ) ).r;
            float tx1y2 = texture2D( tDiffuse, vUv + texel * vec2(  0,  1 ) ).r;

        // third column

            float tx2y0 = texture2D( tDiffuse, vUv + texel * vec2(  1, -1 ) ).r;
            float tx2y1 = texture2D( tDiffuse, vUv + texel * vec2(  1,  0 ) ).r;
            float tx2y2 = texture2D( tDiffuse, vUv + texel * vec2(  1,  1 ) ).r;

        // gradient value in x direction

            float valueGx = Gx[0][0] * tx0y0 + Gx[1][0] * tx1y0 + Gx[2][0] * tx2y0 +
                Gx[0][1] * tx0y1 + Gx[1][1] * tx1y1 + Gx[2][1] * tx2y1 +
                Gx[0][2] * tx0y2 + Gx[1][2] * tx1y2 + Gx[2][2] * tx2y2;

        // gradient value in y direction

            float valueGy = Gy[0][0] * tx0y0 + Gy[1][0] * tx1y0 + Gy[2][0] * tx2y0 +
                Gy[0][1] * tx0y1 + Gy[1][1] * tx1y1 + Gy[2][1] * tx2y1 +
                Gy[0][2] * tx0y2 + Gy[1][2] * tx1y2 + Gy[2][2] * tx2y2;

        // magnitude of the total gradient

            float Gmag = sqrt( ( valueGx * valueGx ) + ( valueGy * valueGy ) ) > threshold ? 1.0 : 0.0;
            float Gang = ((atan(valueGy, valueGx) / pi) * 0.5) + 0.5;


            gl_FragColor = vec4(texture2D(tDiffuse, vUv).r, Gang, Gmag, 1);

        }`

    };

    const SobelPass = new ShaderPass(SobelAsciiEdgeDetector);
    SobelPass.uniforms.resolution.value = new THREE.Vector2(canvas.clientWidth, canvas.clientHeight);
    composer.addPass(SobelPass);

*/

    const asciiTexture = new THREE.TextureLoader().load('/3DModels/Textures/ASCII_Lumanince_Ramp_8x8-1.png');
    asciiTexture.wrapT = THREE.ClampToEdgeWrapping;
    asciiTexture.wrapS = THREE.ClampToEdgeWrapping;
    asciiTexture.magFilter = THREE.NearestFilter;
    asciiTexture.minFilter = THREE.NearestFilter;

    const asciiEdgeTexture = new THREE.TextureLoader().load('/3DModels/Textures/ASCII_Lumanince_Ramp_Edges.png');
    asciiTexture.wrapT = THREE.ClampToEdgeWrapping;
    asciiTexture.wrapS = THREE.ClampToEdgeWrapping;
    asciiTexture.magFilter = THREE.NearestFilter;
    asciiTexture.minFilter = THREE.NearestFilter;

    const AsciiShader = {
        uniforms: {
            canvasWidth: { value: canvas.clientWidth },
            canvasHeight: { value: canvas.clientHeight },
            tDiffuse: { value: null },
            asciiLookup: { value: asciiTexture },
            asciiEdgeLookup: {value: asciiEdgeTexture },
            color: { value: new THREE.Color(accentColor) },
        },
        vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
        }
    `,
        fragmentShader: `
        uniform float canvasWidth;
        uniform float canvasHeight;
        uniform vec3 color;
        uniform sampler2D tDiffuse;
        uniform sampler2D asciiLookup;
        uniform sampler2D asciiEdgeLookup;
        varying vec2 vUv;
      
        void main() {
            vec2 characterSize = vec2(8.0, 8.0);
            float lumiStep = 8.0;
            float width = canvasWidth / characterSize.x;
            float height = canvasHeight / characterSize.y;
            vec2 downscaleUV = vec2(floor(vUv.x *  width) / width, floor(vUv.y *  height) / height);

            vec4 texData = texture2D(tDiffuse, downscaleUV); 
            float lumi = floor(texData.r * (lumiStep)) / (lumiStep);
            lumi = clamp(lumi, 0.0, (lumiStep - 1.0) / lumiStep);
            float edgeAngle = floor(texData.g * 4.0) / 4.0;
            float edgeMag = texData.b;

            vec2 screenCoord = vec2(vUv.x * canvasWidth, vUv.y * canvasHeight);
            float localX = (float(int(screenCoord.x) % int(characterSize.x)) / (characterSize.x * lumiStep)) + lumi;
            float localY = (float(int(screenCoord.y) % int(characterSize.y)) / characterSize.y);
            //float localEdgeX = (float(int(screenCoord.x) % int(characterSize.x)) / (characterSize.x * 4.0)) + edgeAngle * edgeMag;
            //gl_FragColor = vec4(texture2D(asciiEdgeLookup, vec2(localEdgeX, localY)).rgb * edgeMag, 1);
            gl_FragColor = vec4(texture2D(asciiLookup, vec2(localX, localY)).rgb * color * lumi, 1);
            //gl_FragColor = vec4(lumi);
        }
    `,
    };

    const AsciiPass = new ShaderPass(AsciiShader);
    composer.addPass(AsciiPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    //Creates Directional Light
    {

        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(- 1, 2, 4);
        scene.add(light);

    }

    //Imports GLTF
    {
        const gltfLoader = new GLTFLoader();
        const url = '/3DModels/ExportedModels/ObeliskScene.glb';
        //console.log(url);
        gltfLoader.load(
            url, (gltf) => {
                const root = gltf.scene;
                root.position.set(0, -2.4, 0);
                scene.add(root);
            },
            undefined,
            (error) => {
                console.error('Error loading GLTF:', error);
            }
        );

    }


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
            composer.setSize(canvas.width, canvas.height);

        }

        controls.update();
        composer.render(deltaTime);

        requestAnimationFrame(render);

    }

    requestAnimationFrame(render);

}

main();