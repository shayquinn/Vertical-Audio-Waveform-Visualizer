// ==UserScript==
// @name         Vertical Audio Waveform Visualizer
// @namespace    http://tampermonkey.net/
// @version      1.2
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
        barColor: '#00ff88'
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
        pointerEvents: 'none',
        backgroundColor: CONFIG.backgroundColor,
        borderLeft: `1px solid ${CONFIG.borderColor}`,
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 0',
        boxSizing: 'border-box'
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
        if (!media.muted) {
            // Show container FIRST so it has dimensions
            visualizerContainer.style.display = 'flex';
            connectAudioElement(media);
            console.log('[Visualizer] Visualizer activated');
        }
    }

    function handlePause() {
        stopVisualization();
        visualizerContainer.style.display = 'none';
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
        
        const halfBars = Math.floor(CONFIG.numBars / 2);
        const barHeight = centerY / halfBars;
        const maxBarWidth = canvasWidth - 10;
        
        // Create gradient for bars (center to edges)
        const gradientTop = ctx.createLinearGradient(0, 0, 0, centerY);
        gradientTop.addColorStop(0, '#ff0080');
        gradientTop.addColorStop(0.33, '#8000ff');
        gradientTop.addColorStop(0.66, '#0080ff');
        gradientTop.addColorStop(1, '#00ff80');
        
        const gradientBottom = ctx.createLinearGradient(0, centerY, 0, canvasHeight);
        gradientBottom.addColorStop(0, '#00ff80');
        gradientBottom.addColorStop(0.33, '#0080ff');
        gradientBottom.addColorStop(0.66, '#8000ff');
        gradientBottom.addColorStop(1, '#ff0080');
        
        // Draw bars (mirrored from center)
        for (let i = 0; i < halfBars; i++) {
            const dataIndex = Math.floor(i * dataArray.length / halfBars);
            const barWidth = (dataArray[dataIndex] / 255) * maxBarWidth;
            
            // Top half (going up from center)
            const yTop = centerY - (i + 1) * barHeight + CONFIG.barSpacing;
            ctx.fillStyle = gradientTop;
            ctx.fillRect(5, yTop, barWidth, barHeight - CONFIG.barSpacing * 2);
            
            // Add glow effect for top
            if (barWidth > 20) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = CONFIG.barColor;
                ctx.fillRect(5, yTop, barWidth, barHeight - CONFIG.barSpacing * 2);
                ctx.shadowBlur = 0;
            }
            
            // Bottom half (mirrored going down from center)
            const yBottom = centerY + i * barHeight + CONFIG.barSpacing;
            ctx.fillStyle = gradientBottom;
            ctx.fillRect(5, yBottom, barWidth, barHeight - CONFIG.barSpacing * 2);
            
            // Add glow effect for bottom
            if (barWidth > 20) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = CONFIG.barColor;
                ctx.fillRect(5, yBottom, barWidth, barHeight - CONFIG.barSpacing * 2);
                ctx.shadowBlur = 0;
            }
        }
    }

    // Main draw function
    let frameCount = 0;
    function draw() {
        if (!isVisualizing) return;

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
        
        // Handle window resize
        window.addEventListener('resize', resizeCanvas);
        
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
        
        // Handle device pixel ratio changes
        window.addEventListener('resize', resizeCanvas);
    }

    // Start when page is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();