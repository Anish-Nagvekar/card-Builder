/**
 * Hacker House Goa 2026 - ID Pass Generator Script
 * Handles real-time customization, image upload/cropping/panning, and high-res canvas rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const inputName = document.getElementById('input-name');
    const inputAge = document.getElementById('input-age');
    const inputProfession = document.getElementById('input-profession');
    const inputCustomProfession = document.getElementById('input-custom-profession');
    const customRoleGroup = document.getElementById('custom-role-group');
    
    const inputFile = document.getElementById('input-file');
    const dropZone = document.getElementById('drop-zone');
    const imageControlsGroup = document.getElementById('image-controls-group');
    const inputZoom = document.getElementById('input-zoom');
    const btnResetImage = document.getElementById('btn-reset-image');
    
    const templateOptions = document.querySelectorAll('.template-option');
    const colorPickerContainer = document.getElementById('color-picker-container');
    const cardPreviewElement = document.getElementById('card-preview-element');
    
    const cardDisplayName = document.getElementById('card-display-name');
    const cardDisplayProfession = document.getElementById('card-display-profession');
    const profileCropContainer = document.getElementById('profile-crop-container');
    const profileImgDraggable = document.getElementById('profile-img-draggable');
    const btnDownloadPass = document.getElementById('btn-download-pass');
    
    const renderCanvas = document.getElementById('render-canvas');

    // State Variables
    let state = {
        name: 'MADHAVAN SINGH',
        age: '',
        profession: 'FULL STACK DEVELOPER',
        customProfession: '',
        template: 'neon', // 'neon' | 'retro' | 'mix'
        accentColor: '#ff007f', // Initial color
        image: null,
        imageLoaded: false,
        imgScale: 1.0,
        imgX: 0,
        imgY: 0,
        // Dimensions of image in preview box (zoom = 1)
        imgDisplayWidth: 0,
        imgDisplayHeight: 0,
        imgDisplayLeft: 0,
        imgDisplayTop: 0
    };

    // Color Palettes per Template
    const colorPalettes = {
        neon: [
            { name: 'Pink (Default)', value: '#ff007f' },
            { name: 'Cyan Glow', value: '#00f0ff' },
            { name: 'Cyber Purple', value: '#bd00ff' },
            { name: 'Lime Green', value: '#39ff14' }
        ],
        retro: [
            { name: 'Red (Default)', value: '#c94b32' },
            { name: 'Forest Green', value: '#183c2e' },
            { name: 'Vintage Gold', value: '#f5c453' },
            { name: 'Muted Sage', value: '#477651' }
        ],
        mix: [
            { name: 'Cyan (Default)', value: '#00f0ff' },
            { name: 'Sunset Pink', value: '#ff007f' },
            { name: 'Lime Glow', value: '#39ff14' },
            { name: 'Neon Violet', value: '#bd00ff' }
        ]
    };

    // Initialize Page
    init();

    function init() {
        // Render initial color picker
        renderColorPicker();
        
        // Setup initial preview values
        updatePreviewText();
        
        // Register Event Listeners
        inputName.addEventListener('input', handleNameInput);
        inputAge.addEventListener('input', handleAgeInput);
        inputProfession.addEventListener('change', handleProfessionChange);
        inputCustomProfession.addEventListener('input', handleCustomProfessionInput);
        
        // File Upload Handlers
        inputFile.addEventListener('change', handleFileSelect);
        setupDragAndDrop();
        
        // Zoom Slider & Reset
        inputZoom.addEventListener('input', handleZoomChange);
        btnResetImage.addEventListener('click', resetImagePosition);
        
        // Drag-to-pan in Preview
        setupDragToPan();
        
        // Template Switchers
        templateOptions.forEach(option => {
            option.addEventListener('click', handleTemplateChange);
        });
        
        // Download pass trigger
        btnDownloadPass.addEventListener('click', handleDownload);
    }

    // ==========================================================================
    // FORM INPUT SYNC & UTILS
    // ==========================================================================
    function updatePreviewText() {
        // Sync Name & Age
        let displayName = state.name.trim() || 'YOUR NAME HERE';
        if (state.age) {
            displayName += `, ${state.age}`;
        }
        cardDisplayName.textContent = displayName.toUpperCase();

        // Sync Profession
        let displayProf = 'DEVELOPER';
        if (state.profession === 'CUSTOM') {
            displayProf = state.customProfession.trim() || 'CUSTOM ROLE';
        } else {
            displayProf = state.profession;
        }
        cardDisplayProfession.textContent = displayProf.toUpperCase();
    }

    function handleNameInput(e) {
        state.name = e.target.value;
        updatePreviewText();
    }

    function handleAgeInput(e) {
        state.age = e.target.value;
        updatePreviewText();
    }

    function handleProfessionChange(e) {
        state.profession = e.target.value;
        if (state.profession === 'CUSTOM') {
            customRoleGroup.classList.remove('hidden');
            inputCustomProfession.required = true;
        } else {
            customRoleGroup.classList.add('hidden');
            inputCustomProfession.required = false;
        }
        updatePreviewText();
    }

    function handleCustomProfessionInput(e) {
        state.customProfession = e.target.value;
        updatePreviewText();
    }

    // ==========================================================================
    // TEMPLATE & COLOR CONTROLS
    // ==========================================================================
    function handleTemplateChange(e) {
        const option = e.currentTarget;
        const templateType = option.getAttribute('data-template');
        
        // Remove active class from options
        templateOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        // Update state
        state.template = templateType;
        
        // Update class on preview card element
        cardPreviewElement.className = `card-preview theme-${templateType}`;
        
        // Set default accent color for this template
        state.accentColor = colorPalettes[templateType][0].value;
        
        // Re-render color dots
        renderColorPicker();
        
        // Apply color values to CSS Variables
        applyAccentColor(state.accentColor);
    }

    function renderColorPicker() {
        colorPickerContainer.innerHTML = '';
        const colors = colorPalettes[state.template];
        
        colors.forEach((color, idx) => {
            const dot = document.createElement('div');
            dot.className = `color-dot${state.accentColor === color.value ? ' active' : ''}`;
            dot.style.backgroundColor = color.value;
            dot.title = color.name;
            
            dot.addEventListener('click', () => {
                // Update active state in UI
                document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
                
                // Update state and apply
                state.accentColor = color.value;
                applyAccentColor(color.value);
            });
            
            colorPickerContainer.appendChild(dot);
        });
    }

    function applyAccentColor(color) {
        // Dynamically configure custom variables based on selected theme
        if (state.template === 'neon') {
            cardPreviewElement.style.setProperty('--neon-pink', color);
            // Derive a subtle outer glow shadow
            cardPreviewElement.style.boxShadow = `0 0 25px rgba(${hexToRgb(color)}, 0.35), 0 20px 50px rgba(0,0,0,0.7)`;
        } else if (state.template === 'retro') {
            cardPreviewElement.style.setProperty('--retro-red', color);
        } else if (state.template === 'mix') {
            cardPreviewElement.style.setProperty('--neon-cyan', color);
            cardPreviewElement.style.boxShadow = `0 0 25px rgba(${hexToRgb(color)}, 0.3), 0 20px 50px rgba(0,0,0,0.8)`;
        }
    }

    // Helper: HEX to RGB string
    function hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
        return result 
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '255, 0, 127';
    }

    // ==========================================================================
    // IMAGE UPLOADER & DRAG-TO-PAN LOGIC
    // ==========================================================================
    function setupDragAndDrop() {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
            }, false);
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                inputFile.files = files;
                handleFile(files[0]);
            }
        });
    }

    function handleFileSelect(e) {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    }

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                state.image = img;
                state.imageLoaded = true;
                
                // Reset positions
                state.imgScale = 1.0;
                state.imgX = 0;
                state.imgY = 0;
                
                // Calculate display dimension bounds inside the 175px preview circle
                const targetDim = 175;
                const aspect = img.width / img.height;
                
                if (aspect >= 1) {
                    // Landscape
                    state.imgDisplayHeight = targetDim;
                    state.imgDisplayWidth = targetDim * aspect;
                    state.imgDisplayTop = 0;
                    state.imgDisplayLeft = (targetDim - state.imgDisplayWidth) / 2;
                } else {
                    // Portrait
                    state.imgDisplayWidth = targetDim;
                    state.imgDisplayHeight = targetDim / aspect;
                    state.imgDisplayLeft = 0;
                    state.imgDisplayTop = (targetDim - state.imgDisplayHeight) / 2;
                }

                // Render in preview panel
                renderPreviewImage();
                
                // Enable controls
                imageControlsGroup.classList.remove('disabled');
                inputZoom.value = 1.0;
                inputZoom.min = 0.5;
                inputZoom.max = 3.0;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function renderPreviewImage() {
        if (!state.imageLoaded) return;
        
        profileImgDraggable.innerHTML = '';
        const imgEl = document.createElement('img');
        imgEl.src = state.image.src;
        imgEl.style.width = `${state.imgDisplayWidth}px`;
        imgEl.style.height = `${state.imgDisplayHeight}px`;
        imgEl.style.left = `${state.imgDisplayLeft}px`;
        imgEl.style.top = `${state.imgDisplayTop}px`;
        
        // Apply transform modifications
        imgEl.style.transform = `translate(${state.imgX}px, ${state.imgY}px) scale(${state.imgScale})`;
        
        profileImgDraggable.appendChild(imgEl);
    }

    function handleZoomChange(e) {
        if (!state.imageLoaded) return;
        state.imgScale = parseFloat(e.target.value);
        updateImageTransform();
    }

    function updateImageTransform() {
        const imgEl = profileImgDraggable.querySelector('img');
        if (imgEl) {
            imgEl.style.transform = `translate(${state.imgX}px, ${state.imgY}px) scale(${state.imgScale})`;
        }
    }

    function resetImagePosition() {
        if (!state.imageLoaded) return;
        state.imgScale = 1.0;
        state.imgX = 0;
        state.imgY = 0;
        inputZoom.value = 1.0;
        updateImageTransform();
    }

    function setupDragToPan() {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        
        // Start dragging
        const dragStart = (clientX, clientY) => {
            if (!state.imageLoaded) return;
            isDragging = true;
            startX = clientX - state.imgX;
            startY = clientY - state.imgY;
            profileCropContainer.style.cursor = 'grabbing';
        };

        // Dragging
        const dragMove = (clientX, clientY) => {
            if (!isDragging) return;
            state.imgX = clientX - startX;
            state.imgY = clientY - startY;
            updateImageTransform();
        };

        // End dragging
        const dragEnd = () => {
            isDragging = false;
            profileCropContainer.style.cursor = 'grab';
        };

        // Mouse Events
        profileCropContainer.addEventListener('mousedown', (e) => {
            dragStart(e.clientX, e.clientY);
        });
        
        window.addEventListener('mousemove', (e) => {
            dragMove(e.clientX, e.clientY);
        });
        
        window.addEventListener('mouseup', dragEnd);

        // Touch Events
        profileCropContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                dragStart(e.touches[0].clientX, e.touches[0].clientY);
            }
        });
        
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                dragMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        });
        
        window.addEventListener('touchend', dragEnd);
    }

    // ==========================================================================
    // CANVAS HIGH-RESOLUTION PASS GENERATOR (EXPORT ENGINE)
    // ==========================================================================
    function handleDownload() {
        // Check if name is entered
        if (!inputName.value.trim()) {
            alert('Please enter your Name before downloading.');
            inputName.focus();
            return;
        }

        if (!state.imageLoaded) {
            alert('Please upload a photo for your pass.');
            inputFile.click();
            return;
        }

        // Trigger loading text or state
        const btnText = btnDownloadPass.querySelector('.btn-text');
        const originalText = btnText.textContent;
        btnText.textContent = 'Generating Pass...';
        btnDownloadPass.disabled = true;

        // Force a brief delay for UX and rendering threads
        setTimeout(() => {
            try {
                generateCanvasPass();
            } catch (err) {
                console.error(err);
                alert('An error occurred during image generation. Please try again.');
            } finally {
                btnText.textContent = originalText;
                btnDownloadPass.disabled = false;
            }
        }, 300);
    }

    function generateCanvasPass() {
        // High resolution Dimensions (aspect ratio 4:5)
        const canvasWidth = 1000;
        const canvasHeight = 1250;
        
        renderCanvas.width = canvasWidth;
        renderCanvas.height = canvasHeight;
        
        const ctx = renderCanvas.getContext('2d');
        const scale = 2.5; // Scale multiplier (1000px width / 400px preview width = 2.5)

        // Reset canvas settings
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // DRAW TEMPLATE STYLES
        if (state.template === 'neon') {
            drawNeonPass(ctx, scale);
        } else if (state.template === 'retro') {
            drawRetroPass(ctx, scale);
        } else if (state.template === 'mix') {
            drawMixPass(ctx, scale);
        }

        // Trigger immediate browser download
        const dataUrl = renderCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `hacker_pass_${state.name.trim().toLowerCase().replace(/\s+/g, '_') || 'pass'}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- CANVAS RENDERER: MODERN NEON ---
    function drawNeonPass(ctx, scale) {
        const accent = state.accentColor;
        const cyan = '#00f0ff';

        // 1. Background
        ctx.fillStyle = '#0b0d19';
        ctx.fillRect(0, 0, 1000, 1250);

        // 2. Background Gridlines
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.06;
        const gridSize = 15 * scale;
        for (let x = 0; x < 1000; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 1250);
            ctx.stroke();
        }
        for (let y = 0; y < 1250; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(1000, y);
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0; // Reset opacity

        // 3. Neon Outer Glow Border
        ctx.shadowColor = accent;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        // Draw round rect for card edges
        ctx.roundRect(10, 10, 980, 1230, 24 * scale);
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow

        // 4. Cyan Inner Thin Border
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.roundRect(25 * scale, 25 * scale, 350 * scale, 450 * scale, 14 * scale);
        ctx.stroke();

        // 5. Draw Profile Image (Clipped inside Circle)
        // Preview coordinates: Center X = 200, Y = 240. Circle Radius = 87.5.
        const centerX = 200 * scale;
        const centerY = 240 * scale;
        const radius = 87.5 * scale;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();
        
        if (state.imageLoaded) {
            // Draw translated and scaled image
            // Formulas: 
            // x = (cropCircleLeft + displayLeft + imgX) * scale
            // y = (cropCircleTop + displayTop + imgY) * scale
            // w = displayWidth * zoom * scale
            // h = displayHeight * zoom * scale
            const cropCircleLeft = 200 - 87.5;
            const cropCircleTop = 240 - 87.5;
            
            const dx = (cropCircleLeft + state.imgDisplayLeft + state.imgX) * scale;
            const dy = (cropCircleTop + state.imgDisplayTop + state.imgY) * scale;
            const dw = state.imgDisplayWidth * state.imgScale * scale;
            const dh = state.imgDisplayHeight * state.imgScale * scale;
            
            ctx.drawImage(state.image, dx, dy, dw, dh);
        }
        ctx.restore();

        // 6. Draw Profile Circle Border (Neon Pink Glow)
        ctx.shadowColor = accent;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow

        // 7. Top Left Circle Stamp: "BUILD IN GOA • SHIP FROM PARADISE •"
        ctx.save();
        ctx.translate(57 * scale, 57 * scale);
        ctx.shadowColor = cyan;
        ctx.shadowBlur = 5;
        ctx.strokeStyle = cyan;
        ctx.lineWidth = 0.5 * scale;
        
        // Inner circle line
        ctx.beginPath();
        ctx.arc(0, 0, 16 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Circular Text (Canvas draw)
        const text = "BUILD IN GOA • SHIP FROM PARADISE • ";
        ctx.fillStyle = cyan;
        ctx.font = `bold ${8.8 * 0.4 * scale}px Orbitron`;
        ctx.textAlign = 'center';
        
        for (let i = 0; i < text.length; i++) {
            ctx.save();
            // Distribute characters around circle path (radius ~ 21px)
            const angle = (i / text.length) * Math.PI * 2;
            ctx.rotate(angle);
            ctx.fillText(text[i], 0, -21 * scale);
            ctx.restore();
        }

        // Mini palm tree inside stamp
        ctx.fillStyle = cyan;
        ctx.scale(0.3 * scale, 0.3 * scale);
        ctx.beginPath();
        ctx.moveTo(-5, 15); ctx.quadraticCurveTo(-7, 0, -2, -15); ctx.quadraticCurveTo(0, -25, 5, -25);
        ctx.quadraticCurveTo(7, -25, 5, -15); ctx.quadraticCurveTo(2, 0, 3, 15); ctx.closePath(); ctx.fill();
        
        // Fronds
        ctx.beginPath(); ctx.moveTo(-1, -15); ctx.quadraticCurveTo(-15, -18, -20, -10); ctx.quadraticCurveTo(-15, -5, -1, -10); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(1, -15); ctx.quadraticCurveTo(15, -18, 20, -10); ctx.quadraticCurveTo(15, -5, 1, -10); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-1, -20); ctx.quadraticCurveTo(-18, -15, -22, -5); ctx.quadraticCurveTo(-15, 1, -1, -15); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(1, -20); ctx.quadraticCurveTo(18, -15, 22, -5); ctx.quadraticCurveTo(15, 1, 1, -15); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, -25); ctx.quadraticCurveTo(0, -38, 10, -35); ctx.quadraticCurveTo(5, -25, 0, -25); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, -25); ctx.quadraticCurveTo(-5, -38, -10, -35); ctx.quadraticCurveTo(-5, -25, 0, -25); ctx.closePath(); ctx.fill();
        ctx.restore();

        // 8. Top Right Palm Ornament
        ctx.save();
        ctx.translate(343 * scale, 57 * scale);
        ctx.fillStyle = cyan;
        ctx.shadowColor = cyan;
        ctx.shadowBlur = 10;
        
        // Trunk
        ctx.beginPath();
        ctx.moveTo(0, 20 * scale);
        ctx.bezierCurveTo(-3 * scale, 10 * scale, -2 * scale, 0 * scale, 2 * scale, -10 * scale);
        ctx.bezierCurveTo(3 * scale, -15 * scale, 5 * scale, -20 * scale, 7 * scale, -20 * scale);
        ctx.bezierCurveTo(8 * scale, -20 * scale, 7 * scale, -15 * scale, 5 * scale, -10 * scale);
        ctx.bezierCurveTo(2 * scale, 0 * scale, 1 * scale, 10 * scale, 2 * scale, 20 * scale);
        ctx.closePath(); ctx.fill();

        // Leaves
        const drawFrond = (ctrlX, ctrlY, endX, endY, backCtrlX, backCtrlY) => {
            ctx.beginPath();
            ctx.moveTo(4 * scale, -10 * scale);
            ctx.quadraticCurveTo(ctrlX * scale, ctrlY * scale, endX * scale, endY * scale);
            ctx.quadraticCurveTo(backCtrlX * scale, backCtrlY * scale, 4 * scale, -10 * scale);
            ctx.closePath(); ctx.fill();
        };
        drawFrond(-10, -18, -22, -5, -14, 0);   // left low
        drawFrond(10, -18, 22, -5, 14, 0);     // right low
        drawFrond(-5, -25, -20, -16, -10, -8);  // left mid
        drawFrond(5, -25, 20, -16, 10, -8);    // right mid
        drawFrond(6, -38, 18, -35, 5, -25);    // top right
        drawFrond(-6, -38, -18, -35, -5, -25);  // top left
        ctx.restore();

        // 9. Header Branding
        ctx.shadowColor = accent;
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${1.55 * scale}px Orbitron`;
        ctx.textAlign = 'center';
        ctx.fillText("HACKER HOUSE", 500, 50 * scale);

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = cyan;
        ctx.shadowBlur = 5;
        ctx.font = `bold ${0.85 * scale}px Orbitron`;
        ctx.letterSpacing = '10px'; // (experimental canvas feature, manual gaps fallback)
        ctx.fillText("GOA 2026", 500, 72 * scale);
        ctx.shadowBlur = 0; // Reset

        // 10. Left side Badges
        const badgeNames = ["BUILD", "SHIP", "REPEAT"];
        const badgeIcons = ["</>", "🚀", "🔄"];
        
        badgeNames.forEach((name, i) => {
            const badgeY = (112 + i * 55) * scale;
            const badgeX = 35 * scale;
            const size = 32 * scale;

            // Box outline
            ctx.strokeStyle = i === 2 ? cyan : accent;
            ctx.lineWidth = 1 * scale;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.shadowColor = i === 2 ? cyan : accent;
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, size, size, 8 * scale);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Icon
            ctx.fillStyle = i === 2 ? cyan : accent;
            ctx.font = `bold ${10 * scale}px 'Plus Jakarta Sans'`;
            ctx.textAlign = 'center';
            ctx.fillText(badgeIcons[i], badgeX + size / 2, badgeY + size / 2 + 3.5 * scale);

            // Label Text
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${6.5 * scale}px Orbitron`;
            ctx.textAlign = 'center';
            ctx.fillText(name, badgeX + size / 2, badgeY + size + 10 * scale);
        });

        // 11. Right side Vertical Slogan
        ctx.save();
        ctx.translate(365 * scale, 240 * scale);
        ctx.rotate(Math.PI / 2); // Rotate text downwards
        ctx.fillStyle = accent;
        ctx.shadowColor = accent;
        ctx.shadowBlur = 8;
        ctx.font = `900 ${8.5 * scale}px Orbitron`;
        ctx.textAlign = 'center';
        ctx.fillText("LET'S BUILD THE FUTURE", 0, 0);
        ctx.restore();

        // 12. Bottom Nameplate
        const plateY = 405 * scale;
        const plateH = 50 * scale;
        ctx.shadowColor = accent;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2 * scale;
        ctx.fillStyle = 'rgba(11, 13, 25, 0.9)';
        ctx.beginPath();
        ctx.roundRect(25 * scale, plateY, 350 * scale, plateH, 12 * scale);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // User Name
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${19.5 * scale}px 'Plus Jakarta Sans'`;
        ctx.textAlign = 'center';
        let nameText = state.name.trim().toUpperCase() || "MADHAVAN SINGH";
        if (state.age) nameText += `, ${state.age}`;
        ctx.fillText(nameText, 500, plateY + 20 * scale);

        // User Profession
        ctx.fillStyle = accent;
        ctx.font = `bold ${10 * scale}px Orbitron`;
        ctx.fillText(
            state.profession === 'CUSTOM' 
                ? (state.customProfession.trim().toUpperCase() || 'DEVELOPER')
                : state.profession, 
            500, 
            plateY + 36 * scale
        );

        // 13. Card Footer Metadata
        const footerY = 485 * scale;
        ctx.fillStyle = accent;
        ctx.font = `bold ${7.5 * scale}px Orbitron`;
        ctx.textAlign = 'center';

        const footText = `OCT 28 - 31, 2026     |     GOA, INDIA     |     🌴`;
        ctx.fillText(footText, 500, footerY);
    }

    // --- CANVAS RENDERER: TROPICAL RETRO ---
    function drawRetroPass(ctx, scale) {
        const cream = '#faf5e6';
        const green = '#183c2e';
        const red = state.accentColor; // Main theme red config
        const gold = '#f5c453';
        const brown = '#7b4a21';

        // 1. Card Base Background & Border
        ctx.fillStyle = green;
        ctx.fillRect(0, 0, 1000, 1250);

        ctx.fillStyle = cream;
        ctx.fillRect(30, 30, 940, 1190);

        // 2. Profile Image Clipped inside Circle
        const centerX = 200 * scale;
        const centerY = 240 * scale;
        const radius = 85 * scale;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();
        
        if (state.imageLoaded) {
            const cropCircleLeft = 200 - 87.5;
            const cropCircleTop = 240 - 87.5;
            
            const dx = (cropCircleLeft + state.imgDisplayLeft + state.imgX) * scale;
            const dy = (cropCircleTop + state.imgDisplayTop + state.imgY) * scale;
            const dw = state.imgDisplayWidth * state.imgScale * scale;
            const dh = state.imgDisplayHeight * state.imgScale * scale;
            
            ctx.drawImage(state.image, dx, dy, dw, dh);
        } else {
            // Draw a flat colored circle placeholder
            ctx.fillStyle = '#e9e3ce';
            ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
        }
        ctx.restore();

        // 3. Dashed Circle Frame (Alternating Red / Green Retro)
        ctx.strokeStyle = red;
        ctx.lineWidth = 3.5 * scale;
        ctx.setLineDash([12 * scale, 8 * scale]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 2 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // 4. Top Ribbon Flag (GOA 2026)
        ctx.fillStyle = red;
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        const rx = 172.5 * scale;
        const ry = 12 * scale;
        const rw = 55 * scale;
        const rh = 68 * scale;
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + rw, ry);
        ctx.lineTo(rx + rw, ry + rh * 0.85);
        ctx.lineTo(rx + rw/2, ry + rh);
        ctx.lineTo(rx, ry + rh * 0.85);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Ribbon text & palm
        ctx.fillStyle = gold;
        ctx.font = `bold ${8 * scale}px 'Lilita One'`;
        ctx.textAlign = 'center';
        ctx.fillText("GOA", rx + rw/2, ry + rh * 0.55);
        ctx.fillText("2026", rx + rw/2, ry + rh * 0.77);

        // Ribbon gold palm tree icon
        ctx.font = `bold ${10 * scale}px 'Font Awesome 6 Free'`;
        ctx.fillText("🌴", rx + rw/2, ry + rh * 0.28);

        // 5. Left Stamp: Postage Stamp (GOA INDIA)
        ctx.save();
        ctx.translate(50 * scale, 45 * scale);
        ctx.rotate(-10 * Math.PI / 180);
        ctx.fillStyle = cream;
        // Shadow for stamp depth
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 5;
        // Stamp boundary rect
        ctx.fillRect(-32.5 * scale, -32.5 * scale, 65 * scale, 65 * scale);
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = green;
        ctx.lineWidth = 1.5 * scale;
        ctx.strokeRect(-30 * scale, -30 * scale, 60 * scale, 60 * scale);
        
        ctx.setLineDash([2 * scale, 2 * scale]);
        ctx.strokeRect(-27 * scale, -27 * scale, 54 * scale, 54 * scale);
        ctx.setLineDash([]);

        ctx.fillStyle = green;
        ctx.font = `900 ${5.8 * scale}px 'Lilita One'`;
        ctx.textAlign = 'center';
        ctx.fillText("GOA INDIA", 0, -12 * scale);
        
        ctx.fillStyle = red;
        ctx.font = `normal ${15 * scale}px 'Font Awesome 6 Free'`;
        ctx.fillText("🏖️", 0, 7 * scale);
        
        ctx.fillStyle = green;
        ctx.font = `bold ${4.5 * scale}px 'Plus Jakarta Sans'`;
        ctx.fillText("EST. 2026", 0, 20 * scale);
        ctx.restore();

        // 6. Right Stamp: Circular Postmark Stamp
        ctx.save();
        ctx.translate(350 * scale, 45 * scale);
        ctx.rotate(15 * Math.PI / 180);
        ctx.strokeStyle = 'rgba(24, 60, 46, 0.4)';
        ctx.lineWidth = 1.25 * scale;
        
        ctx.beginPath();
        ctx.arc(0, 0, 30 * scale, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.setLineDash([4 * scale, 3 * scale]);
        ctx.beginPath();
        ctx.arc(0, 0, 27 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Circular postmark text
        const postText = "BUILD IN GOA • SHIP FROM PARADISE • ";
        ctx.fillStyle = 'rgba(24, 60, 46, 0.4)';
        ctx.font = `bold ${3.5 * scale}px 'Plus Jakarta Sans'`;
        ctx.textAlign = 'center';
        for (let i = 0; i < postText.length; i++) {
            ctx.save();
            ctx.rotate((i / postText.length) * Math.PI * 2);
            ctx.fillText(postText[i], 0, -21 * scale);
            ctx.restore();
        }
        ctx.restore();

        // 7. Header Branding
        ctx.fillStyle = green;
        ctx.font = `900 ${2.1 * scale}px 'Lilita One'`;
        ctx.textAlign = 'center';
        ctx.fillText("HACKER HOUSE", 500, 95 * scale);

        ctx.fillStyle = red;
        ctx.font = `bold ${0.95 * scale}px 'Lilita One'`;
        ctx.fillText("GOA 2026", 500, 115 * scale);

        // 8. Left Wooden Signboards
        // Draw the pole
        ctx.fillStyle = brown;
        ctx.fillRect(48 * scale, 125 * scale, 6 * scale, 240 * scale);
        
        const woodOptions = [
            { text: "BUILD", color: gold, arrow: 'right' },
            { text: "SHIP", color: red, arrow: 'left' },
            { text: "REPEAT", color: '#477651', arrow: 'rect' }
        ];

        woodOptions.forEach((opt, idx) => {
            ctx.save();
            const bx = 22 * scale;
            const by = (145 + idx * 60) * scale;
            const bw = 58 * scale;
            const bh = 22 * scale;

            ctx.fillStyle = opt.color;
            ctx.strokeStyle = green;
            ctx.lineWidth = 1.5 * scale;
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 4;
            
            ctx.beginPath();
            if (opt.arrow === 'right') {
                // Point pointing right
                ctx.moveTo(bx, by);
                ctx.lineTo(bx + bw - 10 * scale, by);
                ctx.lineTo(bx + bw, by + bh/2);
                ctx.lineTo(bx + bw - 10 * scale, by + bh);
                ctx.lineTo(bx, by + bh);
            } else if (opt.arrow === 'left') {
                // Point pointing left
                ctx.moveTo(bx + 10 * scale, by);
                ctx.lineTo(bx + bw, by);
                ctx.lineTo(bx + bw, by + bh);
                ctx.lineTo(bx + 10 * scale, by + bh);
                ctx.lineTo(bx, by + bh/2);
            } else {
                // Standard Rect
                ctx.rect(bx, by, bw, bh);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Board text
            ctx.fillStyle = opt.color === gold ? green : '#ffffff';
            ctx.font = `bold ${8.5 * scale}px 'Lilita One'`;
            ctx.textAlign = 'center';
            ctx.fillText(opt.text, bx + bw/2, by + bh/2 + 3 * scale);
            ctx.restore();
        });

        // 9. Right speech bubble
        ctx.save();
        ctx.translate(340 * scale, 150 * scale);
        ctx.rotate(8 * Math.PI / 180);
        
        ctx.fillStyle = gold;
        ctx.strokeStyle = green;
        ctx.lineWidth = 2 * scale;
        
        // Rounded speech bubble
        ctx.beginPath();
        ctx.roundRect(-20 * scale, -15 * scale, 40 * scale, 24 * scale, 8 * scale);
        ctx.fill();
        ctx.stroke();
        
        // Triangle arrow
        ctx.fillStyle = gold;
        ctx.beginPath();
        ctx.moveTo(-10 * scale, 9 * scale);
        ctx.lineTo(-6 * scale, 16 * scale);
        ctx.lineTo(-2 * scale, 9 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-10 * scale, 9 * scale);
        ctx.lineTo(-6 * scale, 16 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-2 * scale, 9 * scale);
        ctx.lineTo(-6 * scale, 16 * scale);
        ctx.stroke();

        ctx.fillStyle = green;
        ctx.font = `bold ${7 * scale}px 'Lilita One'`;
        ctx.textAlign = 'center';
        ctx.fillText("LET'S", 0, -4 * scale);
        ctx.fillText("BUILD!", 0, 4 * scale);
        ctx.restore();

        // 10. Bottom-Right Illustrations (House and Scooter outlines)
        // House base coordinates: X = 330, Y = 280
        ctx.save();
        ctx.translate(330 * scale, 245 * scale);
        ctx.fillStyle = 'rgba(24, 60, 46, 0.1)';
        ctx.strokeStyle = green;
        ctx.lineWidth = 2 * scale;
        
        // Draw House Walls
        ctx.beginPath();
        ctx.rect(-15 * scale, 0, 40 * scale, 35 * scale);
        ctx.fill();
        ctx.stroke();

        // Roof
        ctx.fillStyle = 'rgba(201, 75, 50, 0.25)';
        ctx.beginPath();
        ctx.moveTo(-20 * scale, 0);
        ctx.lineTo(5 * scale, -20 * scale);
        ctx.lineTo(30 * scale, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Windows
        ctx.strokeRect(-9 * scale, 8 * scale, 9 * scale, 9 * scale);
        ctx.strokeRect(10 * scale, 8 * scale, 9 * scale, 9 * scale);
        // Door
        ctx.strokeRect(1 * scale, 20 * scale, 8 * scale, 15 * scale);
        
        // Scooter (placed in front of house)
        ctx.translate(2 * scale, 24 * scale);
        ctx.strokeStyle = green;
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 1.5 * scale;
        
        // Wheels
        ctx.beginPath(); ctx.arc(-15 * scale, 10 * scale, 5 * scale, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(10 * scale, 10 * scale, 5 * scale, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Body frame
        ctx.beginPath();
        ctx.moveTo(-15 * scale, 10 * scale);
        ctx.lineTo(-5 * scale, 10 * scale);
        ctx.quadraticCurveTo(0, 8 * scale, 2 * scale, 3 * scale);
        ctx.lineTo(6 * scale, -2 * scale);
        ctx.lineTo(8 * scale, -2 * scale);
        ctx.stroke();
        // Mudguards
        ctx.beginPath(); ctx.arc(-15 * scale, 10 * scale, 6 * scale, Math.PI, 1.7 * Math.PI); ctx.stroke();
        // Scooter Handlebar
        ctx.beginPath();
        ctx.moveTo(-15 * scale, 10 * scale);
        ctx.lineTo(-10 * scale, -5 * scale);
        ctx.lineTo(-5 * scale, -6 * scale);
        ctx.stroke();
        ctx.restore();

        // 11. Bottom Solid Green Nameplate
        const plateY = 405 * scale;
        const plateH = 50 * scale;
        ctx.fillStyle = green;
        ctx.beginPath();
        ctx.roundRect(25 * scale, plateY, 350 * scale, plateH, 12 * scale);
        ctx.fill();

        // User Name text (Retro style display)
        ctx.fillStyle = cream;
        ctx.font = `bold ${19.5 * scale}px 'Lilita One'`;
        ctx.textAlign = 'center';
        let nameText = state.name.trim().toUpperCase() || "MADHAVAN SINGH";
        if (state.age) nameText += `, ${state.age}`;
        ctx.fillText(nameText, 500, plateY + 22 * scale);

        // User Profession text
        ctx.fillStyle = gold;
        ctx.font = `bold ${10 * scale}px 'Lilita One'`;
        ctx.fillText(
            state.profession === 'CUSTOM'
                ? (state.customProfession.trim().toUpperCase() || 'DEVELOPER')
                : state.profession,
            500,
            plateY + 39 * scale
        );

        // 12. Retro Card Footer details
        const footerY = 485 * scale;
        ctx.fillStyle = green;
        ctx.font = `bold ${7.5 * scale}px 'Lilita One'`;
        ctx.textAlign = 'center';
        
        ctx.fillText(`📅  OCT 28 - 31, 2026   •   📍  GOA, INDIA   •   🌴`, 500, footerY);
    }

    // --- CANVAS RENDERER: CYBER-TROPICAL MIX ---
    function drawMixPass(ctx, scale) {
        const accent = state.accentColor;
        const pink = '#ff007f';
        const green = '#39ff14';
        const cyan = '#00f0ff';

        // 1. Background (Mix Sunset Cyber Gradient)
        const grad = ctx.createLinearGradient(0, 0, 1000, 1250);
        grad.addColorStop(0, '#120520');
        grad.addColorStop(0.5, '#2f073a');
        grad.addColorStop(1, '#520f45');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1000, 1250);

        // 2. Cyber background grid
        ctx.strokeStyle = cyan;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.05;
        const gridSize = 20 * scale;
        for (let x = 0; x < 1000; x += gridSize) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1250); ctx.stroke();
        }
        for (let y = 0; y < 1250; y += gridSize) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1000, y); ctx.stroke();
        }
        ctx.globalAlpha = 1.0;

        // 3. Glowing Card Border (Neon Cyan Glow)
        ctx.shadowColor = accent;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.roundRect(10, 10, 980, 1230, 24 * scale);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 4. Center Profile circular crop
        const centerX = 200 * scale;
        const centerY = 240 * scale;
        const radius = 86 * scale;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();
        
        if (state.imageLoaded) {
            const cropCircleLeft = 200 - 87.5;
            const cropCircleTop = 240 - 87.5;
            
            const dx = (cropCircleLeft + state.imgDisplayLeft + state.imgX) * scale;
            const dy = (cropCircleTop + state.imgDisplayTop + state.imgY) * scale;
            const dw = state.imgDisplayWidth * state.imgScale * scale;
            const dh = state.imgDisplayHeight * state.imgScale * scale;
            
            ctx.drawImage(state.image, dx, dy, dw, dh);
        }
        ctx.restore();

        // 5. Double Glowing profile circle borders (Lime Green + Neon green)
        ctx.shadowColor = green;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = green;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 2 * scale, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = green;
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 5 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 6. Top Left Stamp: Green Circular Stamp
        ctx.save();
        ctx.translate(57 * scale, 57 * scale);
        ctx.shadowColor = green;
        ctx.shadowBlur = 6;
        ctx.strokeStyle = green;
        ctx.lineWidth = 0.75 * scale;
        
        ctx.beginPath();
        ctx.arc(0, 0, 16 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        const text = "BUILD IN GOA • SHIP FROM PARADISE • ";
        ctx.fillStyle = green;
        ctx.font = `bold ${8.8 * 0.4 * scale}px Orbitron`;
        ctx.textAlign = 'center';
        for (let i = 0; i < text.length; i++) {
            ctx.save();
            ctx.rotate((i / text.length) * Math.PI * 2);
            ctx.fillText(text[i], 0, -21 * scale);
            ctx.restore();
        }
        ctx.restore();

        // 7. Top Right Stamp: Neon Palm Icon
        ctx.save();
        ctx.translate(343 * scale, 57 * scale);
        ctx.fillStyle = cyan;
        ctx.shadowColor = cyan;
        ctx.shadowBlur = 10;
        
        // Trunk
        ctx.beginPath();
        ctx.moveTo(0, 20 * scale);
        ctx.bezierCurveTo(-3 * scale, 10 * scale, -2 * scale, 0 * scale, 2 * scale, -10 * scale);
        ctx.bezierCurveTo(3 * scale, -15 * scale, 5 * scale, -20 * scale, 7 * scale, -20 * scale);
        ctx.bezierCurveTo(8 * scale, -20 * scale, 7 * scale, -15 * scale, 5 * scale, -10 * scale);
        ctx.bezierCurveTo(2 * scale, 0 * scale, 1 * scale, 10 * scale, 2 * scale, 20 * scale);
        ctx.closePath(); ctx.fill();

        // Leaves
        const drawFrond = (ctrlX, ctrlY, endX, endY, backCtrlX, backCtrlY) => {
            ctx.beginPath();
            ctx.moveTo(4 * scale, -10 * scale);
            ctx.quadraticCurveTo(ctrlX * scale, ctrlY * scale, endX * scale, endY * scale);
            ctx.quadraticCurveTo(backCtrlX * scale, backCtrlY * scale, 4 * scale, -10 * scale);
            ctx.closePath(); ctx.fill();
        };
        drawFrond(-10, -18, -22, -5, -14, 0);
        drawFrond(10, -18, 22, -5, 14, 0);
        drawFrond(-5, -25, -20, -16, -10, -8);
        drawFrond(5, -25, 20, -16, 10, -8);
        drawFrond(6, -38, 18, -35, 5, -25);
        drawFrond(-6, -38, -18, -35, -5, -25);
        ctx.restore();

        // 8. Header branding
        ctx.shadowColor = cyan;
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${1.55 * scale}px Orbitron`;
        ctx.textAlign = 'center';
        ctx.fillText("HACKER HOUSE", 500, 50 * scale);

        ctx.fillStyle = pink;
        ctx.shadowColor = pink;
        ctx.shadowBlur = 5;
        ctx.font = `bold ${0.95 * scale}px 'Lilita One'`;
        ctx.fillText("GOA 2026", 500, 72 * scale);
        ctx.shadowBlur = 0;

        // 9. Left Side Cyber-Wooden Signboards
        // Vertical connecting pole
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = 1.5 * scale;
        ctx.shadowColor = cyan;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(36 * scale, 100 * scale);
        ctx.lineTo(36 * scale, 275 * scale);
        ctx.stroke();
        ctx.shadowBlur = 0;

        const mixBadges = [
            { text: "BUILD", color: pink, icon: "</>" },
            { text: "SHIP", color: green, icon: "🚀" },
            { text: "REPEAT", color: cyan, icon: "🔄" }
        ];

        mixBadges.forEach((b, i) => {
            const bx = 16 * scale;
            const by = (112 + i * 55) * scale;
            const bw = 40 * scale;
            const bh = 22 * scale;

            // Box shape
            ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            ctx.strokeStyle = b.color;
            ctx.lineWidth = 1 * scale;
            ctx.shadowColor = b.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.roundRect(bx, by, bw, bh, 4 * scale);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Icon + Text
            ctx.fillStyle = b.color;
            ctx.font = `bold ${5.5 * scale}px Orbitron`;
            ctx.textAlign = 'center';
            ctx.fillText(`${b.icon} ${b.text}`, bx + bw/2, by + bh/2 + 2.5 * scale);
        });

        // 10. Right Side illustrations (Glowing Vespa + House)
        ctx.save();
        ctx.translate(330 * scale, 245 * scale);
        ctx.strokeStyle = pink;
        ctx.fillStyle = 'rgba(255, 0, 127, 0.05)';
        ctx.lineWidth = 1.5 * scale;
        ctx.shadowColor = pink;
        ctx.shadowBlur = 8;

        // House
        ctx.beginPath();
        ctx.rect(-15 * scale, 0, 40 * scale, 35 * scale);
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-20 * scale, 0); ctx.lineTo(5 * scale, -20 * scale); ctx.lineTo(30 * scale, 0); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.strokeRect(-9 * scale, 8 * scale, 9 * scale, 9 * scale);
        ctx.strokeRect(10 * scale, 8 * scale, 9 * scale, 9 * scale);
        ctx.strokeRect(1 * scale, 20 * scale, 8 * scale, 15 * scale);
        ctx.shadowBlur = 0;

        // Scooter
        ctx.translate(2 * scale, 24 * scale);
        ctx.strokeStyle = cyan;
        ctx.fillStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.lineWidth = 1.5 * scale;
        ctx.shadowColor = cyan;
        ctx.shadowBlur = 8;
        
        ctx.beginPath(); ctx.arc(-15 * scale, 10 * scale, 5 * scale, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(10 * scale, 10 * scale, 5 * scale, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-15 * scale, 10 * scale); ctx.lineTo(-5 * scale, 10 * scale);
        ctx.quadraticCurveTo(0, 8 * scale, 2 * scale, 3 * scale); ctx.lineTo(6 * scale, -2 * scale); ctx.lineTo(8 * scale, -2 * scale);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(-15 * scale, 10 * scale, 6 * scale, Math.PI, 1.7 * Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-15 * scale, 10 * scale); ctx.lineTo(-10 * scale, -5 * scale); ctx.lineTo(-5 * scale, -6 * scale); ctx.stroke();
        ctx.restore();

        // 11. Bottom Glassmorphic Nameplate
        const plateY = 405 * scale;
        const plateH = 50 * scale;
        ctx.fillStyle = 'rgba(18, 5, 32, 0.85)';
        ctx.strokeStyle = cyan;
        ctx.lineWidth = 1.5 * scale;
        ctx.shadowColor = cyan;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(25 * scale, plateY, 350 * scale, plateH, 12 * scale);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // User Name
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${19.5 * scale}px 'Lilita One'`;
        ctx.textAlign = 'center';
        let nameText = state.name.trim().toUpperCase() || "MADHAVAN SINGH";
        if (state.age) nameText += `, ${state.age}`;
        ctx.fillText(nameText, 500, plateY + 22 * scale);

        // User Profession
        ctx.fillStyle = green;
        ctx.font = `bold ${10 * scale}px Orbitron`;
        ctx.shadowColor = green;
        ctx.shadowBlur = 4;
        ctx.fillText(
            state.profession === 'CUSTOM'
                ? (state.customProfession.trim().toUpperCase() || 'DEVELOPER')
                : state.profession,
            500,
            plateY + 38 * scale
        );
        ctx.shadowBlur = 0;

        // 12. Footer Metadata
        const footerY = 485 * scale;
        ctx.fillStyle = cyan;
        ctx.font = `bold ${7.5 * scale}px Orbitron`;
        ctx.textAlign = 'center';
        ctx.fillText(`OCT 28 - 31, 2026     |     GOA, INDIA     |     🌴`, 500, footerY);
    }
});
