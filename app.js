const video = document.getElementById('camera-feed');
const canvas = document.getElementById('detection-overlay');
const ctx = canvas.getContext('2d');
const toggleBtn = document.getElementById('toggle-btn');
const statusText = document.getElementById('status');
const cameraView = document.querySelector('.camera-view');

let isDetecting = false;
let tesseractWorker = null;
let animationId = null;
let isProcessing = false;
let lastFrame = null;
let motionThreshold = 30; // Sensitivity: lower = more sensitive

// Get loading overlay elements
const loadingOverlay = document.getElementById('loading-overlay');
const loadingTitle = document.getElementById('loading-title');
const loadingStatus = document.getElementById('loading-status');
const progressFill = document.getElementById('progress-fill');

// Initialize Tesseract
async function initTesseract() {
    try {
        loadingTitle.textContent = "Downloading OCR Model";
        loadingStatus.textContent = "Please wait while we download the AI model...";
        progressFill.style.width = '0%';

        tesseractWorker = await Tesseract.createWorker('eng', 1, {
            logger: m => {
                console.log(m);

                if (m.status === 'loading tesseract core') {
                    loadingStatus.textContent = "Loading Tesseract core...";
                    progressFill.style.width = '20%';
                } else if (m.status === 'initializing tesseract') {
                    loadingStatus.textContent = "Initializing Tesseract...";
                    progressFill.style.width = '40%';
                } else if (m.status === 'loading language traineddata') {
                    loadingStatus.textContent = "Downloading language data...";
                    if (m.progress) {
                        const progress = 40 + (m.progress * 40); // 40% to 80%
                        progressFill.style.width = `${progress}%`;
                        loadingStatus.textContent = `Downloading: ${(m.progress * 100).toFixed(0)}%`;
                    }
                } else if (m.status === 'initializing api') {
                    loadingStatus.textContent = "Initializing recognition engine...";
                    progressFill.style.width = '90%';
                }
            }
        });

        // Configure for single character recognition
        loadingStatus.textContent = "Configuring for alphabet detection...";
        progressFill.style.width = '95%';

        await tesseractWorker.setParameters({
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
            tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
        });

        // Complete
        loadingStatus.textContent = "Ready!";
        progressFill.style.width = '100%';

        // Hide loading overlay
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
        }, 500);

        statusText.textContent = "Ready to start";
        toggleBtn.disabled = false;
        return true;
    } catch (e) {
        console.error('Tesseract init error:', e);
        loadingTitle.textContent = "Error";
        loadingStatus.textContent = "Failed to load OCR model. Please refresh the page.";
        loadingStatus.style.color = "#ff6b6b";
        statusText.textContent = "Error loading OCR model";
        statusText.style.color = "#ff6b6b";
        return false;
    }
}

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 },
                // Advanced camera settings for better text detection
                focusMode: { ideal: 'continuous' },
                zoom: { ideal: 1.0 }
            }
        });
        video.srcObject = stream;

        // Enable auto-focus if available
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();

        if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
            await track.applyConstraints({
                advanced: [{ focusMode: 'continuous' }]
            });
            console.log('✓ Continuous auto-focus enabled');
        }

        // Wait for video to load to set canvas dimensions
        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            startDetection();
        };

        toggleBtn.textContent = "Stop Camera";
        toggleBtn.onclick = stopCamera;
        cameraView.classList.add('active');
        statusText.textContent = "Camera active. Point at alphabets...";
    } catch (err) {
        console.error("Error accessing camera:", err);
        statusText.textContent = "Camera access denied or error.";
    }
}

function stopCamera() {
    const stream = video.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }

    cancelAnimationFrame(animationId);
    isDetecting = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    toggleBtn.textContent = "Start Camera";
    toggleBtn.onclick = startCamera;
    cameraView.classList.remove('active');
    statusText.textContent = "Ready";
}

function startDetection() {
    isDetecting = true;
    lastFrame = null; // Reset on start
    detect();
}

// Detect motion between frames
function detectMotion(currentFrame) {
    if (!lastFrame) {
        lastFrame = currentFrame;
        return true; // First frame, assume motion
    }

    const current = currentFrame.getContext('2d').getImageData(0, 0, currentFrame.width, currentFrame.height);
    const previous = lastFrame.getContext('2d').getImageData(0, 0, lastFrame.width, lastFrame.height);

    let diffCount = 0;
    const pixels = current.data.length / 4;
    const sampleRate = 10; // Check every 10th pixel for performance

    for (let i = 0; i < pixels; i += sampleRate) {
        const index = i * 4;
        const rDiff = Math.abs(current.data[index] - previous.data[index]);
        const gDiff = Math.abs(current.data[index + 1] - previous.data[index + 1]);
        const bDiff = Math.abs(current.data[index + 2] - previous.data[index + 2]);

        if (rDiff + gDiff + bDiff > motionThreshold) {
            diffCount++;
        }
    }

    const motionPercentage = (diffCount / (pixels / sampleRate)) * 100;
    lastFrame = currentFrame;

    // Return true if more than 1% of pixels changed
    return motionPercentage > 1;
}

async function detect() {
    if (!video.srcObject || isProcessing) {
        animationId = requestAnimationFrame(detect);
        return;
    }

    // Create a temporary canvas to capture the video frame
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw current video frame to the temporary canvas
    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

    // Check for motion
    const hasMotion = detectMotion(tempCanvas);

    if (!hasMotion) {
        statusText.textContent = "Waiting for movement...";
        // Skip OCR if no motion detected
        setTimeout(() => {
            animationId = requestAnimationFrame(detect);
        }, 100); // Check for motion every 100ms
        return;
    }

    isProcessing = true;

    // Update status to show scanning
    statusText.textContent = "Motion detected! Scanning...";

    try {
        // Recognize text from the canvas image (tempCanvas already created above)
        const { data } = await tesseractWorker.recognize(tempCanvas);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Debug: Log detected words
        if (data.words && data.words.length > 0) {
            console.log('Detected words:', data.words.map(w => `"${w.text}" (${w.confidence.toFixed(1)}%)`).join(', '));
        }

        // Draw detections
        ctx.strokeStyle = '#64ffda';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(100, 255, 218, 0.15)';
        ctx.font = 'bold 16px Inter';

        // Filter for single alphabets only - LOWERED CONFIDENCE for better detection
        const alphabetRegex = /^[A-Za-z]$/;
        const alphabets = data.words.filter(word => {
            const trimmed = word.text.trim();
            const isAlphabet = alphabetRegex.test(trimmed);
            if (word.confidence > 40 && !isAlphabet) {
                console.log(`Filtered out: "${trimmed}" (not a single alphabet, confidence: ${word.confidence.toFixed(1)}%)`);
            }
            return isAlphabet && word.confidence > 50; // Lowered from 60 to 50
        });

        console.log(`Found ${alphabets.length} alphabets out of ${data.words.length} total detections`);

        // Update status
        if (alphabets.length > 0) {
            statusText.textContent = `Detected ${alphabets.length} alphabet${alphabets.length > 1 ? 's' : ''}!`;
        } else {
            statusText.textContent = "No alphabets detected";
        }

        alphabets.forEach(word => {
            const { bbox, text, confidence } = word;

            // Draw box with animation effect
            ctx.beginPath();
            ctx.rect(
                bbox.x0,
                bbox.y0,
                bbox.x1 - bbox.x0,
                bbox.y1 - bbox.y0
            );
            ctx.stroke();
            ctx.fill();

            // Draw text label background
            const label = `Alphabet detected: ${text.toUpperCase()}`;
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = '#64ffda';
            ctx.fillRect(
                bbox.x0,
                bbox.y0 - 25,
                textWidth + 10,
                25
            );

            // Draw text
            ctx.fillStyle = '#0a192f';
            ctx.fillText(
                label,
                bbox.x0 + 5,
                bbox.y0 - 7
            );

            // Reset fill for next box
            ctx.fillStyle = 'rgba(100, 255, 218, 0.15)';
        });

    } catch (err) {
        console.error("Detection error:", err);
        statusText.textContent = "Detection error - check console";
    }

    isProcessing = false;
    if (isDetecting) {
        // Run detection every 1 second (increased from 500ms for better performance)
        setTimeout(() => {
            animationId = requestAnimationFrame(detect);
        }, 1000);
    }
}

function startDetection() {
    isDetecting = true;
    detect();
}

// Initialize on load
toggleBtn.disabled = true;
statusText.textContent = "Initializing...";

initTesseract().then(success => {
    if (success) {
        toggleBtn.onclick = startCamera;
    }
});

// Handle resize
window.addEventListener('resize', () => {
    if (video.srcObject) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', async () => {
    if (tesseractWorker) {
        await tesseractWorker.terminate();
    }
});