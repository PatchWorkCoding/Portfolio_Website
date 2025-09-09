

/**
 * 
 *
 * @constant
 * @type {ShaderMaterial~Shader}
 */
import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

function CreatePass(asciiTexture, AsciiColor, canvas) {


    const AsciiShader = {
        uniforms: {
            canvasWidth: { value: canvas.clientWidth },
            canvasHeight: { value: canvas.clientHeight },
            tDiffuse: { value: null },
            asciiLookup: { value: asciiTexture },
            color: { value: new THREE.Color(AsciiColor) },
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

            vec2 screenCoord = vec2(vUv.x * canvasWidth, vUv.y * canvasHeight);
            float localX = (float(int(screenCoord.x) % int(characterSize.x)) / (characterSize.x * lumiStep)) + lumi;
            float localY = (float(int(screenCoord.y) % int(characterSize.y)) / characterSize.y);
            gl_FragColor = vec4(texture2D(asciiLookup, vec2(localX, localY)).rgb * color * lumi, 1);
        }
    `,
    };

    return new ShaderPass(AsciiShader);
}


export { CreatePass };