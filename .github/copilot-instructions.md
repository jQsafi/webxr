# WebXR Project - AI Agent Instructions

## Project Overview
This is a WebXR application that enables Augmented Reality (AR) experiences in web browsers. The project uses Three.js for 3D rendering and WebXR API for AR functionality, served via a secure HTTPS Express server.

## Architecture

### Core Components
- `server.js`: HTTPS server setup with self-signed certificates (required for WebXR)
- `index.html`: Main entry point with WebXR initialization and Three.js setup
- `app.js`: WebXR session management and Three.js scene rendering

### Key Dependencies
- Three.js (v0.126.0): 3D graphics library
- Express (^5.1.0): Web server
- selfsigned (^3.0.1): SSL certificate generation

## Development Workflow

### Local Development Setup
1. The project requires HTTPS for WebXR. A self-signed certificate is automatically generated.
2. Start the server: `node server.js`
3. Access: https://localhost:8000

### WebXR Implementation Patterns
- WebXR session initialization requires user interaction (button click)
- Three.js scene setup follows this pattern:
  ```javascript
  // 1. Initialize WebGL context with XR compatibility
  const gl = canvas.getContext("webgl", {xrCompatible: true});
  
  // 2. Create Three.js scene and renderer
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    preserveDrawingBuffer: true,
    canvas: canvas,
    context: gl
  });
  
  // 3. Disable camera auto-updates (WebXR handles camera matrices)
  const camera = new THREE.PerspectiveCamera();
  camera.matrixAutoUpdate = false;
  ```

### Project-Specific Conventions
1. AR scene setup is in `app.js`, separated from the initialization in `index.html`
2. Camera matrices are managed by WebXR - do not update Three.js camera transforms directly
3. Always use `alpha: true` in WebGLRenderer for AR transparency
4. Handle WebXR session cleanup in the 'end' event listener

## Integration Points
1. Three.js Scene Integration:
   - Scene objects are added via `scene.add()`
   - Materials use `THREE.MeshBasicMaterial` for AR rendering
2. WebXR Session Management:
   - Session requests require secure context (HTTPS)
   - View poses and matrices are updated per animation frame

## Debugging Tips
- Check browser WebXR support: `navigator.xr.isSessionSupported('immersive-ar')`
- Verify HTTPS is working (required for WebXR)
- Monitor WebGL context loss in renderer
- Use browser dev tools' WebXR tab for session debugging

Note: This project requires a WebXR-capable device/browser for AR features.