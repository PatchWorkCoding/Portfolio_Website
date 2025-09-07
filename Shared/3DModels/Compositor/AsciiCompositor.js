import { EffectComposer, SobelOperatorShader } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { LuminosityShader } from 'three/examples/jsm/Addons.js';
import { CreatePass } from '../Shaders/AsciiPass';

function CreateCompositor(asciiTexturePath, AsciiColor, renderer, camera, scene) {
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const greyScalePass = new ShaderPass(LuminosityShader);
    composer.addPass(greyScalePass);

    const AsciiPass = CreatePass(asciiTexturePath, AsciiColor, renderer.domElement);
    composer.addPass(AsciiPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);
    return composer;
}

export {CreateCompositor}