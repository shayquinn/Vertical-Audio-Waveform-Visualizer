// ==UserScript==
// @name         Vertical Audio Waveform Visualizer
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Shows a vertical audio waveform visualization bar when audio is playing
// @author       You
// @match        *://*/*
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        barWidth: 120,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        smoothing: 0.8,
        numBars: 40, // Number of frequency bars
        barSpacing: 2,
        barColor: '#00ff88',
        animationSpeed: 0.15,
        peakHold: true, // Keep peak values briefly
        peakDecay: 0.97,
        dragHueSensitivity: 0.5,
        dragBarSensitivity: 3,
        showDragInfo: true
    };

    // Create visualization container
    const visualizerContainer = document.createElement('div');
    visualizerContainer.id = 'audioWaveformBar';
    Object.assign(visualizerContainer.style, {
        position: 'fixed',
        top: '0',
        right: '0',
        width: `${CONFIG.barWidth}px`,
        height: '100vh',
        zIndex: '10000',
        pointerEvents: 'auto', // Enable pointer events for dragging
        cursor: 'grab',
        backgroundColor: CONFIG.backgroundColor,
        borderLeft: `1px solid ${CONFIG.borderColor}`,
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 0',
        boxSizing: 'border-box',
        userSelect: 'none', // Prevent text selection while dragging
        touchAction: 'none' // Prevent default touch behaviors
    });

    // Create canvas for visualization
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    Object.assign(canvas.style, {
        width: '100%',
        height: '100%',
        display: 'block'
    });
    visualizerContainer.appendChild(canvas);

    // Audio context and analyzer
    let audioContext = null;
    let analyzer = null;
    let source = null;
    let dataArray = null;
    let animationFrameId = null;
    let isVisualizing = false;
    let activeMediaElement = null;
    
    // Peak tracking
    let peaks = new Array(CONFIG.numBars / 2).fill(0);
    
    // Drag handling for hue rotation and bar adjustment
    let isDragging = false;
    let dragStartY = 0;
    let dragStartX = 0;
    let hueRotation = parseFloat(localStorage.getItem('waveformHueRotation')) || 0; // Degrees to rotate the hue
    let dynamicNumBars = parseInt(localStorage.getItem('waveformBarCount')) || CONFIG.numBars; // Dynamic bar count
    const MIN_BARS = 10;
    const MAX_BARS = 80;
    let settingsChanged = false; // Track if settings need to be saved
    
    // Cache rotated colors for performance
    let cachedColors = {
        '#ff0080': null,
        '#8000ff': null,
        '#0080ff': null,
        '#00ff80': null,
        barColor: null
    };
    let lastHueRotation = null;

    // Resize canvas to match container
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        // Only resize if dimensions actually changed
        const newWidth = rect.width * dpr;
        const newHeight = rect.height * dpr;
        
        if (canvas.width !== newWidth || canvas.height !== newHeight) {
            canvas.width = newWidth;
            canvas.height = newHeight;
            ctx.scale(dpr, dpr);
            console.log('[Visualizer] Canvas resized to:', canvas.width, 'x', canvas.height);
        }
    }

    // Initialize audio context and analyzer
    function initAudioContext() {
        if (audioContext) return;

        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 256;
            analyzer.smoothingTimeConstant = CONFIG.smoothing;
            
            const bufferLength = analyzer.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
        } catch (error) {
            console.error('Error initializing audio context:', error);
        }
    }

    // Connect audio element to analyzer
    function connectAudioElement(audioElement) {
        if (!audioContext) initAudioContext();
        if (!audioContext) return;

        try {
            // Check if already connected
            if (source && audioElement.dataset.visualizerConnected === 'true') {
                console.log('[Visualizer] Already connected, just starting visualization');
                startVisualization();
                return;
            }

            // Disconnect previous source if exists
            if (source) {
                try {
                    source.disconnect();
                } catch (e) {
                    console.log('[Visualizer] Could not disconnect previous source:', e);
                }
            }

            // Create new source
            source = audioContext.createMediaElementSource(audioElement);
            source.connect(analyzer);
            analyzer.connect(audioContext.destination);
            audioElement.dataset.visualizerConnected = 'true';
            console.log('[Visualizer] Audio connected successfully');
            
            // Start visualization
            startVisualization();
        } catch (error) {
            console.error('[Visualizer] Error connecting audio element:', error);
            console.log('[Visualizer] Attempting to start visualization anyway...');
            // Try to visualize anyway in case the element is already connected elsewhere
            startVisualization();
        }
    }

    // Find all audio/video elements on the page
    function findMediaElements() {
        const mediaElements = [];
        
        // Find audio elements
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(el => {
            if (!el.dataset.waveformConnected) {
                el.dataset.waveformConnected = 'true';
                mediaElements.push(el);
            }
        });
        
        // Find video elements
        const videoElements = document.querySelectorAll('video');
        videoElements.forEach(el => {
            if (!el.dataset.waveformConnected) {
                el.dataset.waveformConnected = 'true';
                mediaElements.push(el);
            }
        });
        
        return mediaElements;
    }

    // Monitor for media playing
    function monitorMediaPlayback() {
        const mediaElements = findMediaElements();
        
        mediaElements.forEach(media => {
            // Remove existing listeners to prevent duplicates
            media.removeEventListener('play', handlePlay);
            media.removeEventListener('pause', handlePause);
            media.removeEventListener('ended', handlePause);
            
            // Add new listeners
            media.addEventListener('play', handlePlay);
            media.addEventListener('pause', handlePause);
            media.addEventListener('ended', handlePause);
        });
    }

    function handlePlay(event) {
        const media = event.target;
        console.log('[Visualizer] Media playing detected:', media.tagName, 'Muted:', media.muted);
        
        // Disconnect previous media if different
        if (activeMediaElement && activeMediaElement !== media) {
            console.log('[Visualizer] Switching from previous media source');
            if (source) {
                try {
                    source.disconnect();
                } catch (e) {
                    console.log('[Visualizer] Error disconnecting previous source:', e);
                }
            }
            // Reset connection flag on previous element
            if (activeMediaElement.dataset) {
                activeMediaElement.dataset.visualizerConnected = 'false';
            }
        }
        
        activeMediaElement = media;
        
        if (!media.muted) {
            // Show container FIRST so it has dimensions
            visualizerContainer.style.display = 'flex';
            connectAudioElement(media);
            console.log('[Visualizer] Visualizer activated');
        }
    }

    function handlePause() {
        // Only cleanup if NO media is playing
        const anyPlaying = Array.from(document.querySelectorAll('audio, video'))
            .some(media => !media.paused && !media.muted);
        
        if (!anyPlaying) {
            stopVisualization();
            visualizerContainer.style.display = 'none';
            cleanupVisualizer();
        } else if (activeMediaElement && activeMediaElement.paused) {
            // Current media paused but others might be playing
            // Keep visualizer alive if other media is playing
            const otherPlaying = Array.from(document.querySelectorAll('audio, video'))
                .some(media => media !== activeMediaElement && !media.paused && !media.muted);
            
            if (!otherPlaying) {
                visualizerContainer.style.display = 'none';
                stopVisualization();
            }
        }
    }
    
    // Cleanup function
    function cleanup() {
        stopVisualization();
        visualizerContainer.style.display = 'none';
        activeMediaElement = null;
    }
    
    // Add cleanup function for memory leak prevention
    function cleanupVisualizer() {
        console.log('[Visualizer] Cleaning up resources');
        stopVisualization();
        
        if (source) {
            try {
                source.disconnect();
            } catch (e) {
                console.log('[Visualizer] Error disconnecting source:', e);
            }
            source = null;
        }
        
        if (analyzer) {
            try {
                analyzer.disconnect();
            } catch (e) {
                console.log('[Visualizer] Error disconnecting analyzer:', e);
            }
            analyzer = null;
        }
        
        if (audioContext && audioContext.state !== 'closed') {
            audioContext.close().catch(err => {
                console.error('[Visualizer] Error closing audio context:', err);
            });
            audioContext = null;
        }
        
        dataArray = null;
        isVisualizing = false;
        activeMediaElement = null;
    }

    // Start visualization animation
    function startVisualization() {
        if (isVisualizing) {
            console.log('[Visualizer] Already visualizing');
            return;
        }
        isVisualizing = true;
        console.log('[Visualizer] Starting visualization animation');
        
        // Use setTimeout to ensure container is rendered before resizing
        setTimeout(() => {
            resizeCanvas();
            console.log('[Visualizer] Canvas size:', canvas.width, 'x', canvas.height);
            draw();
        }, 10);
    }

    // Stop visualization
    function stopVisualization() {
        isVisualizing = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Don't clear canvas when stopping, let it show last frame
    }
    
    // Create visual feedback for dragging
    function createDragIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'dragIndicator';
        Object.assign(indicator.style, {
            position: 'fixed',
            top: '50%',
            right: `${CONFIG.barWidth}px`,
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            display: 'none',
            zIndex: '10001',
            whiteSpace: 'nowrap'
        });
        document.body.appendChild(indicator);
        return indicator;
    }
    
    // Add reset button to visualizer
    function addResetButton() {
        const resetBtn = document.createElement('div');
        resetBtn.textContent = '↺';
        resetBtn.title = 'Reset to defaults (or double-click bar)';
        Object.assign(resetBtn.style, {
            position: 'absolute',
            top: '10px',
            right: '10px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            opacity: '0.6',
            zIndex: '1',
            transition: 'opacity 0.2s'
        });
        resetBtn.addEventListener('mouseenter', () => {
            resetBtn.style.opacity = '1';
        });
        resetBtn.addEventListener('mouseleave', () => {
            resetBtn.style.opacity = '0.6';
        });
        resetBtn.addEventListener('click', (e) => {
            hueRotation = 0;
            dynamicNumBars = CONFIG.numBars;
            saveSettings(); // Use helper function
            console.log('[Visualizer] Reset to defaults');
            e.stopPropagation();
        });
        visualizerContainer.appendChild(resetBtn);
    }
    
    // Helper function to rotate hue of a hex color
    function rotateHue(hexColor, degrees) {
        // Convert hex to RGB
        const r = parseInt(hexColor.slice(1, 3), 16) / 255;
        const g = parseInt(hexColor.slice(3, 5), 16) / 255;
        const b = parseInt(hexColor.slice(5, 7), 16) / 255;
        
        // Convert RGB to HSL
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        
        // Rotate hue
        h = (h * 360 + degrees) % 360;
        if (h < 0) h += 360;
        h = h / 360;
        
        // Convert HSL back to RGB
        let r2, g2, b2;
        if (s === 0) {
            r2 = g2 = b2 = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r2 = hue2rgb(p, q, h + 1/3);
            g2 = hue2rgb(p, q, h);
            b2 = hue2rgb(p, q, h - 1/3);
        }
        
        // Convert back to hex
        const toHex = (x) => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return '#' + toHex(r2) + toHex(g2) + toHex(b2);
    }
    
    // Helper function to save settings (debounced)
    function saveSettings() {
        try {
            localStorage.setItem('waveformHueRotation', hueRotation);
            localStorage.setItem('waveformBarCount', dynamicNumBars);
            settingsChanged = false;
        } catch (e) {
            console.error('[Visualizer] Error saving settings:', e);
        }
    }
    
    // Get rotated color with caching for performance
    function getRotatedColor(hexColor) {
        if (hueRotation === lastHueRotation && cachedColors[hexColor]) {
            return cachedColors[hexColor];
        }
        
        if (hueRotation !== lastHueRotation) {
            // Clear cache when hue changes
            Object.keys(cachedColors).forEach(key => {
                cachedColors[key] = null;
            });
            lastHueRotation = hueRotation;
        }
        
        cachedColors[hexColor] = rotateHue(hexColor, hueRotation);
        return cachedColors[hexColor];
    }

    // Draw gradient bar visualization (mirrored from center)
    function drawGradientBars() {
        if (!analyzer || !dataArray) {
            console.log('[Visualizer] No analyzer or dataArray');
            return;
        }
        
        // Get frequency data
        analyzer.getByteFrequencyData(dataArray);
        
        // Check if we're getting data
        const sum = dataArray.reduce((a, b) => a + b, 0);
        if (sum === 0) {
            console.log('[Visualizer] No audio data detected (all zeros)');
        }
        
        const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
        const centerY = canvasHeight / 2;
        
        // Clear canvas
        ctx.fillStyle = CONFIG.backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        const halfBars = Math.floor(dynamicNumBars / 2);
        const barHeight = centerY / halfBars;
        const maxBarWidth = canvasWidth - 10;
        
        // Ensure peaks array matches current bar count
        if (peaks.length !== halfBars) {
            const oldPeaks = peaks;
            peaks = new Array(halfBars).fill(0);
            // Copy over existing peak values where possible
            for (let i = 0; i < Math.min(oldPeaks.length, halfBars); i++) {
                peaks[i] = oldPeaks[i];
            }
        }
        
        // Create gradient for bars (center to edges) with hue rotation
        const gradientTop = ctx.createLinearGradient(0, 0, 0, centerY);
        gradientTop.addColorStop(0, getRotatedColor('#ff0080'));
        gradientTop.addColorStop(0.33, getRotatedColor('#8000ff'));
        gradientTop.addColorStop(0.66, getRotatedColor('#0080ff'));
        gradientTop.addColorStop(1, getRotatedColor('#00ff80'));
        
        const gradientBottom = ctx.createLinearGradient(0, centerY, 0, canvasHeight);
        gradientBottom.addColorStop(0, getRotatedColor('#00ff80'));
        gradientBottom.addColorStop(0.33, getRotatedColor('#0080ff'));
        gradientBottom.addColorStop(0.66, getRotatedColor('#8000ff'));
        gradientBottom.addColorStop(1, getRotatedColor('#ff0080'));
        
        // Draw center bar first (spans across centerline)
        const centerDataIndex = 0;
        const centerValue = dataArray[centerDataIndex] / 255;
        const centerBarWidth = centerValue * maxBarWidth;
        
        // Update peak for center
        if (centerValue > peaks[0]) {
            peaks[0] = centerValue;
        } else if (CONFIG.peakHold) {
            peaks[0] *= CONFIG.peakDecay;
        }
        
        // Draw center bar spanning the centerline with proper spacing
        const centerBarY = centerY - barHeight / 2 + CONFIG.barSpacing;
        ctx.fillStyle = getRotatedColor('#00ff80'); // Use the center gradient color with rotation
        ctx.fillRect(5, centerBarY, centerBarWidth, barHeight - CONFIG.barSpacing * 2);
        
        // Add glow effect for center
        if (centerBarWidth > 20) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = getRotatedColor(CONFIG.barColor);
            ctx.fillRect(5, centerBarY, centerBarWidth, barHeight - CONFIG.barSpacing * 2);
            ctx.shadowBlur = 0;
        }
        
        // Draw peak indicator for center bar
        if (peaks[0] > 0.1) {
            const peakWidth = peaks[0] * maxBarWidth;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(5 + peakWidth - 1, centerBarY, 2, barHeight - CONFIG.barSpacing * 2);
        }
        
        // Draw mirrored bars (starting from i=1 to avoid duplicate center bars)
        for (let i = 1; i < halfBars; i++) {
            const dataIndex = Math.floor(i * dataArray.length / halfBars);
            const value = dataArray[dataIndex] / 255;
            const barWidth = value * maxBarWidth;
            
            // Update peak
            if (value > peaks[i]) {
                peaks[i] = value;
            } else if (CONFIG.peakHold) {
                peaks[i] *= CONFIG.peakDecay;
            }
            
            // Top half (going up from center with equal spacing)
            const yTop = centerY - (i + 0.5) * barHeight + CONFIG.barSpacing;
            ctx.fillStyle = gradientTop;
            ctx.fillRect(5, yTop, barWidth, barHeight - CONFIG.barSpacing * 2);
            
            // Add glow effect for top
            if (barWidth > 20) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = getRotatedColor(CONFIG.barColor);
                ctx.fillRect(5, yTop, barWidth, barHeight - CONFIG.barSpacing * 2);
                ctx.shadowBlur = 0;
            }
            
            // Bottom half (mirrored going down from center with equal spacing)
            const yBottom = centerY + (i - 0.5) * barHeight + CONFIG.barSpacing;
            ctx.fillStyle = gradientBottom;
            ctx.fillRect(5, yBottom, barWidth, barHeight - CONFIG.barSpacing * 2);
            
            // Add glow effect for bottom
            if (barWidth > 20) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = getRotatedColor(CONFIG.barColor);
                ctx.fillRect(5, yBottom, barWidth, barHeight - CONFIG.barSpacing * 2);
                ctx.shadowBlur = 0;
            }
            
            // Draw peak indicator (thin line at peak)
            if (peaks[i] > 0.1) {
                const peakWidth = peaks[i] * maxBarWidth;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(5 + peakWidth - 1, yTop, 2, barHeight - CONFIG.barSpacing * 2);
                ctx.fillRect(5 + peakWidth - 1, yBottom, 2, barHeight - CONFIG.barSpacing * 2);
            }
        }
    }

    // Main draw function
    let frameCount = 0;
    function draw() {
        if (!isVisualizing) return;
        
        // Only animate if page is visible
        if (document.hidden) {
            animationFrameId = requestAnimationFrame(draw);
            return;
        }

        drawGradientBars();
        
        // Log first few frames for debugging
        if (frameCount < 3) {
            console.log('[Visualizer] Drawing frame', frameCount);
            frameCount++;
        }

        // Continue animation
        animationFrameId = requestAnimationFrame(draw);
    }

    // Initialize
    function init() {
        console.log('[Visualizer] Initializing audio waveform visualizer...');
        // Add container to page
        document.body.appendChild(visualizerContainer);
        console.log('[Visualizer] Container added to page');
        
        // Create drag indicator for visual feedback
        const dragIndicator = createDragIndicator();
        
        // Add reset button
        addResetButton();
        
        // Initial monitoring
        monitorMediaPlayback();
        
        // Set up MutationObserver to detect new media elements
        const observer = new MutationObserver((mutations) => {
            let shouldCheck = false;
            
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            if (node.tagName === 'AUDIO' || node.tagName === 'VIDEO' || 
                                node.querySelector('audio, video')) {
                                shouldCheck = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldCheck) {
                monitorMediaPlayback();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Add throttling for resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 100);
        });
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause animation when tab is hidden
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            } else {
                // Resume animation when tab is visible again
                if (isVisualizing && !animationFrameId) {
                    console.log('[Visualizer] Resuming visualization after tab switch');
                    draw();
                }
            }
        });
        
        // Listen for page unload to cleanup resources
        window.addEventListener('beforeunload', cleanupVisualizer);
        
        // Add drag handlers for hue rotation and bar adjustment
        visualizerContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragStartY = e.clientY;
            dragStartX = e.clientX;
            visualizerContainer.style.cursor = 'grabbing';
            e.preventDefault(); // Prevent text selection and other default behaviors
        });
        
        // Add touch support for mobile devices
        visualizerContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) return;
            
            isDragging = true;
            dragStartY = e.touches[0].clientY;
            dragStartX = e.touches[0].clientX;
            visualizerContainer.style.cursor = 'grabbing';
            e.preventDefault();
        }, { passive: false });
        
        // Double-click to reset to defaults
        visualizerContainer.addEventListener('dblclick', (e) => {
            hueRotation = 0;
            dynamicNumBars = CONFIG.numBars;
            saveSettings(); // Use helper function
            console.log('[Visualizer] Reset to defaults');
            e.stopPropagation();
        });
        
        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaY = dragStartY - e.clientY;
            const deltaX = e.clientX - dragStartX;
            
            // Vertical drag: rotate hue
            if (Math.abs(deltaY) > 0) {
                hueRotation = (hueRotation + deltaY * CONFIG.dragHueSensitivity) % 360;
                if (hueRotation < 0) hueRotation += 360;
                settingsChanged = true; // Mark for saving later
                dragStartY = e.clientY;
            }
            
            // Horizontal drag: adjust bar count
            if (Math.abs(deltaX) > 2) {
                const barChange = Math.sign(deltaX); // Just +/- 1 for smoother adjustment
                const newBarCount = Math.max(MIN_BARS, Math.min(MAX_BARS, dynamicNumBars + barChange));
                
                if (newBarCount !== dynamicNumBars) {
                    dynamicNumBars = newBarCount;
                    settingsChanged = true; // Mark for saving later
                    console.log('[Visualizer] Bar count adjusted to:', dynamicNumBars);
                }
                
                dragStartX = e.clientX;
            }
            
            // Show drag info
            if (CONFIG.showDragInfo && dragIndicator) {
                dragIndicator.textContent = `Hue: ${Math.round(hueRotation)}° | Bars: ${dynamicNumBars}`;
                dragIndicator.style.display = 'block';
                dragIndicator.style.right = `${CONFIG.barWidth + 10}px`;
            }
            
            e.preventDefault(); // Prevent page scrolling or other interactions
        });
        
        // Touch move handler with same drag logic
        window.addEventListener('touchmove', (e) => {
            if (!isDragging || e.touches.length !== 1) return;
            
            const touch = e.touches[0];
            const deltaY = dragStartY - touch.clientY;
            const deltaX = touch.clientX - dragStartX;
            
            // Vertical drag: rotate hue
            if (Math.abs(deltaY) > 0) {
                hueRotation = (hueRotation + deltaY * CONFIG.dragHueSensitivity) % 360;
                if (hueRotation < 0) hueRotation += 360;
                settingsChanged = true; // Mark for saving later
                dragStartY = touch.clientY;
            }
            
            // Horizontal drag: adjust bar count
            if (Math.abs(deltaX) > 2) {
                const barChange = Math.sign(deltaX);
                const newBarCount = Math.max(MIN_BARS, Math.min(MAX_BARS, dynamicNumBars + barChange));
                
                if (newBarCount !== dynamicNumBars) {
                    dynamicNumBars = newBarCount;
                    settingsChanged = true; // Mark for saving later
                    console.log('[Visualizer] Bar count adjusted to:', dynamicNumBars);
                }
                
                dragStartX = touch.clientX;
            }
            
            // Show drag info
            if (CONFIG.showDragInfo && dragIndicator) {
                dragIndicator.textContent = `Hue: ${Math.round(hueRotation)}° | Bars: ${dynamicNumBars}`;
                dragIndicator.style.display = 'block';
                dragIndicator.style.right = `${CONFIG.barWidth + 10}px`;
            }
            
            e.preventDefault();
        }, { passive: false });
        
        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                visualizerContainer.style.cursor = 'grab';
                if (dragIndicator) {
                    dragIndicator.style.display = 'none';
                }
                // Save settings when drag ends
                if (settingsChanged) {
                    saveSettings();
                }
            }
        });
        
        // Also handle mouse leaving the window
        window.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                visualizerContainer.style.cursor = 'grab';
                if (dragIndicator) {
                    dragIndicator.style.display = 'none';
                }
                // Save settings when drag ends
                if (settingsChanged) {
                    saveSettings();
                }
            }
        });
        
        // Touch end handler
        window.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                visualizerContainer.style.cursor = 'grab';
                if (dragIndicator) {
                    dragIndicator.style.display = 'none';
                }
                // Save settings when drag ends
                if (settingsChanged) {
                    saveSettings();
                }
            }
        });
    }

    // Start when page is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();