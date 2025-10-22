const arButton = document.getElementById('ar-button');

async function activateXR() {
  try {
    // Check if WebXR is supported
    if ('xr' in navigator) {
      const supported = await navigator.xr.isSessionSupported('immersive-ar');
      if (supported) {
        const video = document.getElementById('camera-feed');
        video.addEventListener('loadedmetadata', async () => {
          const texture = new THREE.VideoTexture(video);

          // Request a WebXR session
          const session = await navigator.xr.requestSession('immersive-ar', { optionalFeatures: ['local-floor'] });

          // Create a renderer
          const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
          });
          renderer.setSize(window.innerWidth, window.innerHeight);
          renderer.setPixelRatio(window.devicePixelRatio);
          renderer.setClearColor(0x000000, 0);
          renderer.xr.enabled = true;
          renderer.autoClear = false;
          document.body.appendChild(renderer.domElement);
          renderer.domElement.style.display = 'none';

          if (session.enabledFeatures.includes('local-floor')) {
            renderer.xr.setReferenceSpaceType('local-floor');
          } else {
            renderer.xr.setReferenceSpaceType('local');
          }
          renderer.domElement.style.display = 'none';

          // Create a scene
          const scene = new THREE.Scene();
          scene.background = null;

          // Add a light
          const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
          light.position.set(0.5, 1, 0.25);
          scene.add(light);

          // Create a cube
          const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
          const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
          const cube = new THREE.Mesh(geometry, material);
          cube.position.set(0, 0, -1);
          scene.add(cube);

          // Show controls
          const controls = document.getElementById('controls');
          controls.style.display = 'block';

          // Scale controls
          document.getElementById('scale-up').addEventListener('click', () => {
            cube.scale.x += 0.1;
            cube.scale.y += 0.1;
            cube.scale.z += 0.1;
          });

          document.getElementById('scale-down').addEventListener('click', () => {
            cube.scale.x -= 0.1;
            cube.scale.y -= 0.1;
            cube.scale.z -= 0.1;
          });

          // Rotate controls
          document.getElementById('rotate-left').addEventListener('click', () => {
            cube.rotation.y += 0.1;
          });

          document.getElementById('rotate-right').addEventListener('click', () => {
            cube.rotation.y -= 0.1;
          });

          renderer.xr.setSession(session).then(() => {
            renderer.domElement.style.display = 'block';
          });

          const controller = renderer.xr.getController(0);
          scene.add(controller);

          const reticleGeometry = new THREE.SphereGeometry(0.01, 16, 16);
          const reticleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
          controller.add(reticle);
          reticle.position.set(0, 0, -0.2);

          controller.addEventListener('select', () => {
            const controllerPose = controller.matrixWorld;
            const newPosition = new THREE.Vector3().setFromMatrixPosition(controllerPose);
            cube.position.copy(newPosition);
          });

          session.addEventListener('end', () => {
            // Clean up the session
            renderer.dispose();
            document.body.removeChild(renderer.domElement);
            renderer.domElement.style.display = 'none';
          });

          renderer.setAnimationLoop((time, frame) => {
            if (frame) {
              const pose = frame.getViewerPose(renderer.xr.getReferenceSpace());
              if (pose) {
                renderer.clear();
                const view = pose.views[0];
                const camera = renderer.xr.getCamera(new THREE.PerspectiveCamera());
                camera.matrix.fromArray(view.transform.matrix);
                camera.projectionMatrix.fromArray(view.projectionMatrix);
                camera.updateMatrixWorld(true);
                renderer.render(scene, camera);
              }
            }
          });
        });

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.play();

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