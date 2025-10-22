const arButton = document.getElementById('ar-button');

async function activateXR() {
  try {
    // Check if WebXR is supported
    if ('xr' in navigator) {
      const supported = await navigator.xr.isSessionSupported('immersive-ar');
      if (supported) {
        // Request a WebXR session
        const session = await navigator.xr.requestSession('immersive-ar');

        // Create a renderer
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);

        // Create a scene
        const scene = new THREE.Scene();

        // Create a camera
        const camera = new THREE.PerspectiveCamera(
          70,
          window.innerWidth / window.innerHeight,
          0.01,
          20
        );

        // Set up the render loop
        const render = () => {
          renderer.render(scene, camera);
        };

        session.addEventListener('end', () => {
          // Clean up the session
          renderer.dispose();
          document.body.removeChild(renderer.domElement);
        });

        session.requestAnimationFrame(function animate(time, frame) {
          session.requestAnimationFrame(animate);
          const pose = frame.getViewerPose(session.renderState.baseLayer.getViewport(frame.views[0]));
          if (pose) {
            const view = pose.views[0];
            const viewport = session.renderState.baseLayer.getViewport(view);
            renderer.setSize(viewport.width, viewport.height);
            camera.matrix.fromArray(view.transform.matrix);
            camera.projectionMatrix.fromArray(view.projectionMatrix);
            camera.updateMatrixWorld(true);
            render();
          }
        });

      } else {
        arButton.textContent = 'AR not supported';
      }
    } else {
      arButton.textContent = 'WebXR not supported';
    }
  } catch (e) {
    console.error(e);
    arButton.textContent = 'Error';
  }
}

arButton.addEventListener('click', activateXR);