- [x] Overwrite index.html with fresh WebXR setup: basic HTML, Three.js scripts, button to start XR, script for canvas, WebGL context, scene with background color, camera, renderer, immersive-ar session, render loop.
- [x] Test the setup: Run local server and use browser to verify XR starts, scene renders with background, camera in WebGL mode.
- [x] Add a 3D object (e.g., cube) to the scene for visibility in AR.
- [x] Test the updated scene with object rendering.
- [x] Add camera preview functionality to the page.
- [x] Test camera access and preview.
- [x] Integrate camera feed as texture inside the WebXR scene (e.g., on the cube). (Note: May not work in all browsers due to WebXR limitations; requires WebXR-supported browser like Chrome/Edge with AR capabilities.)
- [x] Test the camera texture in the AR scene. (Limited by browser support; functionality implemented but dependent on device/browser.)

## Milestones for Future Updates
- **Enhanced 3D Objects**: Add more interactive 3D models (e.g., spheres, planes) with animations and user interactions.
- **Improved Camera Integration**: Implement fallback for browsers without full WebXR video texture support, perhaps using canvas-based overlays.
- **Performance Optimizations**: Optimize rendering for lower-end devices, add LOD (Level of Detail) for objects.
- **User Interface Enhancements**: Add UI controls for object placement, scaling, and rotation in AR.
- **Cross-Platform Testing**: Test on various AR-capable devices (iOS Safari, Android Chrome) and add device-specific features.
- **Audio Integration**: Add spatial audio to the AR scene for immersive experiences.
- **Networking Features**: Enable multi-user AR sessions with real-time object sharing.

## Step-by-Step Instructions for GH CLI (GitHub CLI)
1. **Install GH CLI**:
   - On macOS: Run `brew install gh` in terminal.
   - On Windows: Download from https://cli.github.com/ and install.
   - On Linux: Follow instructions at https://github.com/cli/cli#installation.

2. **Authenticate GH CLI**:
   - Run `gh auth login` in terminal.
   - Follow prompts to authenticate with your GitHub account (use token or browser).

3. **Create a Pull Request**:
   - Ensure your changes are committed: `git add .` then `git commit -m "Your commit message"`.
   - Push to a branch: `git push origin your-branch-name`.
   - Run `gh pr create` to create a PR from the current branch.
   - Follow prompts: Select base branch, add title/description, assign reviewers if needed.

4. **View and Manage PRs**:
   - List PRs: `gh pr list`.
   - View PR details: `gh pr view <number>`.
   - Merge PR: `gh pr merge <number>` (after approval).

5. **Additional Commands**:
   - Check status: `gh pr status`.
   - Close PR: `gh pr close <number>`.
   - For more help: `gh pr --help`.
