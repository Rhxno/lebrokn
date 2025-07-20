// script.js

// ===== ANIMATED SPACE BACKGROUND SYSTEM =====
class SpaceBackgroundSystem {
    constructor() {
        this.isInitialized = false;
        this.performanceMode = this.detectPerformanceMode();
        this.animationFrameId = null;
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
    }

    detectPerformanceMode() {
        // Detect mobile devices and low-performance scenarios
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        return {
            isMobile,
            isLowEnd,
            prefersReducedMotion,
            shouldOptimize: isMobile || isLowEnd || prefersReducedMotion
        };
    }

    init() {
        if (this.isInitialized) return;

        // Apply performance optimizations
        this.applyPerformanceOptimizations();

        // Initialize parallax effects
        this.initParallaxEffects();

        // Start performance monitoring
        this.startPerformanceMonitoring();

        this.isInitialized = true;
        console.log('Space Background System initialized with performance mode:', this.performanceMode);
    }

    applyPerformanceOptimizations() {
        const spaceBackground = document.querySelector('.space-background');
        if (!spaceBackground) return;

        // Apply hardware acceleration to all animated elements using DocumentFragment for batch DOM updates
        const animatedElements = spaceBackground.querySelectorAll('.stars-layer, .nebula, .planet, .cosmic-dust');

        // Batch DOM updates for better performance
        const fragment = document.createDocumentFragment();
        animatedElements.forEach(element => {
            // Use transform and opacity only for GPU acceleration
            element.style.transform = 'translateZ(0)';
            element.style.webkitTransform = 'translateZ(0)';
            element.style.willChange = 'transform';
            element.style.webkitBackfaceVisibility = 'hidden';
            element.style.backfaceVisibility = 'hidden';

            // Add CSS containment for better performance
            element.style.contain = 'layout style paint';
        });

        // Optimize for mobile devices
        if (this.performanceMode.shouldOptimize) {
            this.applyMobileOptimizations();
        }

        // Schedule will-change cleanup after animations
        this.scheduleWillChangeCleanup();
    }

    applyMobileOptimizations() {
        // Reduce animation complexity on mobile
        const starsLayers = document.querySelectorAll('.stars-layer-2, .stars-layer-3');
        starsLayers.forEach(layer => {
            layer.style.opacity = '0.3';
        });

        // Hide complex elements on very low-end devices
        if (this.performanceMode.isLowEnd) {
            const complexElements = document.querySelectorAll('.cosmic-dust, .nebula-2, .nebula-3, .planet-2, .planet-3');
            complexElements.forEach(element => {
                element.style.display = 'none';
            });
        }
    }

    initParallaxEffects() {
        if (this.performanceMode.prefersReducedMotion) return;

        let ticking = false;
        let lastScrollY = 0;

        // Cache DOM elements for better performance
        const starsLayer1 = document.querySelector('.stars-layer-1');
        const starsLayer2 = document.querySelector('.stars-layer-2');
        const starsLayer3 = document.querySelector('.stars-layer-3');

        // Set will-change property for parallax elements
        [starsLayer1, starsLayer2, starsLayer3].forEach(layer => {
            if (layer) {
                layer.style.willChange = 'transform';
            }
        });

        const updateParallax = () => {
            const scrollY = window.pageYOffset;

            // Only update if scroll position changed significantly (performance optimization)
            if (Math.abs(scrollY - lastScrollY) < 1) {
                ticking = false;
                return;
            }

            lastScrollY = scrollY;

            // Use transform3d for hardware acceleration and only transform property
            if (starsLayer1) {
                const offset1 = scrollY * 0.1;
                starsLayer1.style.transform = `translate3d(0, ${offset1}px, 0)`;
            }

            if (starsLayer2) {
                const offset2 = scrollY * 0.05;
                starsLayer2.style.transform = `translate3d(0, ${offset2}px, 0)`;
            }

            if (starsLayer3) {
                const offset3 = scrollY * 0.02;
                starsLayer3.style.transform = `translate3d(0, ${offset3}px, 0)`;
            }

            ticking = false;
        };

        const requestParallaxUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };

        // Throttled scroll listener for parallax with passive event listener
        window.addEventListener('scroll', requestParallaxUpdate, { passive: true });

        // Cleanup will-change on scroll end
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                [starsLayer1, starsLayer2, starsLayer3].forEach(layer => {
                    if (layer) {
                        layer.style.willChange = 'auto';
                    }
                });
            }, 150);
        }, { passive: true });
    }

    startPerformanceMonitoring() {
        if (this.performanceMode.prefersReducedMotion) return;

        let frameCount = 0;
        let lastTime = performance.now();
        let lowFPSCount = 0;
        let highFPSCount = 0;

        const monitorFrame = (currentTime) => {
            frameCount++;

            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

                // Dynamic performance optimization based on FPS
                if (fps < 30) {
                    lowFPSCount++;
                    highFPSCount = 0;
                    if (lowFPSCount >= 3 && !this.performanceMode.shouldOptimize) {
                        console.warn('Consistently low FPS detected, applying performance optimizations');
                        this.applyMobileOptimizations();
                        this.performanceMode.shouldOptimize = true;
                        this.optimizeForLowPerformance();
                    }
                } else if (fps >= 50) {
                    highFPSCount++;
                    lowFPSCount = 0;
                    // If performance is consistently good, we can enable more effects
                    if (highFPSCount >= 5 && this.performanceMode.shouldOptimize) {
                        this.adjustQuality('medium');
                    }
                } else {
                    lowFPSCount = 0;
                    highFPSCount = 0;
                }

                // Log performance metrics in development
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.log(`Space Background FPS: ${fps}`);
                }

                frameCount = 0;
                lastTime = currentTime;
            }

            this.animationFrameId = requestAnimationFrame(monitorFrame);
        };

        this.animationFrameId = requestAnimationFrame(monitorFrame);
    }

    // Method to dynamically adjust quality based on performance
    adjustQuality(level) {
        const spaceBackground = document.querySelector('.space-background');
        if (!spaceBackground) return;

        switch (level) {
            case 'high':
                // Enable all effects
                document.querySelectorAll('.cosmic-dust, .nebula-2, .nebula-3, .planet-2, .planet-3').forEach(el => {
                    el.style.display = '';
                });
                break;
            case 'medium':
                // Disable some effects
                document.querySelectorAll('.cosmic-dust, .nebula-3, .planet-3').forEach(el => {
                    el.style.display = 'none';
                });
                break;
            case 'low':
                // Minimal effects only
                document.querySelectorAll('.cosmic-dust, .nebula-2, .nebula-3, .planet-2, .planet-3').forEach(el => {
                    el.style.display = 'none';
                });
                break;
        }
    }

    // Schedule will-change cleanup for better memory management
    scheduleWillChangeCleanup() {
        // Clean up will-change properties after animations settle
        setTimeout(() => {
            const animatedElements = document.querySelectorAll('.stars-layer, .nebula, .planet, .cosmic-dust');
            animatedElements.forEach(element => {
                // Only reset will-change if element is not currently animating
                if (!element.matches(':hover') && !element.matches(':active')) {
                    element.style.willChange = 'auto';
                }
            });
        }, 5000); // Clean up after 5 seconds
    }

    // Optimize for very low performance devices
    optimizeForLowPerformance() {
        // Disable complex animations and effects
        const complexElements = document.querySelectorAll('.cosmic-dust, .nebula-2, .nebula-3, .planet-2, .planet-3');
        complexElements.forEach(element => {
            element.style.display = 'none';
            element.style.willChange = 'auto';
        });

        // Reduce animation complexity
        const remainingElements = document.querySelectorAll('.stars-layer-2, .stars-layer-3');
        remainingElements.forEach(element => {
            element.style.opacity = '0.2';
            element.style.animationDuration = '120s'; // Slower animations
        });

        console.log('Low performance optimizations applied');
    }

    // Batch DOM updates for better performance
    batchDOMUpdates(updates) {
        // Use requestAnimationFrame to batch DOM updates
        requestAnimationFrame(() => {
            updates.forEach(update => update());
        });
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Reset will-change properties to auto for cleanup
        const animatedElements = document.querySelectorAll('.stars-layer, .nebula, .planet, .cosmic-dust');
        animatedElements.forEach(element => {
            element.style.willChange = 'auto';
            element.style.transform = '';
            element.style.webkitTransform = '';
        });

        this.isInitialized = false;
    }
}

// Initialize space background system
const spaceBackground = new SpaceBackgroundSystem();

// ===== COMPREHENSIVE CROSS-DEVICE COMPATIBILITY SYSTEM =====

class CrossDeviceCompatibilityManager {
    constructor() {
        this.deviceInfo = this.detectDevice();
        this.performanceProfile = this.createPerformanceProfile();
        this.touchCapabilities = this.detectTouchCapabilities();
        this.safariOptimizations = this.detectSafariFeatures();
        this.init();
    }

    detectDevice() {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;

        return {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
            isIOS: /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream,
            isAndroid: /Android/i.test(userAgent),
            isSafari: /^((?!chrome|android).)*safari/i.test(userAgent),
            isIOSSafari: /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream && /Safari/i.test(userAgent),
            isChrome: /Chrome/i.test(userAgent),
            isFirefox: /Firefox/i.test(userAgent),
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            pixelRatio: window.devicePixelRatio || 1,
            orientation: screen.orientation?.type || 'unknown',
            platform: platform
        };
    }

    createPerformanceProfile() {
        const hardwareConcurrency = navigator.hardwareConcurrency || 2;
        const memory = navigator.deviceMemory || 4;
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        let performanceLevel = 'high';

        // Determine performance level based on device capabilities
        if (this.deviceInfo.isMobile) {
            if (hardwareConcurrency <= 2 || memory <= 2) {
                performanceLevel = 'low';
            } else if (hardwareConcurrency <= 4 || memory <= 4) {
                performanceLevel = 'medium';
            }
        }

        // Adjust based on connection speed
        if (connection && connection.effectiveType) {
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                performanceLevel = 'low';
            } else if (connection.effectiveType === '3g' && performanceLevel === 'high') {
                performanceLevel = 'medium';
            }
        }

        return {
            level: performanceLevel,
            hardwareConcurrency: hardwareConcurrency,
            memory: memory,
            connection: connection?.effectiveType || 'unknown',
            prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        };
    }

    detectTouchCapabilities() {
        return {
            hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            maxTouchPoints: navigator.maxTouchPoints || 0,
            hasHover: window.matchMedia('(hover: hover)').matches,
            hasPointer: window.matchMedia('(pointer: fine)').matches,
            touchOnly: window.matchMedia('(hover: none) and (pointer: coarse)').matches
        };
    }

    detectSafariFeatures() {
        if (!this.deviceInfo.isSafari) return null;

        return {
            hasWebkitBackdropFilter: CSS.supports('-webkit-backdrop-filter', 'blur(10px)'),
            hasWebkitTransform: CSS.supports('-webkit-transform', 'translateZ(0)'),
            hasSafeAreaInsets: CSS.supports('padding-top', 'env(safe-area-inset-top)'),
            hasWebkitFillAvailable: CSS.supports('height', '-webkit-fill-available'),
            version: this.getSafariVersion()
        };
    }

    getSafariVersion() {
        if (!this.deviceInfo.isSafari) return null;

        const match = navigator.userAgent.match(/Version\/(\d+\.\d+)/);
        return match ? parseFloat(match[1]) : null;
    }

    init() {
        console.log('🔧 Initializing Cross-Device Compatibility Manager...');
        console.log('Device Info:', this.deviceInfo);
        console.log('Performance Profile:', this.performanceProfile);
        console.log('Touch Capabilities:', this.touchCapabilities);

        this.applyDeviceSpecificOptimizations();
        this.setupEventListeners();
        this.optimizeForPerformance();
        this.setupTouchHandling();

        if (this.deviceInfo.isSafari) {
            this.applySafariOptimizations();
        }

        console.log('✅ Cross-Device Compatibility Manager initialized');
    }

    applyDeviceSpecificOptimizations() {
        // Add device-specific CSS classes
        document.body.classList.add(`device-${this.performanceProfile.level}-performance`);

        if (this.deviceInfo.isMobile) {
            document.body.classList.add('mobile-device');
        }

        if (this.deviceInfo.isIOS) {
            document.body.classList.add('ios-device');
        }

        if (this.deviceInfo.isAndroid) {
            document.body.classList.add('android-device');
        }

        if (this.touchCapabilities.touchOnly) {
            document.body.classList.add('touch-only-device');
        }

        // Apply performance-based optimizations
        this.applyPerformanceOptimizations();
    }

    applyPerformanceOptimizations() {
        const level = this.performanceProfile.level;

        if (level === 'low') {
            // Disable complex animations
            const complexElements = document.querySelectorAll('.cosmic-dust, .nebula-2, .nebula-3, .planet-2, .planet-3');
            complexElements.forEach(el => el.style.display = 'none');

            // Reduce animation complexity
            const starsLayers = document.querySelectorAll('.stars-layer-2, .stars-layer-3');
            starsLayers.forEach(layer => {
                layer.style.animationDuration = '300s';
                layer.style.opacity = '0.2';
            });

            console.log('🔧 Applied low-performance optimizations');
        } else if (level === 'medium') {
            // Moderate optimizations
            const complexElements = document.querySelectorAll('.cosmic-dust, .nebula-3, .planet-3');
            complexElements.forEach(el => el.style.display = 'none');

            console.log('🔧 Applied medium-performance optimizations');
        }

        // Apply reduced motion preferences
        if (this.performanceProfile.prefersReducedMotion) {
            document.body.classList.add('reduced-motion');
            const animatedElements = document.querySelectorAll('.stars-layer, .nebula, .planet');
            animatedElements.forEach(el => {
                el.style.animationDuration = '600s';
                el.style.animationTimingFunction = 'linear';
            });

            console.log('🔧 Applied reduced motion optimizations');
        }
    }

    setupEventListeners() {
        // Orientation change handling
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 300);
        });

        // Resize handling with debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 150);
        });

        // Visibility change handling for performance
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Connection change handling
        if (navigator.connection) {
            navigator.connection.addEventListener('change', () => {
                this.handleConnectionChange();
            });
        }
    }

    handleOrientationChange() {
        console.log('📱 Orientation changed');

        // Update viewport height for Safari
        if (this.deviceInfo.isSafari) {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }

        // Trigger layout recalculation
        this.optimizeLayout();

        // Restart animations if needed
        if (this.performanceProfile.level !== 'low') {
            this.restartAnimations();
        }
    }

    handleResize() {
        console.log('📐 Window resized');
        this.optimizeLayout();
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden, pause animations for performance
            this.pauseAnimations();
        } else {
            // Page is visible, resume animations
            this.resumeAnimations();
        }
    }

    handleConnectionChange() {
        const connection = navigator.connection;
        console.log('🌐 Connection changed:', connection.effectiveType);

        // Adjust performance based on new connection
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            this.applyLowBandwidthOptimizations();
        }
    }

    optimizeLayout() {
        // Force layout recalculation for responsive elements
        const responsiveElements = document.querySelectorAll('.container, .teams, .card');
        responsiveElements.forEach(element => {
            element.style.transform = 'translateZ(0)';
            // Trigger reflow
            element.offsetHeight;
            element.style.transform = '';
        });
    }

    pauseAnimations() {
        const animatedElements = document.querySelectorAll('.stars-layer, .nebula, .planet, .cosmic-dust');
        animatedElements.forEach(element => {
            element.style.animationPlayState = 'paused';
        });
    }

    resumeAnimations() {
        const animatedElements = document.querySelectorAll('.stars-layer, .nebula, .planet, .cosmic-dust');
        animatedElements.forEach(element => {
            element.style.animationPlayState = 'running';
        });
    }

    restartAnimations() {
        const animatedElements = document.querySelectorAll('.stars-layer, .nebula, .planet');
        animatedElements.forEach(element => {
            element.style.animation = 'none';
            element.offsetHeight; // Trigger reflow
            element.style.animation = '';
        });
    }

    applyLowBandwidthOptimizations() {
        // Disable complex visual effects for low bandwidth
        const complexElements = document.querySelectorAll('.cosmic-dust, .nebula, .planet');
        complexElements.forEach(el => el.style.display = 'none');

        console.log('🔧 Applied low-bandwidth optimizations');
    }

    setupTouchHandling() {
        if (!this.touchCapabilities.hasTouch) return;

        console.log('👆 Setting up touch handling...');

        // Enhanced touch event handling
        const touchElements = document.querySelectorAll('.btn, .player, .card, input, .player-slider');

        touchElements.forEach(element => {
            // Add touch feedback
            element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
            element.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: true });
        });

        // Prevent default touch behaviors where needed
        document.addEventListener('touchmove', (e) => {
            // Prevent scrolling when dragging players
            if (e.target.classList.contains('player') && e.target.classList.contains('dragging')) {
                e.preventDefault();
            }
        }, { passive: false });

        // Handle drag and drop for touch devices
        this.setupTouchDragAndDrop();
    }

    handleTouchStart(event) {
        const element = event.currentTarget;
        element.classList.add('touch-active');

        // Add haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    handleTouchEnd(event) {
        const element = event.currentTarget;
        element.classList.remove('touch-active');
    }

    setupTouchDragAndDrop() {
        const players = document.querySelectorAll('.player[draggable="true"]');

        players.forEach(player => {
            let touchStartPos = null;
            let isDragging = false;

            player.addEventListener('touchstart', (e) => {
                touchStartPos = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
            }, { passive: true });

            player.addEventListener('touchmove', (e) => {
                if (!touchStartPos) return;

                const touch = e.touches[0];
                const deltaX = Math.abs(touch.clientX - touchStartPos.x);
                const deltaY = Math.abs(touch.clientY - touchStartPos.y);

                if (deltaX > 10 || deltaY > 10) {
                    if (!isDragging) {
                        isDragging = true;
                        player.classList.add('dragging');
                        this.startTouchDrag(player, touch);
                    }
                    this.updateTouchDrag(player, touch);
                }
            }, { passive: false });

            player.addEventListener('touchend', (e) => {
                if (isDragging) {
                    this.endTouchDrag(player, e.changedTouches[0]);
                    isDragging = false;
                    player.classList.remove('dragging');
                }
                touchStartPos = null;
            }, { passive: true });
        });
    }

    startTouchDrag(player, touch) {
        // Create visual feedback for drag start
        player.style.transform = 'scale(1.05) translateZ(0)';
        player.style.zIndex = '1000';

        // Add visual indicator
        const indicator = document.createElement('div');
        indicator.className = 'touch-drag-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: ${touch.clientY - 20}px;
            left: ${touch.clientX - 20}px;
            width: 40px;
            height: 40px;
            background: var(--space-primary);
            border-radius: 50%;
            opacity: 0.7;
            pointer-events: none;
            z-index: 1001;
            animation: pulse 0.5s ease-in-out infinite;
        `;
        document.body.appendChild(indicator);
        player.touchIndicator = indicator;
    }

    updateTouchDrag(player, touch) {
        if (player.touchIndicator) {
            player.touchIndicator.style.top = `${touch.clientY - 20}px`;
            player.touchIndicator.style.left = `${touch.clientX - 20}px`;
        }
    }

    endTouchDrag(player, touch) {
        // Clean up visual feedback
        player.style.transform = '';
        player.style.zIndex = '';

        if (player.touchIndicator) {
            player.touchIndicator.remove();
            player.touchIndicator = null;
        }

        // Find drop target
        const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
        if (dropTarget) {
            const teamContainer = dropTarget.closest('.team');
            if (teamContainer) {
                // Simulate drop event
                this.simulateDropEvent(player, teamContainer);
            }
        }
    }

    simulateDropEvent(player, teamContainer) {
        // Create and dispatch a custom drop event
        const dropEvent = new CustomEvent('touchdrop', {
            detail: {
                draggedElement: player,
                dropTarget: teamContainer
            }
        });
        teamContainer.dispatchEvent(dropEvent);
    }

    applySafariOptimizations() {
        console.log('🧭 Applying Safari-specific optimizations...');

        // Add Safari-specific classes
        document.body.classList.add('safari-browser');
        if (this.deviceInfo.isIOSSafari) {
            document.body.classList.add('ios-safari');
        }

        // Fix Safari viewport height
        this.fixSafariViewport();

        // Apply Safari-specific CSS properties
        this.applySafariCSS();

        // Handle Safari-specific input behaviors
        this.handleSafariInputs();

        // Optimize Safari animations
        this.optimizeSafariAnimations();

        console.log('✅ Safari optimizations applied');
    }

    fixSafariViewport() {
        const updateViewport = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);

            if (this.deviceInfo.isIOSSafari) {
                document.documentElement.style.setProperty('--safari-vh', `${window.innerHeight}px`);
            }
        };

        updateViewport();
        window.addEventListener('resize', updateViewport);
        window.addEventListener('orientationchange', () => {
            setTimeout(updateViewport, 300);
        });
    }

    applySafariCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .safari-browser * {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            
            .safari-browser .btn,
            .safari-browser .card,
            .safari-browser .player {
                -webkit-transform: translateZ(0);
                -webkit-backface-visibility: hidden;
            }
            
            .ios-safari {
                -webkit-overflow-scrolling: touch;
            }
        `;
        document.head.appendChild(style);
    }

    handleSafariInputs() {
        const inputs = document.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // Prevent Safari zoom on input focus
            input.addEventListener('focus', function () {
                if (this.style.fontSize !== '16px') {
                    this.style.fontSize = '16px';
                }

                // Scroll input into view
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            });

            input.addEventListener('blur', function () {
                this.style.fontSize = '';
            });
        });
    }

    optimizeSafariAnimations() {
        const animatedElements = document.querySelectorAll('.stars-layer, .btn, .card');

        animatedElements.forEach(element => {
            element.style.webkitTransform = 'translateZ(0)';
            element.style.webkitBackfaceVisibility = 'hidden';
            element.style.webkitPerspective = '1000px';
        });
    }

    // Public methods for manual optimization
    optimizeForDevice(deviceType) {
        switch (deviceType) {
            case 'low-end':
                this.performanceProfile.level = 'low';
                this.applyPerformanceOptimizations();
                break;
            case 'high-end':
                this.performanceProfile.level = 'high';
                this.enableAllFeatures();
                break;
        }
    }

    enableAllFeatures() {
        // Re-enable all visual effects
        const hiddenElements = document.querySelectorAll('[style*="display: none"]');
        hiddenElements.forEach(el => {
            if (el.classList.contains('cosmic-dust') ||
                el.classList.contains('nebula') ||
                el.classList.contains('planet')) {
                el.style.display = '';
            }
        });
    }

    getCompatibilityReport() {
        return {
            device: this.deviceInfo,
            performance: this.performanceProfile,
            touch: this.touchCapabilities,
            safari: this.safariOptimizations,
            timestamp: new Date().toISOString()
        };
    }
}

// Initialize cross-device compatibility
const compatibilityManager = new CrossDeviceCompatibilityManager();

// Safari-specific initialization function
function initializeSafariOptimizations() {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (!isSafari) return;

    console.log('Initializing Safari-specific optimizations...');

    // Safari-specific CSS class for targeted styling
    document.body.classList.add('safari-browser');
    if (isIOSSafari) {
        document.body.classList.add('ios-safari');
    }

    // Fix Safari's viewport height calculation
    const updateSafariViewport = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);

        // Additional Safari-specific viewport fixes
        if (isIOSSafari) {
            document.documentElement.style.setProperty('--safari-vh', `${window.innerHeight}px`);
            document.body.style.minHeight = '-webkit-fill-available';
        }
    };

    updateSafariViewport();
    window.addEventListener('resize', updateSafariViewport);
    window.addEventListener('orientationchange', () => {
        setTimeout(updateSafariViewport, 300);
    });

    // Safari-specific touch event handling
    document.addEventListener('touchstart', function () {
        // This empty handler enables :active pseudo-class in Safari
    }, { passive: true });

    // Prevent Safari's default touch behaviors on game elements
    const gameElements = document.querySelectorAll('.btn, .player, .card, .player-slider');
    gameElements.forEach(element => {
        element.style.webkitTouchCallout = 'none';
        element.style.webkitUserSelect = 'none';
        element.style.webkitTapHighlightColor = 'rgba(0, 247, 255, 0.2)';
    });

    // Safari-specific performance optimizations
    const animatedElements = document.querySelectorAll('.card, .btn, .full-screen-overlay, .space-background');
    animatedElements.forEach(element => {
        element.style.webkitBackfaceVisibility = 'hidden';
        element.style.webkitPerspective = '1000px';
        element.style.webkitTransform = 'translateZ(0)';
    });

    // Safari-specific input handling
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        // Prevent Safari's default styling
        input.style.webkitAppearance = 'none';
        input.style.webkitBorderRadius = '0';

        // Handle Safari's zoom behavior on input focus
        input.addEventListener('focus', function () {
            this.style.fontSize = '16px';

            // Scroll input into view for Safari
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        });

        input.addEventListener('blur', function () {
            this.style.fontSize = '';
        });
    });

    // Safari-specific scroll handling
    if (isIOSSafari) {
        // Prevent Safari's bounce scrolling
        document.body.addEventListener('touchmove', function (e) {
            if (e.scale !== 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // Handle Safari's safe area insets
        const safeAreaElements = document.querySelectorAll('.container, .full-screen-overlay');
        safeAreaElements.forEach(element => {
            element.style.paddingTop = 'max(1rem, env(safe-area-inset-top))';
            element.style.paddingBottom = 'max(1rem, env(safe-area-inset-bottom))';
            element.style.paddingLeft = 'max(1rem, env(safe-area-inset-left))';
            element.style.paddingRight = 'max(1rem, env(safe-area-inset-right))';
        });
    }

    console.log('Safari optimizations initialized successfully');
}

// Performance monitoring utility
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            frameCount: 0,
            lastTime: performance.now(),
            fps: 0,
            memoryUsage: 0
        };
        this.isMonitoring = false;
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        this.isMonitoring = true;
        this.monitorFrame();
    }

    monitorFrame() {
        if (!this.isMonitoring) return;

        this.metrics.frameCount++;
        const currentTime = performance.now();

        if (currentTime - this.metrics.lastTime >= 1000) {
            this.metrics.fps = Math.round((this.metrics.frameCount * 1000) / (currentTime - this.metrics.lastTime));

            // Monitor memory usage if available
            if (performance.memory) {
                this.metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576); // MB
            }

            // Log performance in development
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log(`Performance: ${this.metrics.fps} FPS, ${this.metrics.memoryUsage} MB`);
            }

            // Auto-optimize if performance is poor
            if (this.metrics.fps < 30) {
                this.applyPerformanceOptimizations();
            }

            this.metrics.frameCount = 0;
            this.metrics.lastTime = currentTime;
        }

        requestAnimationFrame(() => this.monitorFrame());
    }

    applyPerformanceOptimizations() {
        // Reduce animation complexity
        const complexAnimations = document.querySelectorAll('.cosmic-dust, .nebula-2, .nebula-3');
        complexAnimations.forEach(element => {
            element.style.display = 'none';
        });

        // Simplify remaining animations
        const remainingAnimations = document.querySelectorAll('.stars-layer-2, .stars-layer-3');
        remainingAnimations.forEach(element => {
            element.style.animationDuration = '120s';
            element.style.opacity = '0.3';
        });

        console.warn('Performance optimizations applied due to low FPS');
    }

    stopMonitoring() {
        this.isMonitoring = false;
    }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// ===== COMPREHENSIVE ERROR HANDLING AND USER FEEDBACK SYSTEM =====

class SpaceErrorHandler {
    constructor() {
        this.errorQueue = [];
        this.isShowingError = false;
        this.errorTypes = {
            NETWORK: 'network',
            VALIDATION: 'validation',
            GAME_STATE: 'game_state',
            AUDIO: 'audio',
            STORAGE: 'storage',
            PERFORMANCE: 'performance'
        };
        this.spaceMessages = {
            [this.errorTypes.NETWORK]: [
                "🛸 Houston, we have a connection problem!",
                "🌌 Lost in space - network connection failed",
                "🚀 Communication with mission control interrupted",
                "⭐ Cosmic interference detected in transmission"
            ],
            [this.errorTypes.VALIDATION]: [
                "🛰️ Invalid coordinates detected, Captain!",
                "🌟 That input doesn't compute in our galaxy",
                "🚀 Mission parameters need adjustment",
                "⚡ Cosmic validation error encountered"
            ],
            [this.errorTypes.GAME_STATE]: [
                "🌌 Game universe encountered an anomaly",
                "🛸 Temporal paradox in game state detected",
                "🚀 Mission sequence disrupted",
                "⭐ Reality glitch in the cosmic game matrix"
            ],
            [this.errorTypes.AUDIO]: [
                "🎵 Cosmic audio systems offline",
                "🔊 Space communication channels disrupted",
                "🎤 Interstellar microphone malfunction",
                "📡 Audio transmission lost in the void"
            ],
            [this.errorTypes.STORAGE]: [
                "💾 Cosmic data storage malfunction",
                "🛰️ Memory banks experiencing interference",
                "📊 Data crystals corrupted by solar flares",
                "💿 Galactic storage systems offline"
            ],
            [this.errorTypes.PERFORMANCE]: [
                "⚡ Warp drive experiencing performance issues",
                "🚀 Engine efficiency below optimal levels",
                "🌟 System resources running low in this sector",
                "🛸 Cosmic lag detected in the matrix"
            ]
        };
        this.init();
    }

    init() {
        // Set up global error handlers
        window.addEventListener('error', (event) => {
            this.handleError(this.errorTypes.GAME_STATE, event.message, event);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(this.errorTypes.NETWORK, 'Promise rejection detected', event.reason);
        });

        // Initialize error modal if it doesn't exist
        this.ensureErrorModal();
    }

    ensureErrorModal() {
        let errorModal = document.getElementById('space-error-modal');
        if (!errorModal) {
            errorModal = document.createElement('div');
            errorModal.id = 'space-error-modal';
            errorModal.className = 'space-error-modal';
            errorModal.innerHTML = `
                <div class="space-error-content">
                    <div class="space-error-header">
                        <div class="space-error-icon">🛸</div>
                        <button class="space-error-close" onclick="spaceErrorHandler.closeError()">&times;</button>
                    </div>
                    <div class="space-error-body">
                        <h3 id="space-error-title">Mission Alert</h3>
                        <p id="space-error-message">Cosmic anomaly detected</p>
                        <div class="space-error-details" id="space-error-details" style="display: none;"></div>
                    </div>
                    <div class="space-error-actions">
                        <button class="btn primary-btn" onclick="spaceErrorHandler.closeError()">
                            🚀 Continue Mission
                        </button>
                        <button class="btn secondary-btn" onclick="spaceErrorHandler.toggleDetails()" id="details-toggle">
                            📊 Show Details
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(errorModal);
        }
    }

    handleError(type, message, details = null) {
        console.error(`Space Error [${type}]:`, message, details);

        const errorInfo = {
            type,
            message,
            details,
            timestamp: new Date().toISOString(),
            spaceMessage: this.getRandomSpaceMessage(type)
        };

        this.errorQueue.push(errorInfo);

        if (!this.isShowingError) {
            this.showNextError();
        }
    }

    getRandomSpaceMessage(type) {
        const messages = this.spaceMessages[type] || this.spaceMessages[this.errorTypes.GAME_STATE];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    showNextError() {
        if (this.errorQueue.length === 0) {
            this.isShowingError = false;
            return;
        }

        this.isShowingError = true;
        const error = this.errorQueue.shift();

        const modal = document.getElementById('space-error-modal');
        const title = document.getElementById('space-error-title');
        const message = document.getElementById('space-error-message');
        const details = document.getElementById('space-error-details');

        title.textContent = error.spaceMessage;
        message.textContent = error.message;

        if (error.details) {
            details.textContent = typeof error.details === 'string' ? error.details : JSON.stringify(error.details, null, 2);
            document.getElementById('details-toggle').style.display = 'inline-flex';
        } else {
            document.getElementById('details-toggle').style.display = 'none';
        }

        modal.classList.add('active');

        // Auto-close non-critical errors after 5 seconds
        if (error.type !== this.errorTypes.GAME_STATE) {
            setTimeout(() => {
                if (modal.classList.contains('active')) {
                    this.closeError();
                }
            }, 5000);
        }
    }

    closeError() {
        const modal = document.getElementById('space-error-modal');
        modal.classList.remove('active');

        setTimeout(() => {
            this.showNextError();
        }, 300);
    }

    toggleDetails() {
        const details = document.getElementById('space-error-details');
        const toggle = document.getElementById('details-toggle');

        if (details.style.display === 'none') {
            details.style.display = 'block';
            toggle.textContent = '📊 Hide Details';
        } else {
            details.style.display = 'none';
            toggle.textContent = '📊 Show Details';
        }
    }

    // Convenience methods for different error types
    networkError(message, details) {
        this.handleError(this.errorTypes.NETWORK, message, details);
    }

    validationError(message, details) {
        this.handleError(this.errorTypes.VALIDATION, message, details);
    }

    gameStateError(message, details) {
        this.handleError(this.errorTypes.GAME_STATE, message, details);
    }

    audioError(message, details) {
        this.handleError(this.errorTypes.AUDIO, message, details);
    }

    storageError(message, details) {
        this.handleError(this.errorTypes.STORAGE, message, details);
    }

    performanceError(message, details) {
        this.handleError(this.errorTypes.PERFORMANCE, message, details);
    }
}

class SpaceLoadingSystem {
    constructor() {
        this.activeLoaders = new Map();
        this.loadingCounter = 0;
        this.init();
    }

    init() {
        this.ensureGlobalLoader();
    }

    ensureGlobalLoader() {
        let globalLoader = document.getElementById('space-global-loader');
        if (!globalLoader) {
            globalLoader = document.createElement('div');
            globalLoader.id = 'space-global-loader';
            globalLoader.className = 'space-global-loader';
            globalLoader.innerHTML = `
                <div class="space-loader-content">
                    <div class="space-loader-animation">
                        <div class="space-loader-orbit">
                            <div class="space-loader-planet"></div>
                            <div class="space-loader-moon"></div>
                        </div>
                        <div class="space-loader-stars">
                            <div class="space-loader-star"></div>
                            <div class="space-loader-star"></div>
                            <div class="space-loader-star"></div>
                        </div>
                    </div>
                    <div class="space-loader-text">
                        <h3 id="space-loader-title">🚀 Initializing Mission</h3>
                        <p id="space-loader-message">Preparing cosmic systems...</p>
                    </div>
                </div>
            `;
            document.body.appendChild(globalLoader);
        }
    }

    show(title = "🚀 Loading", message = "Please wait while we prepare the cosmos...", duration = null) {
        const loaderId = `loader_${++this.loadingCounter}`;

        const titleElement = document.getElementById('space-loader-title');
        const messageElement = document.getElementById('space-loader-message');
        const loader = document.getElementById('space-global-loader');

        titleElement.textContent = title;
        messageElement.textContent = message;
        loader.classList.add('active');

        if (duration) {
            setTimeout(() => {
                this.hide(loaderId);
            }, duration);
        }

        this.activeLoaders.set(loaderId, { title, message, startTime: Date.now() });
        return loaderId;
    }

    hide(loaderId = null) {
        if (loaderId) {
            this.activeLoaders.delete(loaderId);
        }

        if (this.activeLoaders.size === 0) {
            const loader = document.getElementById('space-global-loader');
            loader.classList.remove('active');
        }
    }

    showButtonLoader(button, text = "Loading...") {
        if (!button) return null;

        const originalText = button.textContent;
        const originalHTML = button.innerHTML;

        button.disabled = true;
        button.classList.add('loading');
        button.innerHTML = `
            <span class="btn-loader">
                <span class="btn-loader-spinner">🌟</span>
                ${text}
            </span>
        `;

        return {
            hide: () => {
                button.disabled = false;
                button.classList.remove('loading');
                button.innerHTML = originalHTML;
            }
        };
    }

    showElementLoader(element, message = "Loading...") {
        if (!element) return null;

        const originalContent = element.innerHTML;
        element.classList.add('loading-state');
        element.innerHTML = `
            <div class="element-loader">
                <div class="element-loader-animation">
                    <div class="element-loader-orbit">
                        <div class="element-loader-dot"></div>
                    </div>
                </div>
                <span class="element-loader-text">${message}</span>
            </div>
        `;

        return {
            hide: () => {
                element.classList.remove('loading-state');
                element.innerHTML = originalContent;
            }
        };
    }
}

class SpaceFeedbackSystem {
    constructor() {
        this.feedbackQueue = [];
        this.isShowingFeedback = false;
        this.feedbackTypes = {
            SUCCESS: 'success',
            INFO: 'info',
            WARNING: 'warning',
            ERROR: 'error'
        };
        this.init();
    }

    init() {
        this.ensureFeedbackContainer();
    }

    ensureFeedbackContainer() {
        let container = document.getElementById('space-feedback-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'space-feedback-container';
            container.className = 'space-feedback-container';
            document.body.appendChild(container);
        }
    }

    show(type, title, message, duration = 4000) {
        const feedback = {
            id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            title,
            message,
            duration
        };

        this.createFeedbackElement(feedback);

        if (duration > 0) {
            setTimeout(() => {
                this.hide(feedback.id);
            }, duration);
        }

        return feedback.id;
    }

    createFeedbackElement(feedback) {
        const container = document.getElementById('space-feedback-container');
        const element = document.createElement('div');
        element.id = feedback.id;
        element.className = `space-feedback space-feedback-${feedback.type}`;

        const icons = {
            [this.feedbackTypes.SUCCESS]: '🌟',
            [this.feedbackTypes.INFO]: '🛸',
            [this.feedbackTypes.WARNING]: '⚠️',
            [this.feedbackTypes.ERROR]: '🚨'
        };

        element.innerHTML = `
            <div class="space-feedback-content">
                <div class="space-feedback-icon">${icons[feedback.type]}</div>
                <div class="space-feedback-text">
                    <h4 class="space-feedback-title">${feedback.title}</h4>
                    <p class="space-feedback-message">${feedback.message}</p>
                </div>
                <button class="space-feedback-close" onclick="spaceFeedbackSystem.hide('${feedback.id}')">&times;</button>
            </div>
        `;

        container.appendChild(element);

        // Trigger animation
        requestAnimationFrame(() => {
            element.classList.add('active');
        });
    }

    hide(feedbackId) {
        const element = document.getElementById(feedbackId);
        if (element) {
            element.classList.remove('active');
            element.classList.add('hiding');

            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        }
    }

    success(title, message, duration = 4000) {
        return this.show(this.feedbackTypes.SUCCESS, title, message, duration);
    }

    info(title, message, duration = 4000) {
        return this.show(this.feedbackTypes.INFO, title, message, duration);
    }

    warning(title, message, duration = 5000) {
        return this.show(this.feedbackTypes.WARNING, title, message, duration);
    }

    error(title, message, duration = 0) {
        return this.show(this.feedbackTypes.ERROR, title, message, duration);
    }
}

// Global instances
const spaceErrorHandler = new SpaceErrorHandler();
const spaceLoadingSystem = new SpaceLoadingSystem();
const spaceFeedbackSystem = new SpaceFeedbackSystem();

// Enhanced validation functions
function validateGameState() {
    try {
        // Check essential game elements
        const requiredElements = [
            'current-word',
            'team1-leader',
            'team2-leader',
            'team1-players',
            'team2-players'
        ];

        for (const elementId of requiredElements) {
            if (!document.getElementById(elementId)) {
                spaceErrorHandler.gameStateError(`Required game element missing: ${elementId}`, 'DOM validation failed');
                return false;
            }
        }

        // Validate player data structure
        if (!players || typeof players !== 'object') {
            spaceErrorHandler.gameStateError('Player data structure is invalid', 'Game state corruption detected');
            return false;
        }

        // Validate team leaders
        if (!players.team1Leader || !players.team2Leader) {
            return false;
        }

        // Validate team members
        if (!Array.isArray(players.team1) || !Array.isArray(players.team2)) {
            spaceErrorHandler.gameStateError('Team arrays are invalid', 'Game state corruption detected');
            return false;
        }

        return true;
    } catch (error) {
        spaceErrorHandler.gameStateError('Game state validation failed', error);
        return false;
    }
}

function validatePlayerInput(playerName) {
    if (!playerName || typeof playerName !== 'string') {
        return { valid: false, message: 'Player name must be a valid string' };
    }

    const trimmedName = playerName.trim();

    if (trimmedName.length < 2) {
        return { valid: false, message: 'Player name must be at least 2 characters long' };
    }

    if (trimmedName.length > 20) {
        return { valid: false, message: 'Player name must be 20 characters or less' };
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmedName)) {
        return { valid: false, message: 'Player name contains invalid characters' };
    }

    return { valid: true, name: trimmedName };
}

// Enhanced error handling for async operations
async function safeAsyncOperation(operation, errorType, errorMessage) {
    try {
        return await operation();
    } catch (error) {
        spaceErrorHandler.handleError(errorType, errorMessage, error);
        throw error;
    }
}

// Network error handling wrapper
async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            timeout: 10000 // 10 second timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            spaceErrorHandler.networkError('Network connection failed', 'Unable to connect to the server');
        } else if (error.name === 'AbortError') {
            spaceErrorHandler.networkError('Request timeout', 'The request took too long to complete');
        } else {
            spaceErrorHandler.networkError('Network request failed', error.message);
        }
        throw error;
    }
}

// Safe storage operations with error handling
function safeLocalStorageSet(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        spaceErrorHandler.storageError('Failed to save data to cosmic storage', error);
        return false;
    }
}

function safeLocalStorageGet(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        spaceErrorHandler.storageError('Failed to retrieve data from cosmic storage', error);
        return defaultValue;
    }
}

function safeLocalStorageRemove(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        spaceErrorHandler.storageError('Failed to remove data from cosmic storage', error);
        return false;
    }
}

// Enhanced DOM element safety checks
function safeGetElement(id, errorMessage = null) {
    try {
        const element = document.getElementById(id);
        if (!element && errorMessage) {
            spaceErrorHandler.gameStateError(errorMessage, `Element with ID '${id}' not found`);
        }
        return element;
    } catch (error) {
        spaceErrorHandler.gameStateError('Failed to get DOM element', error);
        return null;
    }
}

function safeQuerySelector(selector, errorMessage = null) {
    try {
        const element = document.querySelector(selector);
        if (!element && errorMessage) {
            spaceErrorHandler.gameStateError(errorMessage, `Element with selector '${selector}' not found`);
        }
        return element;
    } catch (error) {
        spaceErrorHandler.gameStateError('Failed to query DOM element', error);
        return null;
    }
}

// Initialize when DOM is loaded with comprehensive error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Show initial loading
        const initLoaderId = spaceLoadingSystem.show('🌌 Initializing Cosmos', 'Preparing space-themed gaming experience...');

        // Initialize core systems with error handling
        setTimeout(async () => {
            try {
                // Initialize space background system
                spaceBackground.init();
                spaceFeedbackSystem.info('🌟 Background System', 'Cosmic background initialized');

                // Initialize Safari optimizations
                initializeSafariOptimizations();
                spaceFeedbackSystem.info('🛸 Safari Optimizations', 'Browser optimizations applied');

                // Initialize mobile touch optimizations
                initializeMobileTouchOptimizations();
                spaceFeedbackSystem.info('📱 Touch Systems', 'Mobile touch systems activated');

                // Initialize tactile feedback
                initializeTactileFeedback();
                spaceFeedbackSystem.info('⚡ Tactile Feedback', 'Haptic systems online');

                // Initialize speech recognition
                initializeSpeechRecognition();

                // Start performance monitoring in development
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    performanceMonitor.startMonitoring();
                    spaceFeedbackSystem.info('📊 Performance Monitor', 'Development monitoring active');
                }

                // Initialize game state
                initializeGameState();

                // Hide loading and show success
                spaceLoadingSystem.hide(initLoaderId);
                spaceFeedbackSystem.success('🚀 System Ready', 'All cosmic systems initialized successfully!');

                // Add celebration haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate([100, 50, 100]);
                }

            } catch (error) {
                spaceLoadingSystem.hide(initLoaderId);
                spaceErrorHandler.gameStateError('Failed to initialize cosmic systems', error);
                console.error('Initialization error:', error);
            }
        }, 500);

    } catch (error) {
        spaceErrorHandler.gameStateError('Critical initialization failure', error);
        console.error('Critical initialization error:', error);
    }
});

// Utility functions for game initialization
function updatePlayerSliderValue(value) {
    try {
        const sliderValueElement = safeGetElement('slider-value');
        if (sliderValueElement) {
            sliderValueElement.textContent = value;
            numberOfPlayers = parseInt(value);

            // Add tactile feedback
            if (navigator.vibrate) {
                navigator.vibrate(15);
            }
        }
    } catch (error) {
        spaceErrorHandler.gameStateError('Failed to update player slider value', error);
    }
}

function confirmPlayerCount() {
    try {
        const playerSlider = safeGetElement('player-slider-input');
        if (!playerSlider) {
            throw new Error('Player slider not found');
        }

        numberOfPlayers = parseInt(playerSlider.value);

        if (numberOfPlayers < 2 || numberOfPlayers > 10) {
            spaceFeedbackSystem.warning('🛸 Invalid Count', 'Please select between 2-10 cosmic explorers!');
            return;
        }

        // Show loading feedback
        const loaderId = spaceLoadingSystem.show('🚀 Confirming', `Preparing for ${numberOfPlayers} cosmic explorers...`, 1000);

        setTimeout(() => {
            try {
                // Hide player select screen
                const playerSelectScreen = safeGetElement('player-select-screen');
                const difficultyScreen = safeGetElement('difficulty-select-screen');

                if (playerSelectScreen && difficultyScreen) {
                    playerSelectScreen.classList.remove('active');
                    difficultyScreen.classList.add('active');

                    spaceFeedbackSystem.success('👥 Players Confirmed', `Mission set for ${numberOfPlayers} explorers!`);

                    // Add haptic feedback
                    if (navigator.vibrate) {
                        navigator.vibrate([50, 100, 50]);
                    }
                }

                spaceLoadingSystem.hide(loaderId);
            } catch (error) {
                spaceLoadingSystem.hide(loaderId);
                spaceErrorHandler.gameStateError('Failed to proceed to difficulty selection', error);
            }
        }, 800);

    } catch (error) {
        spaceErrorHandler.gameStateError('Failed to confirm player count', error);
    }
}

// Initialize game state with error handling
function initializeGameState() {
    try {
        // Validate essential DOM elements
        const requiredElements = [
            'player-select-screen',
            'difficulty-select-screen',
            'round-select-screen',
            'game-container',
            'current-word',
            'start-btn'
        ];

        const missingElements = [];
        requiredElements.forEach(id => {
            if (!document.getElementById(id)) {
                missingElements.push(id);
            }
        });

        if (missingElements.length > 0) {
            throw new Error(`Missing required elements: ${missingElements.join(', ')}`);
        }

        // Initialize player slider with error handling
        const playerSlider = safeGetElement('player-slider-input');
        if (playerSlider) {
            playerSlider.addEventListener('input', (e) => {
                try {
                    updatePlayerSliderValue(e.target.value);
                } catch (error) {
                    spaceErrorHandler.gameStateError('Failed to update player slider', error);
                }
            });
        }

        // Initialize confirm button with error handling
        const confirmBtn = safeGetElement('confirm-player-count-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                try {
                    confirmPlayerCount();
                } catch (error) {
                    spaceErrorHandler.gameStateError('Failed to confirm player count', error);
                }
            });
        }

        spaceFeedbackSystem.info('🎮 Game State', 'Game state initialized successfully');

    } catch (error) {
        spaceErrorHandler.gameStateError('Failed to initialize game state', error);
        throw error;
    }
}

// Mobile Touch Optimizations with Safari-specific enhancements
function initializeMobileTouchOptimizations() {
    // Safari-specific detection
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // Prevent double-tap zoom on buttons and interactive elements with Safari optimizations
    const interactiveElements = document.querySelectorAll('.btn, .player, .player-slider, input, button');
    interactiveElements.forEach(element => {
        element.addEventListener('touchend', function (e) {
            e.preventDefault();

            // Safari-specific click handling
            if (isSafari && this.tagName !== 'INPUT' && this.tagName !== 'BUTTON') {
                // Use setTimeout to ensure Safari processes the touch event properly
                setTimeout(() => {
                    this.click();
                }, 10);
            } else if (this.tagName !== 'INPUT' && this.tagName !== 'BUTTON') {
                this.click();
            }
        }, { passive: false });

        // Safari-specific touch start handling
        if (isSafari) {
            element.addEventListener('touchstart', function (e) {
                // Add Safari-specific touch feedback
                this.style.webkitTapHighlightColor = 'rgba(0, 247, 255, 0.2)';
            }, { passive: true });
        }
    });

    // Safari-specific pull-to-refresh prevention
    if (isIOSSafari) {
        let startY = 0;

        document.body.addEventListener('touchstart', function (e) {
            startY = e.touches[0].clientY;

            // Prevent pull-to-refresh in Safari
            if (e.touches.length === 1 && window.pageYOffset === 0) {
                const touch = e.touches[0];
                if (touch.clientY < 100) { // More restrictive for Safari
                    e.preventDefault();
                }
            }
        }, { passive: false });

        document.body.addEventListener('touchmove', function (e) {
            const currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;

            // Prevent Safari's rubber band scrolling
            if (window.pageYOffset === 0 && deltaY > 0) {
                e.preventDefault();
            }

            // Prevent overscroll at bottom
            if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight && deltaY < 0) {
                e.preventDefault();
            }
        }, { passive: false });
    } else {
        // Standard mobile prevention for non-Safari browsers
        document.body.addEventListener('touchstart', function (e) {
            if (e.touches.length === 1 && window.pageYOffset === 0) {
                const touch = e.touches[0];
                if (touch.clientY > 50) {
                    e.preventDefault();
                }
            }
        }, { passive: false });

        document.body.addEventListener('touchmove', function (e) {
            if (window.pageYOffset === 0 && e.touches[0].clientY > e.touches[0].clientY) {
                e.preventDefault();
            }
            if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight &&
                e.touches[0].clientY < e.touches[0].clientY) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // Optimized touch feedback using event delegation for better performance
    const touchHandler = {
        elements: new WeakMap(), // Use WeakMap for better memory management

        handleTouchStart(e) {
            const target = e.target.closest('.btn, .player, .card, .player-slider');
            if (!target) return;

            // Batch DOM updates for better performance
            requestAnimationFrame(() => {
                target.classList.add('touch-active');

                // Safari-specific visual feedback
                if (isSafari) {
                    target.style.transform = 'scale(0.95) translateZ(0)';
                    target.style.webkitTransform = 'scale(0.95) translateZ(0)';
                    target.style.transition = 'transform 0.1s ease';
                    target.style.webkitTransition = '-webkit-transform 0.1s ease';
                }

                // Add haptic feedback for touch start (Safari supports this)
                if (navigator.vibrate && target.classList.contains('btn')) {
                    navigator.vibrate(25);
                }
            });

            // Store element reference for cleanup
            this.elements.set(target, { startTime: performance.now() });
        },

        handleTouchEnd(e) {
            const target = e.target.closest('.btn, .player, .card, .player-slider');
            if (!target) return;

            const elementData = this.elements.get(target);
            if (!elementData) return;

            const delay = isSafari ? 200 : 150;

            // Use setTimeout with performance optimization
            setTimeout(() => {
                requestAnimationFrame(() => {
                    target.classList.remove('touch-active');

                    // Reset Safari-specific transforms
                    if (isSafari) {
                        target.style.transform = '';
                        target.style.webkitTransform = '';
                        target.style.transition = '';
                        target.style.webkitTransition = '';
                    }
                });
            }, delay);

            // Clean up WeakMap entry
            this.elements.delete(target);
        },

        handleTouchCancel(e) {
            const target = e.target.closest('.btn, .player, .card, .player-slider');
            if (!target) return;

            requestAnimationFrame(() => {
                target.classList.remove('touch-active');

                // Reset Safari-specific transforms
                if (isSafari) {
                    target.style.transform = '';
                    target.style.webkitTransform = '';
                    target.style.transition = '';
                    target.style.webkitTransition = '';
                }
            });

            this.elements.delete(target);
        }
    };

    // Use event delegation for better performance
    document.body.addEventListener('touchstart', touchHandler.handleTouchStart.bind(touchHandler), { passive: true });
    document.body.addEventListener('touchend', touchHandler.handleTouchEnd.bind(touchHandler), { passive: true });
    document.body.addEventListener('touchcancel', touchHandler.handleTouchCancel.bind(touchHandler), { passive: true });

    // Ensure all form inputs meet touch target requirements with Safari optimizations
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (input.offsetHeight < 44) {
            input.style.minHeight = '44px';
            input.style.padding = '12px';
        }

        // Safari-specific input optimizations
        if (isSafari) {
            input.style.webkitAppearance = 'none';
            input.style.webkitBorderRadius = '0';
            input.addEventListener('focus', function () {
                // Prevent Safari zoom on input focus
                this.style.fontSize = '16px';
            });
        }
    });

    // Optimize viewport for mobile devices
    optimizeViewportForMobile();
}

// Enhanced Tactile Feedback System for Game Controls - Performance Optimized
function initializeTactileFeedback() {
    // Performance-optimized tactile feedback using event delegation
    const tactileFeedbackHandler = {
        activeElements: new WeakSet(), // Track active elements efficiently

        getElementType(element) {
            if (element.classList.contains('btn') || element.tagName === 'BUTTON') return 'button';
            if (element.classList.contains('player-slider')) return 'slider';
            if (element.classList.contains('player')) return 'player';
            return 'other';
        },

        getVibrationIntensity(type) {
            switch (type) {
                case 'button': return 25;
                case 'slider': return 15;
                case 'player': return 20;
                default: return 10;
            }
        },

        handleTouchStart(e) {
            const target = e.target.closest(
                '.btn, .player-slider, input[type="text"], input[type="number"], ' +
                '.player, .card, .difficulty-slot-btn, .round-slot-btn, ' +
                '.mic-btn, .log-btn, #start-btn, #toggle-word-btn'
            );

            if (!target || this.activeElements.has(target)) return;

            this.activeElements.add(target);

            // Batch DOM updates for better performance
            requestAnimationFrame(() => {
                target.classList.add('touch-active');

                // Add haptic feedback based on element type
                if (navigator.vibrate) {
                    const elementType = this.getElementType(target);
                    const intensity = this.getVibrationIntensity(elementType);
                    navigator.vibrate(intensity);
                }

                // Add scale animation for immediate feedback
                if (!target.classList.contains('no-scale-feedback')) {
                    target.style.transform = 'scale(0.95) translateZ(0)';
                    target.style.webkitTransform = 'scale(0.95) translateZ(0)';
                    target.style.transition = 'transform 0.1s ease';
                    target.style.webkitTransition = '-webkit-transform 0.1s ease';
                    target.style.willChange = 'transform';
                }
            });
        },

        handleTouchEnd(e) {
            const target = e.target.closest(
                '.btn, .player-slider, input[type="text"], input[type="number"], ' +
                '.player, .card, .difficulty-slot-btn, .round-slot-btn, ' +
                '.mic-btn, .log-btn, #start-btn, #toggle-word-btn'
            );

            if (!target || !this.activeElements.has(target)) return;

            // Reset scale animation immediately for better responsiveness
            requestAnimationFrame(() => {
                if (!target.classList.contains('no-scale-feedback')) {
                    target.style.transform = '';
                    target.style.webkitTransform = '';
                    target.style.willChange = 'auto';
                }

                // Remove visual feedback with optimized delay
                setTimeout(() => {
                    target.classList.remove('touch-active');
                    target.style.transition = '';
                    target.style.webkitTransition = '';
                    this.activeElements.delete(target);
                }, 150);
            });
        },

        handleTouchCancel(e) {
            const target = e.target.closest(
                '.btn, .player-slider, input[type="text"], input[type="number"], ' +
                '.player, .card, .difficulty-slot-btn, .round-slot-btn, ' +
                '.mic-btn, .log-btn, #start-btn, #toggle-word-btn'
            );

            if (!target) return;

            requestAnimationFrame(() => {
                target.classList.remove('touch-active');
                target.style.transform = '';
                target.style.webkitTransform = '';
                target.style.transition = '';
                target.style.webkitTransition = '';
                target.style.willChange = 'auto';
                this.activeElements.delete(target);
            });
        },

        handleClick(e) {
            if ('ontouchstart' in window) return; // Skip on touch devices

            const target = e.target.closest(
                '.btn, .player-slider, input[type="text"], input[type="number"], ' +
                '.player, .card, .difficulty-slot-btn, .round-slot-btn, ' +
                '.mic-btn, .log-btn, #start-btn, #toggle-word-btn'
            );

            if (!target) return;

            // Add click feedback for mouse users
            target.classList.add('click-active');
            setTimeout(() => {
                target.classList.remove('click-active');
            }, 200);
        },

        handleFocus(e) {
            const target = e.target.closest(
                '.btn, .player-slider, input[type="text"], input[type="number"], ' +
                '.player, .card, .difficulty-slot-btn, .round-slot-btn, ' +
                '.mic-btn, .log-btn, #start-btn, #toggle-word-btn'
            );

            if (target) {
                target.classList.add('focus-active');
            }
        },

        handleBlur(e) {
            const target = e.target.closest(
                '.btn, .player-slider, input[type="text"], input[type="number"], ' +
                '.player, .card, .difficulty-slot-btn, .round-slot-btn, ' +
                '.mic-btn, .log-btn, #start-btn, #toggle-word-btn'
            );

            if (target) {
                target.classList.remove('focus-active');
            }
        }
    };

    // Use event delegation for optimal performance
    document.body.addEventListener('touchstart', tactileFeedbackHandler.handleTouchStart.bind(tactileFeedbackHandler), { passive: true });
    document.body.addEventListener('touchend', tactileFeedbackHandler.handleTouchEnd.bind(tactileFeedbackHandler), { passive: true });
    document.body.addEventListener('touchcancel', tactileFeedbackHandler.handleTouchCancel.bind(tactileFeedbackHandler), { passive: true });
    document.body.addEventListener('click', tactileFeedbackHandler.handleClick.bind(tactileFeedbackHandler), { passive: true });
    document.body.addEventListener('focus', tactileFeedbackHandler.handleFocus.bind(tactileFeedbackHandler), { passive: true, capture: true });
    document.body.addEventListener('blur', tactileFeedbackHandler.handleBlur.bind(tactileFeedbackHandler), { passive: true, capture: true });

    // Special handling for word display click (for accessibility)
    const wordDisplay = document.getElementById('current-word');
    if (wordDisplay) {
        wordDisplay.addEventListener('click', function (e) {
            // Allow users to click word display to toggle visibility
            if (currentWord && !this.classList.contains('loading-word')) {
                toggleWordVisibility();
            }
        });

        // Add cursor pointer for better UX
        wordDisplay.style.cursor = 'pointer';
        wordDisplay.setAttribute('title', 'Click to toggle word visibility');
        wordDisplay.setAttribute('role', 'button');
        wordDisplay.setAttribute('tabindex', '0');

        // Keyboard accessibility for word display
        wordDisplay.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (currentWord && !this.classList.contains('loading-word')) {
                    toggleWordVisibility();
                }
            }
        });
    }

    console.log('Enhanced tactile feedback system initialized for', gameControls.length, 'controls');
}

// Cleanup on page unload with error handling
window.addEventListener('beforeunload', () => {
    try {
        spaceBackground.destroy();
        performanceMonitor.stopMonitoring();

        // Clean up any active loaders
        spaceLoadingSystem.activeLoaders.clear();

        // Clean up speech recognition
        if (recognition) {
            try {
                recognition.stop();
            } catch (error) {
                console.warn('Error stopping speech recognition:', error);
            }
        }

        console.log('Cosmic systems cleaned up successfully');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
});

// Optimize viewport for mobile devices with Safari-specific optimizations
function optimizeViewportForMobile() {
    // Safari-specific user agent detection
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isMobileSafari = isIOSSafari && /Safari/.test(navigator.userAgent);

    // Handle orientation changes with Safari-specific delays
    window.addEventListener('orientationchange', function () {
        // Safari needs longer delay for proper viewport recalculation
        const delay = isSafari ? 300 : 100;

        setTimeout(() => {
            // Force viewport recalculation
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.setAttribute('content',
                    'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover');
            }

            // Safari-specific viewport height fix
            if (isIOSSafari) {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            }

            // Trigger resize event for any responsive elements
            window.dispatchEvent(new Event('resize'));
        }, delay);
    });

    // Handle iOS Safari viewport issues with enhanced detection
    if (isIOSSafari) {
        // Fix iOS Safari viewport height issues
        const setViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);

            // Additional Safari-specific fixes
            document.body.style.minHeight = '-webkit-fill-available';

            // Fix for Safari's bouncing scroll
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            setTimeout(() => {
                document.body.style.position = '';
                document.body.style.width = '';
            }, 100);
        };

        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', () => {
            setTimeout(setViewportHeight, 300); // Longer delay for Safari
        });

        // Safari-specific scroll behavior fixes
        document.addEventListener('touchstart', function (e) {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                // Prevent pull-to-refresh in Safari
                if (touch.clientY < 50 && window.pageYOffset === 0) {
                    e.preventDefault();
                }
            }
        }, { passive: false });

        // Fix Safari's rubber band scrolling
        document.addEventListener('touchmove', function (e) {
            if (e.scale !== 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // Prevent zoom on input focus for iOS Safari
    if (isIOSSafari) {
        const inputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea, select');
        inputs.forEach(input => {
            // Safari-specific input optimizations
            input.addEventListener('focus', function () {
                this.style.fontSize = '16px'; // Prevent zoom
                this.style.webkitAppearance = 'none'; // Remove Safari styling
                this.style.borderRadius = '0'; // Remove Safari border radius

                // Scroll input into view for Safari
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            });

            input.addEventListener('blur', function () {
                this.style.fontSize = ''; // Reset font size
                this.style.webkitAppearance = ''; // Reset appearance
                this.style.borderRadius = ''; // Reset border radius
            });

            // Safari-specific touch handling for inputs
            input.addEventListener('touchstart', function (e) {
                e.stopPropagation(); // Prevent interference with drag/drop
            }, { passive: true });
        });
    }

    // Safari-specific performance optimizations
    if (isSafari) {
        // Enable hardware acceleration for Safari
        const animatedElements = document.querySelectorAll('.card, .btn, .player, .full-screen-overlay');
        animatedElements.forEach(element => {
            element.style.webkitTransform = 'translateZ(0)';
            element.style.webkitBackfaceVisibility = 'hidden';
            element.style.webkitPerspective = '1000px';
        });

        // Safari-specific touch event optimizations
        document.addEventListener('touchstart', function () {
            // Enable :active pseudo-class for Safari
        }, { passive: true });
    }
}

let players = {
    available: [], // Start with empty array
    team1: [],
    team2: [],
    team1Leader: null,
    team2Leader: null
};

let currentWord = '';
let currentTeam = 1;
let currentGuesser = null;
let gameLog = [];
let totalRounds = 5;
let currentRound = 0;
let numberOfPlayers = 0; // To store selected number of players
let gameDifficulty = 'easy'; // Default difficulty
let isWordVisible = true; // Track word visibility state
let gameStarted = false; // Track if the game has started
let pendingSwitch = null; // Track the pending switch action
let maxTeamSize = 0; // Declare maxTeamSize globally
let currentPlayerIndex = { 1: 0, 2: 0 }; // Track current player index for each team

// Drag and Drop State
let draggedItem = null;
let originalParent = null;
let originalNextSibling = null;
let offsetX = 0;
let offsetY = 0;

// --- Speech Recognition Variables ---
let recognition = null;
let targetInput = null;
let activeMicButton = null;

// --- Word Lists ---
const easyWords = [
    "SUN", "MOON", "STAR", "SKY", "CLOUD", "RAIN", "SNOW", "WIND", "TREE", "FLOWER",
    "LEAF", "ROOT", "PLANT", "GRASS", "BIRD", "FISH", "CAT", "DOG", "HORSE", "COW",
    "PIG", "SHEEP", "CHICKEN", "DUCK", "MOUSE", "RAT", "LION", "TIGER", "BEAR", "WOLF",
    "FOX", "DEER", "MONKEY", "ELEPHANT", "GIRAFFE", "ZEBRA", "BOAT", "CAR", "BUS", "TRAIN",
    "PLANE", "BIKE", "DOOR", "WINDOW", "HOUSE", "ROOM", "WALL", "FLOOR", "ROOF", "CHAIR",
    "TABLE", "BED", "SOFA", "PHONE", "BOOK", "PEN", "PENCIL", "PAPER", "COMPUTER", "SCREEN",
    "KEY", "LOCK", "CLOCK", "SHOE", "SHIRT", "PANTS", "HAT", "COAT", "DRESS", "SKIRT",
    "FOOD", "WATER", "MILK", "BREAD", "MEAT", "FISH", "RICE", "FRUIT", "APPLE", "BANANA",
    "ORANGE", "GRAPE", "LEMON", "PEAR", "KNIFE", "FORK", "SPOON", "PLATE", "CUP", "GLASS",
    "BOX", "BALL", "TOY", "GAME", "MUSIC", "SONG", "DANCE", "SMILE", "LAUGH", "CRY", "HAPPY",
    "SAD", "ANGRY", "COLD", "HOT", "WARM", "FAST", "SLOW", "BIG", "SMALL", "LONG", "SHORT",
    "UP", "DOWN", "LEFT", "RIGHT", "FRONT", "BACK", "GOOD", "BAD", "EASY", "HARD", "YES", "NO",
    "ONE", "TWO", "THREE", "DAY", "NIGHT", "TIME", "YEAR", "MONTH", "WEEK", "HOUR", "MINUTE",
    "SECOND", "LIFE", "WORLD", "PEOPLE", "FAMILY", "FRIEND", "WORK", "SCHOOL", "CITY", "COUNTRY",
    "STREET", "ROAD", "PARK", "STORE", "OFFICE", "BEACH", "MOUNTAIN", "RIVER", "LAKE", "OCEAN"
];

const mediumWords = [
    "ADVENTURE", "AMBITION", "BALANCE", "BELIEVE", "BRAVERY", "CAPTURE", "CHALLENGE", "CONFIDENT", "CREATE",
    "DAZZLE", "DEDICATION", "DELIGHT", "DETERMINE", "DISCOVER", "ELEGANT", "EMBRACE", "ENCOURAGE", "ENTHUSIASM", "EXPLORE",
    "FASCINATE", "FLOURISH", "FOCUS", "FREEDOM", "GENERATE", "GENEROSITY", "GRATITUDE", "GUIDE", "HARMONIOUS", "HOPEFUL",
    "HUMILITY", "IMAGINE", "INNOVATION", "INSPIRE", "INTEGRITY", "JOURNEY", "JUSTICE", "KEEN", "KNOWLEDGE", "LEADERSHIP",
    "LEGACY", "LIVELY", "MAGNIFICENT", "MOTIVATION", "MYSTERY", "NAVIGATE", "NOBLE", "NOURISH", "OPPORTUNITY", "OPTIMISM",
    "ORGANIZE", "OUTSTANDING", "PARTICIPATE", "PASSION", "PEACEFUL", "PERSEVERANCE", "PERSUADE", "PLAN", "POWERFUL", "QUESTION",
    "QUIET", "QUIRKY", "RADIANT", "REASON", "RECOGNIZE", "RELIABLE", "REMARKABLE", "SACRIFICE", "SERENITY", "SIMPLIFY",
    "SOLVE", "SPLENDID", "STRATEGIZE", "SUPPORT", "TENACITY", "THOUGHTFUL", "TRANSFORM", "TREASURE", "UNDERSTAND", "UNITY",
    "UPBEAT", "UTILIZE", "VALUABLE", "VERIFY", "VIBRANT", "VISIONARY", "WISDOM", "WONDERFUL", "XENIAL", "YOUTHFUL", "ZEALOUS",
    "ACHIEVEMENT", "ADAPT", "ACTIVATE", "ADMIRE", "ANALYZE", "APPRECIATE", "ASSEMBLE", "BENEFIT", "BUILD", "CALCULATE", "CHERISH",
    "COMPOSE", "CONNECT", "CONSIDER", "DEFINE", "DESIGN", "DEVELOP", "DREAM", "EMPATHIZE", "ESTABLISH", "EVALUATE", "EXAMINE",
    "FACILITATE", "FORMULATE", "GENERATE", "GLOWING", "HEARTFELT", "HYPOTHESIZE", "IDEALISTIC", "IMPLEMENT", "INTERPRET", "JOVIAL", "JUDGE",
    "JUSTIFY", "LEARN", "MEASURE", "MENTOR", "MODIFY", "NEGOTIATE", "OBSERVE", "OVERCOME", "PAINT", "PERFORM", "PRACTICE",
    "PREPARE", "PROMOTE", "PROVIDE", "REFLECT", "RESEARCH", "REVIEW", "SCHEDULE", "SHARE", "SING", "STUDY", "SUCCEED", "TEACH",
    "TEST", "TRAIN", "WRITE", "ZAPPY"
];

const hardWords = [
    "ABSTRUSE", "ADVERSITY", "AMBIVALENT", "ANACHRONISM", "APATHETIC", "ARBITRARY", "BENIGN", "BUREAUCRACY", "CATALYST", "COGNIZANT",
    "COMPLACENT", "CONDESCENDING", "CONJECTURE", "CONVOLUTED", "CRYPTIC", "CYNICAL", "DEBACLE", "DEFERENCE", "DELINEATE", "DERIVATIVE",
    "DESPONDENT", "DIALECTIC", "DIDACTIC", "DISPARITY", "DOGMATIC", "EBULLIENT", "ECCENTRIC", "ECLECTIC", "EFFEMINATE", "ELUSIVE",
    "EMBEZZLE", "EMINENT", "EMPATHY", "ENIGMATIC", "EPHEMERAL", "EQUANIMITY", "ERUDITE", "ESCHEW", "EUPHEMISM", "EVANESCENT",
    "EXACERBATE", "EXEMPLARY", "EXPLICIT", "EXTRAPOLATE", "FASTIDIOUS", "FECUND", "FORTUITOUS", "FRUGAL", "FULMINATE", "GARRULOUS",
    "GERMANE", "GRANDILOQUENT", "GREGARIOUS", "HAPLESS", "HEDONISTIC", "HEGEMONY", "HETERODOX", "HYPERBOLE", "IDIOSYNCRASY", "IMPASSE",
    "IMPECUNIOUS", "IMPERIOUS", "IMPERTINENT", "IMPLACABLE", "IMPUGN", "INANE", "INCIPIENT", "INCISIVE", "INDEFATIGABLE", "INDIGENOUS",
    "INDOLENT", "INEFFABLE", "INEXORABLE", "INSIDIOUS", "INSIPID", "INSOLENT", "INTREPID", "INVETERATE", "IRASCIBLE", "IRREVERENT",
    "ITINERANT", "JOCULAR", "JUDICIOUS", "LAConic", "LANGUID", "LARGESSE", "LATENT", "LETHARGIC", "LIBERAL", "LIMPID", "LOQUACIOUS",
    "LUCID", "LUGUBRIOUS", "MAGNANIMOUS", "MALADROIT", "MALEVOLENT", "MARTINET", "MAUDLIN", "MELLIFLUOUS", "MENDACIOUS", "MERCURIAL",
    "METICULOUS", "MISANTHROPE", "MITIGATE", "MNEMONIC", "MOROSE", "MYOPIC", "NEBULOUS", "NEFARIOUS", "NEXUS", "NOISOME", "NONPLUSSED",
    "OBDURATE", "OBFUSCATE", "OBSEQUIOUS", "OBSTREPEROUS", "OMNIPOTENT", "ONEROUS", "OPPORTUNE", "OSCILLATE", "OSTENSIBLE", "OSTRACIZE",
    "PALATABLE", "PALLIATIVE", "PALPABLE", "PANDEMONIUM", "PARADIGM", "PARADOX", "PARSIMONIOUS", "PATHOS", "PAUCITY", "PEDANTIC",
    "PELLUCID", "PENCHANT", "PERFIDIOUS", "PERFUNCTORY", "PERIPATETIC", "PERNICIOUS", "PERSPICACITY", "PETULANT", "PHILANTHROPY", "PHLEGMATIC",
    "PLACID", "PLAUDIT", "PLETHORA", "POLEMICAL", "PONTIFICATE", "PORTENTOUS", "PRAGMATIC", "PRECIPITOUS", "PRECLUDE", "PREDILECTION",
    "PREEMINENT", "PRESCIENT", "PREVARICATE", "PROCLIVITY", "PRODIGAL", "PROGNOSIS", "PROLIFIC", "PROPENSITY", "PROSAIC", "PROSTRATE",
    "PROVINCIAL", "PUERILE", "PUGNACIOUS", "PULCHRITUDE", "PUNGENT", "PUSILLANIMOUS", "QUIESCENCE", "QUIXOTIC", "QUOTIDIAN", "RAMBUNCTIOUS",
    "RECALCITRANT", "RECONDITE", "RECRUIT", "REDOLENT", "REFRACTORY", "RELEGATE", "REMUNERATION", "REPROBATE", "REPUGNANT", "RESILIENT",
    "RESONANCE", "REVERENCE", "RHETORIC", "ROBUST", "RUSTIC", "SACROSANCT", "SAGACIOUS", "SALACIOUS", "SALIENT", "SANCTIMONIOUS",
    "SANGUINE", "SARDONIC", "SATURNINE", "SATIATE", "SCINTILLA", "SCURRILOUS", "SEDULOUS", "SEMINAL", "SENTIENT", "SERAPHIC",
    "SERENDIPITY", "SERRATED", "SESQUIPEDALIAN", "SIMULACRUM", "SINECURE", "SINUOUS", "SOPORIFIC", "SPARTAN", "SPURIOUS", "SQUALID",
    "STOIC", "STRATAGEM", "STRIATED", "SUCCINCT", "SUPERSEDE", "SUPPLANT", "SURREPTITIOUS", "TACITURN", "TENACIOUS", "TENET",
    "TENUOUS", "TERSE", "TRACTABLE", "TRANSIENT", "TREMULOUS", "TRUCULENT", "TURBID", "TURGID", "TURPITUDE", "UBIQUITOUS",
    "UMBRAGE", "UNCTUOUS", "UNDULATING", "UNGAINLY", "UNREMITTING", "UNSCRUPULOUS", "UNWARRANTED", "VACILLATE", "VACUOUS", "VAGARY",
    "VAPID", "VARIEGATED", "VEHEMENT", "VENAL", "VERACIOUS", "VERBOSE", "VEX", "VILIFY", "VIRULENT", "VITUPERATIVE", "VOLUBLE",
    "VORACIOUS", "WAINSCOTING", "WANTON", "WARY", "WAXING", "WINSOME", "WRETCHED", "XANTHIC", "XENOPHOBIA", "YCLEPT", "YEN", "YIELDING",
    "ZEALOTRY", "ZEITGEIST", "ZENITH", "ZEPHYR", "ZYMURGY"
];

// --- Utility Functions ---
function getRandomWord() {
    let wordList;
    switch (gameDifficulty) {
        case 'easy':
            wordList = easyWords;
            break;
        case 'medium':
            wordList = mediumWords;
            break;
        case 'hard':
            wordList = hardWords;
            break;
        default:
            wordList = easyWords;
    }
    return wordList[Math.floor(Math.random() * wordList.length)];
}

async function fetchRandomWord() {
    return Promise.resolve(getRandomWord());
}

// --- Speech Recognition ---
function initializeSpeechRecognition() {
    try {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!window.SpeechRecognition) {
            console.warn("Speech Recognition API not supported in this browser.");
            spaceErrorHandler.audioError("Speech Recognition API not supported", "Browser compatibility issue");

            document.querySelectorAll('.mic-btn').forEach(btn => {
                btn.disabled = true;
                btn.title = "🛰️ Cosmic communication not supported";
                btn.textContent = "🚫";
                btn.style.opacity = "0.5";
                btn.style.cursor = "not-allowed";
            });

            spaceFeedbackSystem.warning('🎤 Audio Unavailable', 'Cosmic communication systems not supported in this browser');
            return;
        }

        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            try {
                const speechResult = event.results[0][0].transcript;
                if (targetInput) {
                    targetInput.value = speechResult.trim();
                    spaceFeedbackSystem.success('🎤 Message Received', `Cosmic transmission: "${speechResult.trim()}"`);

                    if (navigator.vibrate) {
                        navigator.vibrate([100, 50, 100]);
                    }
                } else {
                    spaceErrorHandler.audioError("No target input found for speech result", "Speech recognition target missing");
                }
            } catch (error) {
                spaceErrorHandler.audioError("Failed to process speech recognition result", error);
            }
        };

        recognition.onerror = (event) => {
            let errorMsg = `Speech recognition error: ${event.error}`;
            let spaceErrorMsg = '';

            switch (event.error) {
                case 'not-allowed':
                    errorMsg = "Microphone access denied. Please allow microphone access in your browser settings.";
                    spaceErrorMsg = "🛰️ Cosmic communication access denied! Please enable microphone permissions.";
                    break;
                case 'no-speech':
                    errorMsg = "No speech detected. Please try again.";
                    spaceErrorMsg = "📡 No cosmic signals detected. Please speak clearly.";
                    break;
                case 'audio-capture':
                    errorMsg = "Audio capture failed. Check your microphone.";
                    spaceErrorMsg = "🎤 Communication device malfunction. Check your microphone.";
                    break;
                case 'network':
                    errorMsg = "Network error during speech recognition.";
                    spaceErrorMsg = "🌌 Cosmic network interference detected.";
                    break;
                default:
                    spaceErrorMsg = `🚨 Unknown cosmic communication error: ${event.error}`;
            }

            spaceErrorHandler.audioError(errorMsg, event.error);
            spaceFeedbackSystem.error('🎤 Communication Failed', spaceErrorMsg);
            stopListeningUIUpdate();
        };

        recognition.onend = () => {
            stopListeningUIUpdate();
            spaceFeedbackSystem.info('📡 Transmission Complete', 'Cosmic communication channel closed');
        };

        recognition.onstart = () => {
            spaceFeedbackSystem.info('🎤 Listening', 'Cosmic communication channel open - speak now!');
        };

    } catch (error) {
        spaceErrorHandler.audioError("Failed to initialize speech recognition", error);
        console.error('Speech recognition initialization failed:', error);
    }

    document.querySelectorAll('.mic-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (!recognition) {
                showErrorModal("Speech recognition is not initialized or supported.");
                return;
            }
            const teamNumber = parseInt(button.dataset.team);
            if (gameStarted && teamNumber !== currentTeam) {
                showErrorModal(`It's not Team ${teamNumber}'s turn!`);
                return;
            }
            targetInput = document.getElementById(`team${teamNumber}-word-log`);
            activeMicButton = button;
            if (targetInput) {
                try {
                    startListeningUIUpdate();
                    recognition.start();
                } catch (error) {
                    showErrorModal("Could not start speech recognition. Is it already running?");
                    stopListeningUIUpdate();
                }
            }
        });
    });
}

function startListeningUIUpdate() {
    if (activeMicButton) {
        activeMicButton.classList.add('listening');
        activeMicButton.disabled = true;
    }
}

function stopListeningUIUpdate() {
    if (activeMicButton) {
        activeMicButton.classList.remove('listening');
        activeMicButton.disabled = false;
        activeMicButton = null;
    }
    targetInput = null;
}

// --- Player Management ---
function addPlayer() {
    try {
        if (gameStarted) {
            spaceErrorHandler.gameStateError('Cannot add players after the game has started!', 'Game is already in progress');
            return;
        }

        const playerNameInput = document.getElementById('player-name');
        if (!playerNameInput) {
            spaceErrorHandler.gameStateError('Player input field not found', 'DOM element missing');
            return;
        }

        const playerName = playerNameInput.value.trim();

        // Enhanced validation with space-themed feedback
        if (!playerName) {
            spaceFeedbackSystem.warning('🛸 Empty Name', 'Please enter a cosmic explorer name!');
            playerNameInput.focus();
            return;
        }

        if (playerName.length < 2) {
            spaceFeedbackSystem.warning('🌟 Name Too Short', 'Cosmic explorer names must be at least 2 characters long!');
            playerNameInput.focus();
            return;
        }

        if (playerName.length > 20) {
            spaceFeedbackSystem.warning('🚀 Name Too Long', 'Cosmic explorer names must be 20 characters or less!');
            playerNameInput.focus();
            return;
        }

        // Check for invalid characters
        if (!/^[a-zA-Z0-9\s\-_]+$/.test(playerName)) {
            spaceFeedbackSystem.warning('⚡ Invalid Characters', 'Only letters, numbers, spaces, hyphens, and underscores are allowed in the cosmic realm!');
            playerNameInput.focus();
            return;
        }

        const nameExists = players.available.includes(playerName) ||
            players.team1.includes(playerName) ||
            players.team2.includes(playerName) ||
            players.team1Leader === playerName ||
            players.team2Leader === playerName;

        if (nameExists) {
            spaceFeedbackSystem.warning('🛰️ Duplicate Explorer', `${playerName} is already registered in our cosmic database!`);
            playerNameInput.focus();
            playerNameInput.select();
            return;
        }

        if (players.available.length >= numberOfPlayers) {
            spaceFeedbackSystem.warning('🌌 Maximum Capacity', `Mission capacity reached! Only ${numberOfPlayers} cosmic explorers allowed.`);
            return;
        }

        // Show loading feedback for better UX
        const loaderId = spaceLoadingSystem.show('🚀 Adding Explorer', `Registering ${playerName} to the cosmic crew...`, 800);

        setTimeout(() => {
            try {
                players.available.push(playerName);
                playerNameInput.value = '';
                updateAvailablePlayersDisplay();

                spaceFeedbackSystem.success('🌟 Explorer Added', `${playerName} has joined the cosmic mission!`);

                // Add tactile feedback
                if (navigator.vibrate) {
                    navigator.vibrate([50, 100, 50]);
                }

                spaceLoadingSystem.hide(loaderId);
            } catch (error) {
                spaceErrorHandler.gameStateError('Failed to add player to the game', error);
                spaceLoadingSystem.hide(loaderId);
            }
        }, 500);

    } catch (error) {
        spaceErrorHandler.gameStateError('Unexpected error while adding player', error);
    }
}

function removePlayerFromAllGroups(playerName) {
    players.available = players.available.filter(p => p !== playerName);
    players.team1 = players.team1.filter(p => p !== playerName);
    players.team2 = players.team2.filter(p => p !== playerName);

    if (players.team1Leader === playerName) players.team1Leader = null;
    if (players.team2Leader === playerName) players.team2Leader = null;
}

function getPlayerCurrentTeam(playerName) {
    if (players.team1Leader === playerName || players.team1.includes(playerName)) return 1;
    if (players.team2Leader === playerName || players.team2.includes(playerName)) return 2;
    return null;
}

// --- UI Updates ---
function updateAvailablePlayersDisplay() {
    const availablePlayersDiv = document.getElementById('available-players');
    availablePlayersDiv.innerHTML = '';
    players.available.forEach(playerName => {
        const playerElement = createPlayerElement(playerName);
        availablePlayersDiv.appendChild(playerElement);
    });
}

function updateTeamPlayersDisplay() {
    const team1PlayersContainer = document.getElementById('team1-players');
    team1PlayersContainer.innerHTML = '';
    players.team1.forEach(playerName => {
        team1PlayersContainer.appendChild(createPlayerElement(playerName));
    });

    const team2PlayersContainer = document.getElementById('team2-players');
    team2PlayersContainer.innerHTML = '';
    players.team2.forEach(playerName => {
        team2PlayersContainer.appendChild(createPlayerElement(playerName));
    });

    const team1LeaderContainer = document.getElementById('team1-leader');
    team1LeaderContainer.innerHTML = '';
    if (players.team1Leader) {
        team1LeaderContainer.appendChild(createPlayerElement(players.team1Leader, true));
    }

    const team2LeaderContainer = document.getElementById('team2-leader');
    team2LeaderContainer.innerHTML = '';
    if (players.team2Leader) {
        team2LeaderContainer.appendChild(createPlayerElement(players.team2Leader, true));
    }
}

// --- Drag and Drop (Unaltered as requested) ---
function allowDrop(event) {
    event.preventDefault();
}

// Performance-optimized drag start handler
function handleTouchStart(event) {
    if (gameStarted) return;

    // Safari-specific detection (cached for performance)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // Prevent default touch behaviors to avoid scrolling and zooming during drag
    event.preventDefault();
    event.stopPropagation();

    draggedItem = event.target.closest('.player');
    if (!draggedItem) return;

    // Cache DOM references for better performance
    originalParent = draggedItem.parentNode;
    originalNextSibling = draggedItem.nextSibling;

    const touch = event.touches[0];
    const rect = draggedItem.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    const elementPageX = rect.left + scrollX;
    const elementPageY = rect.top + scrollY;

    offsetX = touch.pageX - elementPageX;
    offsetY = touch.pageY - elementPageY;

    // Batch DOM updates for better performance
    requestAnimationFrame(() => {
        // Enhanced visual feedback for touch interaction
        draggedItem.classList.add('dragging');
        draggedItem.style.position = 'fixed';
        draggedItem.style.zIndex = '1000';
        draggedItem.style.pointerEvents = 'none';
        draggedItem.style.cursor = 'grabbing';

        // Performance optimizations
        draggedItem.style.willChange = 'transform';
        draggedItem.style.transform = 'translateZ(0)';
        draggedItem.style.webkitTransform = 'translateZ(0)';
        draggedItem.style.backfaceVisibility = 'hidden';
        draggedItem.style.webkitBackfaceVisibility = 'hidden';

        // Add cosmic drag glow effect
        draggedItem.style.filter = 'brightness(1.2) saturate(1.3)';

        // Safari-specific drag optimizations
        if (isSafari) {
            draggedItem.style.webkitUserSelect = 'none';
            draggedItem.style.webkitTouchCallout = 'none';
        }

        // Enhanced haptic feedback pattern for drag start
        if (navigator.vibrate) {
            navigator.vibrate([50, 30, 50]); // More complex vibration pattern
        }

        // Add visual feedback to all drop zones (cached query)
        const dropZones = document.querySelectorAll('.players-list, .leader-slot');
        dropZones.forEach(zone => {
            zone.style.transition = 'all 0.3s ease';
            zone.style.borderColor = 'rgba(0, 247, 255, 0.6)';
            zone.style.backgroundColor = 'rgba(0, 247, 255, 0.05)';
        });

        // Initial position update
        const initialX = touch.pageX - offsetX - window.pageXOffset;
        const initialY = touch.pageY - offsetY - window.pageYOffset;

        // Use transform3d for hardware acceleration
        draggedItem.style.transform = `translate3d(${initialX}px, ${initialY}px, 0) scale(1.08) rotate(3deg)`;
        draggedItem.style.webkitTransform = `translate3d(${initialX}px, ${initialY}px, 0) scale(1.08) rotate(3deg)`;
    });
}

// Performance-optimized drag move handler with throttling
function handleTouchMove(event) {
    if (!draggedItem || gameStarted) return;

    // Prevent default behaviors including scrolling and zooming
    event.preventDefault();
    event.stopPropagation();

    const touch = event.touches[0];
    const x = touch.pageX - offsetX - window.pageXOffset;
    const y = touch.pageY - offsetY - window.pageYOffset;

    // Throttle updates for better performance (only update if position changed significantly)
    const threshold = 2; // pixels
    if (draggedItem._lastX && draggedItem._lastY) {
        if (Math.abs(x - draggedItem._lastX) < threshold && Math.abs(y - draggedItem._lastY) < threshold) {
            return;
        }
    }

    draggedItem._lastX = x;
    draggedItem._lastY = y;

    // Use single requestAnimationFrame for smooth dragging
    if (!draggedItem._animationFrame) {
        draggedItem._animationFrame = requestAnimationFrame(() => {
            if (!draggedItem) return;

            // Use transform3d for hardware acceleration
            draggedItem.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.08) rotate(3deg)`;
            draggedItem.style.webkitTransform = `translate3d(${x}px, ${y}px, 0) scale(1.08) rotate(3deg)`;

            draggedItem._animationFrame = null;
        });
    }

    // Remove previous drop target highlights
    removeDropTargetHighlight();

    // Temporarily hide dragged item to detect drop target (Safari-optimized)
    draggedItem.style.visibility = 'hidden';
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    draggedItem.style.visibility = 'visible';

    if (elementBelow) {
        const dropTarget = elementBelow.closest('.players-list, .leader-slot, #available-players');
        if (dropTarget && dropTarget !== originalParent) {
            dropTarget.classList.add('drag-over');

            // Enhanced visual feedback for different drop zones
            if (dropTarget.classList.contains('leader-slot')) {
                // Special feedback for leader slots
                dropTarget.style.borderColor = 'var(--space-yellow)';
                dropTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.15)';
                dropTarget.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.4), inset 0 0 15px rgba(255, 215, 0, 0.2)';

                // Enhanced haptic feedback for leader slot
                if (navigator.vibrate) {
                    navigator.vibrate([30, 20, 30]);
                }
            } else if (dropTarget.id === 'team1-players' || dropTarget.closest('#team1')) {
                // Team 1 specific feedback
                dropTarget.style.borderColor = 'var(--space-team1)';
                dropTarget.style.backgroundColor = 'rgba(79, 195, 247, 0.1)';

                if (navigator.vibrate) {
                    navigator.vibrate(25);
                }
            } else if (dropTarget.id === 'team2-players' || dropTarget.closest('#team2')) {
                // Team 2 specific feedback
                dropTarget.style.borderColor = 'var(--space-team2)';
                dropTarget.style.backgroundColor = 'rgba(244, 143, 177, 0.1)';

                if (navigator.vibrate) {
                    navigator.vibrate(25);
                }
            } else {
                // Available players feedback
                dropTarget.style.borderColor = 'var(--space-primary)';
                dropTarget.style.backgroundColor = 'rgba(0, 247, 255, 0.1)';

                if (navigator.vibrate) {
                    navigator.vibrate(20);
                }
            }
        }
    }
}

// Performance-optimized drag reset function
function resetDraggedItem() {
    if (draggedItem && originalParent) {
        // Cancel any pending animation frames
        if (draggedItem._animationFrame) {
            cancelAnimationFrame(draggedItem._animationFrame);
            draggedItem._animationFrame = null;
        }

        // Clean up performance tracking
        delete draggedItem._lastX;
        delete draggedItem._lastY;

        // Batch DOM updates for better performance
        requestAnimationFrame(() => {
            // Reset all enhanced drag-related styles efficiently
            const resetStyles = {
                position: '',
                left: '',
                top: '',
                zIndex: '',
                pointerEvents: '',
                visibility: '',
                cursor: '',
                filter: '',
                transform: 'translateZ(0)',
                webkitTransform: 'translateZ(0)',
                willChange: 'auto'
            };

            Object.assign(draggedItem.style, resetStyles);
            draggedItem.classList.remove('dragging');

            // Return to original position with smooth animation
            if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
                originalParent.insertBefore(draggedItem, originalNextSibling);
            } else {
                originalParent.appendChild(draggedItem);
            }

            // Add haptic feedback for reset
            if (navigator.vibrate) {
                navigator.vibrate([25, 15, 25]);
            }
        });
    }

    // Reset all drop zone visual feedback efficiently
    const dropZones = document.querySelectorAll('.players-list, .leader-slot');
    if (dropZones.length > 0) {
        requestAnimationFrame(() => {
            dropZones.forEach(zone => {
                const resetZoneStyles = {
                    borderColor: '',
                    backgroundColor: '',
                    boxShadow: '',
                    transform: '',
                    webkitTransform: '',
                    willChange: 'auto'
                };
                Object.assign(zone.style, resetZoneStyles);
            });
        });
    }

    // Clean up drag state
    draggedItem = null;
    originalParent = null;
    originalNextSibling = null;
    removeDropTargetHighlight();
}

function drag(event) {
    event.dataTransfer.setData("text/plain", event.target.textContent);
}

function drop(ev) {
    ev.preventDefault();
    if (gameStarted) return;
    const playerName = ev.dataTransfer.getData("text");
    const teamElement = ev.target.closest('.team');
    const teamId = teamElement ? teamElement.id : null;
    if (teamId === 'team1' || teamId === 'team2') {
        const team = teamId === 'team1' ? 'team1' : 'team2';
        if (players[team].length >= maxTeamSize) {
            showErrorModal(`Team ${teamId} is already full (max ${maxTeamSize} players)!`);
            return;
        }
        showConfirmationDialog(`Are you sure you want to move ${playerName} to ${team}?`, () => {
            removePlayerFromAllGroups(playerName);
            players[team].push(playerName);
            updateTeamPlayersDisplay();
            updateAvailablePlayersDisplay();
        });
    }
}

function handleTeamDrop(event, teamNumber, isLeaderSlot) {
    try {
        event.preventDefault();
        if (gameStarted) {
            spaceFeedbackSystem.warning('🚀 Mission Active', 'Cannot reassign cosmic explorers during active mission!');
            return false;
        }
        const playerName = event.dataTransfer.getData("text/plain");
        if (!playerName) return false;

        const team = `team${teamNumber}`;
        const currentTeamOfPlayer = getPlayerCurrentTeam(playerName);

        if (isLeaderSlot) {
            const existingLeader = teamNumber === 1 ? players.team1Leader : players.team2Leader;
            if (existingLeader === playerName) return false;

            if (existingLeader) {
                showConfirmationDialog(`Switch positions between ${existingLeader} (Leader) and ${playerName}?`, () => {
                    removePlayerFromAllGroups(playerName);
                    removePlayerFromAllGroups(existingLeader);
                    if (teamNumber === 1) players.team1Leader = playerName;
                    else players.team2Leader = playerName;
                    if (currentTeamOfPlayer === 1) players.team1.push(existingLeader);
                    else if (currentTeamOfPlayer === 2) players.team2.push(existingLeader);
                    else players.available.push(existingLeader);
                    updateTeamPlayersDisplay();
                    updateAvailablePlayersDisplay();
                }, resetDraggedItem);
            } else {
                if (players[team].length + (players[`team${teamNumber}Leader`] ? 0 : 1) > maxTeamSize) {
                    showErrorModal(`Team ${teamNumber} is already full (max ${maxTeamSize} players)!`);
                    return false;
                }
                showConfirmationDialog(`Make ${playerName} the leader of Team ${teamNumber}?`, () => {
                    removePlayerFromAllGroups(playerName);
                    if (teamNumber === 1) players.team1Leader = playerName;
                    else players.team2Leader = playerName;
                    updateTeamPlayersDisplay();
                    updateAvailablePlayersDisplay();
                }, resetDraggedItem);
            }
        } else {
            if (currentTeamOfPlayer === teamNumber) return false;
            if (players[team].length + (players[`team${teamNumber}Leader`] ? 1 : 0) >= maxTeamSize) {
                showErrorModal(`Team ${teamNumber} is already full (max ${maxTeamSize} players)!`);
                return false;
            }
            showConfirmationDialog(`Move ${playerName} to Team ${teamNumber}?`, () => {
                removePlayerFromAllGroups(playerName);
                players[team].push(playerName);
                updateTeamPlayersDisplay();
                updateAvailablePlayersDisplay();
            }, resetDraggedItem);
        }
        return true;
    } catch (error) {
        spaceErrorHandler.gameStateError('Failed to handle team drop', error);
        return false;
    }
}

function createPlayerElement(playerName, isLeader = false) {
    const playerElement = document.createElement('div');
    playerElement.className = isLeader ? 'player leader locked' : 'player';
    playerElement.draggable = !gameStarted && !isLeader;

    // Enhanced player element structure for better visual feedback
    const playerContent = document.createElement('span');
    playerContent.textContent = playerName;
    playerContent.style.position = 'relative';
    playerContent.style.zIndex = '2';
    playerElement.appendChild(playerContent);

    // Add team color indicators for better visual organization
    const currentTeam = getPlayerCurrentTeam(playerName);
    if (currentTeam === 1) {
        playerElement.style.borderColor = 'var(--space-team1)';
        playerElement.style.boxShadow = `0 0 var(--glow-radius-small) rgba(79, 195, 247, 0.3), inset 0 0 var(--glow-radius-small) rgba(79, 195, 247, 0.1), 0 2px 8px rgba(0, 0, 0, 0.3)`;
    } else if (currentTeam === 2) {
        playerElement.style.borderColor = 'var(--space-team2)';
        playerElement.style.boxShadow = `0 0 var(--glow-radius-small) rgba(244, 143, 177, 0.3), inset 0 0 var(--glow-radius-small) rgba(244, 143, 177, 0.1), 0 2px 8px rgba(0, 0, 0, 0.3)`;
    }

    // Enhanced touch interactions for non-leader players
    if (!isLeader) {
        playerElement.addEventListener('touchstart', handleTouchStart, { passive: false });
        playerElement.addEventListener('touchmove', handleTouchMove, { passive: false });
        playerElement.addEventListener('touchend', handleTouchEnd, { passive: false });

        // Add hover effect for desktop
        playerElement.addEventListener('mouseenter', function () {
            if (!gameStarted && !this.classList.contains('dragging')) {
                this.style.transform = 'translateY(-2px) scale(1.02) translateZ(0)';
                this.style.cursor = 'grab';
            }
        });

        playerElement.addEventListener('mouseleave', function () {
            if (!gameStarted && !this.classList.contains('dragging')) {
                this.style.transform = 'var(--gpu-acceleration)';
                this.style.cursor = 'pointer';
            }
        });

        // Enhanced drag start visual feedback
        playerElement.addEventListener('dragstart', function (e) {
            this.classList.add('dragging');
            // Add haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        });

        playerElement.addEventListener('dragend', function (e) {
            this.classList.remove('dragging');
            this.style.transform = 'var(--gpu-acceleration)';
        });
    } else {
        // Enhanced leader styling feedback
        playerElement.addEventListener('mouseenter', function () {
            if (!gameStarted) {
                this.style.cursor = 'not-allowed';
                // Subtle pulse effect for locked leaders
                this.style.animation = 'cosmic-crown-glow 1s ease-in-out';
            }
        });

        playerElement.addEventListener('mouseleave', function () {
            this.style.animation = 'cosmic-crown-glow 2s ease-in-out infinite alternate';
        });
    }

    return playerElement;
}

// Performance-optimized drag end handler
function handleTouchEnd(event) {
    if (!draggedItem || gameStarted) return;

    // Prevent default behaviors
    event.preventDefault();
    event.stopPropagation();

    // Cancel any pending animation frames
    if (draggedItem._animationFrame) {
        cancelAnimationFrame(draggedItem._animationFrame);
        draggedItem._animationFrame = null;
    }

    // Clean up performance tracking
    delete draggedItem._lastX;
    delete draggedItem._lastY;

    removeDropTargetHighlight();

    const touch = event.changedTouches[0];
    const dropTargetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    let droppedInValidZone = false;
    let requiresConfirmation = false;

    if (dropTargetElement) {
        // Cache DOM queries for better performance
        const teamContainer = dropTargetElement.closest('.team');
        const leaderSlot = dropTargetElement.closest('.leader-slot');
        const playersList = dropTargetElement.closest('.players-list');
        const availablePlayersContainer = dropTargetElement.closest('#available-players');

        if ((leaderSlot || playersList) && !(playersList === originalParent || leaderSlot === originalParent)) {
            const targetTeamNumber = teamContainer ? parseInt(teamContainer.id.replace('team', '')) : null;

            if (targetTeamNumber && (targetTeamNumber === 1 || targetTeamNumber === 2)) {
                const playerName = draggedItem.textContent;
                const isLeaderSlot = !!leaderSlot;

                // Add haptic feedback for successful drop
                if (navigator.vibrate) {
                    navigator.vibrate(100);
                }

                droppedInValidZone = true;
                requiresConfirmation = true;

                // Batch DOM updates for better performance
                requestAnimationFrame(() => {
                    if (handleTeamDrop({
                        preventDefault: () => { },
                        dataTransfer: { getData: () => playerName }
                    }, targetTeamNumber, isLeaderSlot)) {
                        // Successfully handled
                    } else {
                        resetDraggedItem();
                    }
                });
            }
        } else if (availablePlayersContainer && availablePlayersContainer !== originalParent) {
            const playerName = draggedItem.textContent;

            // Add haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(75);
            }

            droppedInValidZone = true;
            requiresConfirmation = true;

            showConfirmationDialog(`Move ${playerName} back to available players?`, () => {
                removePlayerFromAllGroups(playerName);
                players.available.push(playerName);
                updateTeamPlayersDisplay();
                updateAvailablePlayersDisplay();
            }, resetDraggedItem);
        }
    }

    if (!droppedInValidZone || !requiresConfirmation) {
        resetDraggedItem();
    }
}

function removeDropTargetHighlight() {
    document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
        // Reset enhanced visual feedback styles
        el.style.borderColor = '';
        el.style.backgroundColor = '';
        el.style.boxShadow = '';
        el.style.transform = '';
        el.style.webkitTransform = '';
    });
}

// --- Confirmation Dialog ---
function showConfirmationDialog(message, onConfirmCallback, onCancelCallback = resetDraggedItem) {
    const dialog = document.getElementById('confirmation-dialog');
    const messageElement = document.getElementById('confirmation-message');
    messageElement.textContent = message;
    dialog.style.display = 'flex';
    dialog.classList.add('show');
    pendingSwitch = { onConfirm: onConfirmCallback, onCancel: onCancelCallback };
}

function confirmSwitch(confirm) {
    const dialog = document.getElementById('confirmation-dialog');
    dialog.classList.remove('show');
    setTimeout(() => {
        dialog.style.display = 'none';
        if (confirm && pendingSwitch?.onConfirm) {
            pendingSwitch.onConfirm();
        } else if (!confirm && pendingSwitch?.onCancel) {
            pendingSwitch.onCancel();
        }
        pendingSwitch = null;
    }, 300);
}

// --- Game Logic ---
async function startGame() {
    const startButton = document.getElementById('start-btn');
    let buttonLoader = null;

    try {
        // Enhanced validation with space-themed feedback
        if (!players.team1Leader || !players.team2Leader) {
            spaceFeedbackSystem.warning('🛸 Missing Leaders', 'Each cosmic team needs a captain to lead the mission!');
            return;
        }

        if (players.team1.length === 0 || players.team2.length === 0) {
            spaceFeedbackSystem.warning('🌌 Empty Teams', 'Each team needs at least one cosmic explorer!');
            return;
        }

        // Check for balanced teams (optional warning)
        const team1Total = players.team1.length + (players.team1Leader ? 1 : 0);
        const team2Total = players.team2.length + (players.team2Leader ? 1 : 0);
        const teamDifference = Math.abs(team1Total - team2Total);

        if (teamDifference > 2) {
            spaceFeedbackSystem.warning('⚖️ Unbalanced Teams', 'Teams are quite uneven - consider redistributing cosmic explorers for fairness!');
        }

        // Show enhanced loading state
        buttonLoader = spaceLoadingSystem.showButtonLoader(startButton, '🚀 Launching Mission...');
        const globalLoaderId = spaceLoadingSystem.show('🌟 Mission Initialization', 'Preparing cosmic game systems...');

        // Ensure we have a word
        if (!currentWord) {
            spaceLoadingSystem.show('🎯 Word Generation', 'Generating cosmic challenge word...', 2000);
            await generateNewWord();
            if (!currentWord) {
                spaceErrorHandler.gameStateError('Failed to generate a word to start the game', 'Word generation system malfunction');
                if (buttonLoader) buttonLoader.hide();
                spaceLoadingSystem.hide(globalLoaderId);
                return;
            }
        }

        // Validate game state before starting
        if (!validateGameState()) {
            spaceErrorHandler.gameStateError('Game state validation failed', 'Invalid game configuration detected');
            if (buttonLoader) buttonLoader.hide();
            spaceLoadingSystem.hide(globalLoaderId);
            return;
        }

        // Simulate game initialization delay for smooth UX
        await new Promise(resolve => setTimeout(resolve, 1200));

        gameStarted = true;

        // Disable dragging and setup elements with error handling
        try {
            document.querySelectorAll('.player').forEach(p => {
                p.draggable = false;
                p.classList.add('locked');
            });
        } catch (error) {
            spaceErrorHandler.gameStateError('Failed to lock player elements', error);
        }

        const generateWordButton = document.querySelector('.word-controls button:first-child');
        if (generateWordButton) generateWordButton.disabled = true;

        // Hide loading and show game interface with animations
        hideLoadingSpinner();

        // Animate UI transitions
        const elementsToHide = [
            document.getElementById('start-btn'),
            document.querySelector('.game-setup'),
            document.querySelector('.setup-section')
        ];

        const elementsToShow = [
            document.getElementById('referee-controls')
        ];

        // Fade out setup elements
        elementsToHide.forEach((element, index) => {
            if (element) {
                setTimeout(() => {
                    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(-20px) translateZ(0)';
                    setTimeout(() => {
                        element.style.display = 'none';
                    }, 500);
                }, index * 100);
            }
        });

        // Fade in game elements with error handling
        setTimeout(() => {
            try {
                elementsToShow.forEach((element, index) => {
                    if (element) {
                        element.style.display = 'block';
                        element.style.opacity = '0';
                        element.style.transform = 'translateY(20px) translateZ(0)';

                        setTimeout(() => {
                            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                            element.style.opacity = '1';
                            element.style.transform = 'translateY(0) translateZ(0)';
                        }, index * 200 + 100);
                    }
                });
            } catch (error) {
                spaceErrorHandler.gameStateError('Failed to animate game interface', error);
            }
        }, 600);

        // Initialize game state with validation
        try {
            currentRound = 1;
            gameLog = [];

            // Initialize turn by setting the team before the first turn and indices to -1
            currentTeam = 2;
            currentPlayerIndex = { 1: -1, 2: -1 };

            // Hide loading states
            if (buttonLoader) buttonLoader.hide();
            spaceLoadingSystem.hide(globalLoaderId);

            // Success feedback
            spaceFeedbackSystem.success('🚀 Mission Launched', 'Cosmic word game is now active!');

            // Add celebration haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200, 100, 200]);
            }

            // Start the first turn with delay for smooth transition
            setTimeout(() => {
                try {
                    switchTeams();
                } catch (error) {
                    spaceErrorHandler.gameStateError('Failed to start first turn', error);
                }
            }, 1200);

        } catch (error) {
            spaceErrorHandler.gameStateError('Failed to initialize game state', error);
            throw error; // Re-throw to be caught by outer catch block
        }

    } catch (error) {
        console.error('Error starting game:', error);
        spaceErrorHandler.gameStateError('Failed to start the cosmic mission', error);

        // Reset button state
        if (buttonLoader) buttonLoader.hide();
        if (startButton) {
            startButton.disabled = false;
            startButton.textContent = 'Start Game';
            startButton.classList.remove('loading');
        }

        spaceLoadingSystem.hide(globalLoaderId);

        // Reset game state
        gameStarted = false;

        // Re-enable dragging
        try {
            document.querySelectorAll('.player').forEach(p => {
                p.draggable = true;
                p.classList.remove('locked');
            });
        } catch (resetError) {
            console.error('Failed to reset player elements:', resetError);
        }
    }
}

async function generateNewWord() {
    const wordElement = document.getElementById('current-word');
    const toggleButton = document.getElementById('toggle-word-btn');
    const generateButton = document.querySelector('button[onclick="generateNewWord()"]');
    let buttonLoader = null;

    try {
        // Enhanced tactile feedback for button press
        if (generateButton) {
            generateButton.classList.add('touch-active');
            setTimeout(() => generateButton.classList.remove('touch-active'), 150);

            // Show button loading state
            buttonLoader = spaceLoadingSystem.showButtonLoader(generateButton, '🌟 Generating...');
        }

        // Enhanced haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate([30, 50, 30]);
        }

        // Show enhanced loading state with space theme
        const elementLoader = spaceLoadingSystem.showElementLoader(wordElement, '🎯 Generating cosmic word...');

        // Add realistic delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));

        // Attempt to fetch word with retry logic
        let attempts = 0;
        const maxAttempts = 3;
        let newWord = null;

        while (attempts < maxAttempts && !newWord) {
            try {
                attempts++;
                spaceFeedbackSystem.info('🔄 Word Generation', `Attempt ${attempts} of ${maxAttempts}...`, 1000);
                newWord = await fetchRandomWord();

                if (newWord) {
                    break;
                }
            } catch (error) {
                console.warn(`Word generation attempt ${attempts} failed:`, error);
                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }

        if (!newWord) {
            // Fallback to predefined words if API fails
            const fallbackWords = [
                'ADVENTURE', 'GALAXY', 'COSMIC', 'STELLAR', 'NEBULA',
                'PLANET', 'ROCKET', 'SPACE', 'ORBIT', 'METEOR',
                'COMET', 'ASTEROID', 'UNIVERSE', 'STARSHIP', 'MISSION'
            ];
            newWord = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
            spaceFeedbackSystem.warning('🛰️ Fallback Mode', 'Using backup cosmic word database');
        }

        currentWord = newWord;

        if (wordElement && currentWord) {
            // Hide element loader
            if (elementLoader) elementLoader.hide();

            // Enhanced word reveal animation
            wordElement.classList.add('word-reveal');

            setTimeout(() => {
                wordElement.textContent = currentWord;
                wordElement.classList.remove('hidden');
                isWordVisible = true;
                if (toggleButton) toggleButton.textContent = 'Hide Word';

                // Complete reveal animation
                setTimeout(() => {
                    wordElement.classList.remove('word-reveal');
                    wordElement.classList.add('word-revealed');
                    setTimeout(() => wordElement.classList.remove('word-revealed'), 300);
                }, 100);

                // Success feedback
                spaceFeedbackSystem.success('🎯 Word Generated', `New cosmic challenge: ${currentWord}`);

            }, 300);
        }

    } catch (error) {
        console.error('Error generating word:', error);

        // Enhanced error handling with space theme
        spaceErrorHandler.networkError('Failed to generate cosmic word', error);

        if (wordElement) {
            if (elementLoader) elementLoader.hide();
            wordElement.textContent = 'Word Generation Failed';
            wordElement.classList.remove('loading-word', 'word-fade-out', 'word-reveal');
            wordElement.classList.add('word-error');
            setTimeout(() => {
                wordElement.classList.remove('word-error');
                wordElement.textContent = currentWord || 'Click Generate Word';
            }, 3000);
        }

        // Try to use a fallback word
        if (!currentWord) {
            const emergencyWords = ['MISSION', 'COSMIC', 'SPACE', 'GALAXY', 'STELLAR'];
            currentWord = emergencyWords[Math.floor(Math.random() * emergencyWords.length)];
            spaceFeedbackSystem.warning('🛰️ Emergency Protocol', `Using emergency word: ${currentWord}`);

            if (wordElement) {
                setTimeout(() => {
                    wordElement.textContent = currentWord;
                    wordElement.classList.remove('word-error');
                }, 1000);
            }
        }

    } finally {
        // Reset generate button with enhanced animation
        if (buttonLoader) {
            buttonLoader.hide();
        }

        if (generateButton) {
            setTimeout(() => {
                generateButton.classList.remove('btn-loading', 'touch-active');
            }, 200);
        }
    }
}

function toggleWordVisibility() {
    try {
        if (!currentWord) {
            spaceFeedbackSystem.warning('🎯 No Word Available', 'Generate a cosmic word first!');
            return;
        }

        const wordElement = document.getElementById('current-word');
        const toggleButton = document.getElementById('toggle-word-btn');

        if (!wordElement || !toggleButton) {
            spaceErrorHandler.gameStateError('Word display elements not found', 'DOM elements missing');
            return;
        }

        // Enhanced tactile feedback for button press
        toggleButton.classList.add('touch-active');
        setTimeout(() => toggleButton.classList.remove('touch-active'), 150);

        // Enhanced haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate([25, 50, 25]);
        }

        // Smooth animation for word visibility toggle
        wordElement.classList.add('word-transitioning');

        setTimeout(() => {
            isWordVisible = !isWordVisible;
            wordElement.classList.toggle('hidden');
            toggleButton.textContent = isWordVisible ? 'Hide Word' : 'Show Word';

            // Remove transition class after animation completes
            setTimeout(() => {
                wordElement.classList.remove('word-transitioning');
            }, 300);
        }, 150);
    } catch (error) {
        spaceErrorHandler.gameStateError('Failed to toggle word visibility', error);
    }
}

function switchTeams() {
    // Switch to the next team
    currentTeam = currentTeam === 1 ? 2 : 1;

    const teamPlayers = players[`team${currentTeam}`];
    if (teamPlayers.length > 0) {
        // Cycle to the next player on that team
        currentPlayerIndex[currentTeam] = (currentPlayerIndex[currentTeam] + 1) % teamPlayers.length;
        currentGuesser = teamPlayers[currentPlayerIndex[currentTeam]];
    } else {
        // If a team has no regular players, the leader is the guesser
        currentGuesser = players[`team${currentTeam}Leader`];
    }

    showTurnOverlay();
    highlightCurrentTeam();
    updateActiveTeamLog();
}

function highlightCurrentTeam() {
    document.querySelectorAll('.team').forEach(team => {
        team.classList.remove('active');
        if (team.id === `team${currentTeam}`) {
            team.classList.add('active');
        }
    });
}

function showTurnOverlay() {
    const overlay = document.getElementById('turn-overlay');
    const playerNameDisplay = document.getElementById('turn-player-name');
    const teamIndicatorDisplay = document.getElementById('turn-team-indicator');
    const currentTeamName = `Team ${currentTeam}`;
    const teamColor = currentTeam === 1 ? 'var(--team1-color)' : 'var(--team2-color)';

    // Enhanced content with cosmic styling
    playerNameDisplay.textContent = `${currentGuesser}'s Turn!`;
    teamIndicatorDisplay.textContent = currentTeamName;
    playerNameDisplay.style.color = teamColor;

    // Add team-specific cosmic effects
    overlay.className = `turn-overlay team-${currentTeam}`;

    // Enhanced cosmic entrance animation
    overlay.classList.add('show', 'cosmic-entrance');

    // Add cosmic particles effect
    createCosmicParticles(overlay);

    // Auto-hide with enhanced exit animation
    setTimeout(() => {
        overlay.classList.add('cosmic-exit');
        setTimeout(() => {
            overlay.classList.remove('show', 'cosmic-entrance', 'cosmic-exit');
            // Clean up particles
            const particles = overlay.querySelectorAll('.cosmic-particle');
            particles.forEach(particle => particle.remove());
        }, 500);
    }, 2500);
}

// Create cosmic particle effects for turn overlay
function createCosmicParticles(container) {
    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'cosmic-particle';

        // Random positioning around the overlay
        const angle = (i / particleCount) * 360;
        const radius = 150 + Math.random() * 100;
        const x = Math.cos(angle * Math.PI / 180) * radius;
        const y = Math.sin(angle * Math.PI / 180) * radius;

        particle.style.left = `calc(50% + ${x}px)`;
        particle.style.top = `calc(50% + ${y}px)`;
        particle.style.animationDelay = `${i * 0.1}s`;

        container.appendChild(particle);
    }
}

function updateActiveTeamLog() {
    document.querySelectorAll('.team-log').forEach((log, index) => {
        const isActive = (index + 1) === currentTeam;
        log.style.display = isActive ? 'block' : 'none';
        if (isActive) log.classList.add('active');
        else log.classList.remove('active');
    });
}

function logWord(teamNumber) {
    if (teamNumber !== currentTeam) {
        showErrorModal(`It's not Team ${teamNumber}'s turn!`);
        return;
    }

    const wordLogInput = document.getElementById(`team${teamNumber}-word-log`);
    const word = wordLogInput.value.trim().toUpperCase();
    if (word === '') return;

    const playerName = currentGuesser;
    gameLog.push({
        player: playerName,
        word: word,
        team: teamNumber,
        timestamp: new Date(),
        type: word === currentWord ? 'correct-guess' : 'wrong-guess'
    });

    const wordDisplay = document.getElementById(`team${teamNumber}-word-display`);
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    const messageSpan = document.createElement('span');
    messageSpan.className = 'message';
    messageSpan.textContent = `${playerName}: ${word}`;
    const timeSpan = document.createElement('span');
    timeSpan.className = 'timestamp';
    timeSpan.textContent = formatTime(new Date());
    logEntry.appendChild(messageSpan);
    logEntry.appendChild(timeSpan);
    wordDisplay.appendChild(logEntry);
    wordDisplay.scrollTop = wordDisplay.scrollHeight;
    wordLogInput.value = '';

    if (word === currentWord) {
        showErrorModal(`Team ${teamNumber} guessed the password! Round ${currentRound} win!`, true);
        endRound();
        return;
    }

    // On wrong guess, switch to the next team and player
    switchTeams();
}

function formatTime(date) {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

async function endRound() {
    currentRound++;
    if (currentRound > totalRounds) {
        setTimeout(endGame, 2000);
    } else {
        setTimeout(async () => {
            await generateNewWord();
            // The team that lost the previous round starts the next round.
            switchTeams();
        }, 2000);
    }
}

function endGame() {
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';
    resultsSection.classList.add('show');
    document.getElementById('referee-controls').style.display = 'none';

    const correctGuesses = gameLog.filter(entry => entry.type === 'correct-guess');
    document.getElementById('guess-results').innerHTML = correctGuesses.map(guess => `
        <div class="result-item">
            <span>${guess.player} (Team ${guess.team})</span>
            <span>${guess.word}</span>
        </div>
    `).join('') || "<p>No correct guesses were made.</p>";

    document.getElementById('hint-results').innerHTML = "<p>Hint effectiveness tracking is not available.</p>";

    const team1Score = correctGuesses.filter(g => g.team === 1).length;
    const team2Score = correctGuesses.filter(g => g.team === 2).length;
    let finalMessage = `Game Over!<br>Team 1: ${team1Score} | Team 2: ${team2Score}<br>`;
    if (team1Score > team2Score) {
        finalMessage += `<span class="final-score">Team 1 Wins!</span>`;
    } else if (team2Score > team1Score) {
        finalMessage += `<span class="final-score">Team 2 Wins!</span>`;
    } else {
        finalMessage += `<span class="final-score">It's a Tie!</span>`;
    }
    showErrorModal(finalMessage, true);
}

// --- Enhanced Screen Transitions with Cosmic Effects ---
function switchScreen(hideScreenId, showScreenId, callback = null) {
    const hideScreen = document.getElementById(hideScreenId);
    const showScreen = document.getElementById(showScreenId);

    if (!hideScreen || !showScreen) {
        console.warn('Screen transition failed: Invalid screen IDs');
        return;
    }

    // Add cosmic transition effects
    hideScreen.classList.add('screen-exit');

    // Wait for exit animation to complete
    setTimeout(() => {
        hideScreen.classList.remove('active', 'screen-exit');
        showScreen.classList.add('active');

        // Trigger entrance animation
        setTimeout(() => {
            showScreen.classList.add('screen-enter');

            // Execute callback after entrance animation
            if (callback) {
                setTimeout(callback, 300);
            }
        }, 50);

        // Clean up entrance class
        setTimeout(() => {
            showScreen.classList.remove('screen-enter');
        }, 800);

    }, 400); // Match CSS transition duration
}

// Enhanced screen transition with loading state
function switchScreenWithLoading(hideScreenId, showScreenId, loadingText = 'Loading...', callback = null) {
    showLoadingSpinner(loadingText);

    setTimeout(() => {
        switchScreen(hideScreenId, showScreenId, () => {
            hideLoadingSpinner();
            if (callback) callback();
        });
    }, 500); // Brief loading delay for smooth UX
}

// Space-themed loading spinner system
function showLoadingSpinner(text = 'Loading...') {
    // Remove existing spinner if present
    hideLoadingSpinner();

    const spinner = document.createElement('div');
    spinner.id = 'cosmic-loading-spinner';
    spinner.className = 'cosmic-loading-overlay';

    spinner.innerHTML = `
        <div class="cosmic-loading-container">
            <div class="cosmic-spinner">
                <div class="cosmic-ring cosmic-ring-1"></div>
                <div class="cosmic-ring cosmic-ring-2"></div>
                <div class="cosmic-ring cosmic-ring-3"></div>
                <div class="cosmic-core"></div>
            </div>
            <div class="cosmic-loading-text">${text}</div>
            <div class="cosmic-loading-particles">
                ${Array.from({ length: 8 }, (_, i) => `<div class="loading-particle" style="--delay: ${i * 0.2}s"></div>`).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(spinner);

    // Trigger entrance animation
    requestAnimationFrame(() => {
        spinner.classList.add('show');
    });
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('cosmic-loading-spinner');
    if (spinner) {
        spinner.classList.add('hide');
        setTimeout(() => {
            spinner.remove();
        }, 400);
    }
}

// Show loading for async operations
function showLoadingForOperation(operation, loadingText = 'Processing...') {
    showLoadingSpinner(loadingText);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                const result = operation();
                hideLoadingSpinner();
                resolve(result);
            } catch (error) {
                hideLoadingSpinner();
                reject(error);
            }
        }, 300);
    });
}

function selectPlayerCount(count) {
    numberOfPlayers = count;
    maxTeamSize = Math.ceil(numberOfPlayers / 2);
    switchScreenWithLoading('player-select-screen', 'difficulty-select-screen', 'Preparing Difficulty Selection...');
}

function selectDifficulty(difficulty) {
    gameDifficulty = difficulty;
    switchScreenWithLoading('difficulty-select-screen', 'round-select-screen', 'Loading Round Options...');
}

function selectRounds(rounds) {
    totalRounds = rounds;
    const roundsInput = document.getElementById('rounds');
    if (roundsInput) roundsInput.value = rounds;

    switchScreenWithLoading('round-select-screen', 'game-container', 'Initializing Game...', () => {
        // Show relevant game sections with staggered animations
        const gameContainer = document.getElementById('game-container');
        const sections = [
            document.querySelector('.game-setup'),
            document.querySelector('.setup-section'),
            document.querySelector('.game-controls'),
            document.querySelector('.word-section')
        ];

        gameContainer.style.display = 'block';

        // Staggered section reveal with cosmic effects
        sections.forEach((section, index) => {
            if (section) {
                section.style.display = 'block';
                section.style.opacity = '0';
                section.style.transform = 'translateY(30px) translateZ(0)';

                setTimeout(() => {
                    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    section.style.opacity = '1';
                    section.style.transform = 'translateY(0) translateZ(0)';
                }, index * 200);
            }
        });

        if (!currentWord) {
            setTimeout(() => {
                generateNewWord();
            }, 800);
        }
    });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .btn, .team').forEach(el => {
        observer.observe(el);
    });

    const playerSlider = document.getElementById('player-slider-input');
    const sliderValueDisplay = document.getElementById('slider-value');
    const confirmPlayerCountBtn = document.getElementById('confirm-player-count-btn');

    if (playerSlider && sliderValueDisplay) {
        sliderValueDisplay.textContent = playerSlider.value;
        playerSlider.addEventListener('input', () => {
            sliderValueDisplay.textContent = playerSlider.value;
        });
    }

    if (confirmPlayerCountBtn) {
        confirmPlayerCountBtn.addEventListener('click', () => {
            selectPlayerCount(parseInt(playerSlider.value));
        });
    }

    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('toggle-word-btn').addEventListener('click', toggleWordVisibility);

    // Set initial screen
    switchScreen(null, 'player-select-screen');

    updateAvailablePlayersDisplay();
    initializeSpeechRecognition();
});


// --- Modal Controls ---
function showErrorModal(message, isVictory = false) {
    const modal = document.getElementById('error-modal');
    const modalContent = modal.querySelector('.modal-content');
    const errorMessage = document.getElementById('error-message');

    modalContent.classList.remove('victory');
    const existingConfetti = modalContent.querySelector('.confetti-container');
    if (existingConfetti) {
        existingConfetti.remove();
    }

    if (isVictory) {
        modalContent.classList.add('victory');
        errorMessage.innerHTML = `<div class="victory-message">${message}</div>`;
        triggerConfetti();
    } else {
        errorMessage.textContent = message;
    }

    modal.classList.add('show');
}

function closeErrorModal() {
    const modal = document.getElementById('error-modal');
    modal.classList.remove('show');
}

function triggerConfetti() {
    const container = document.querySelector('.modal-content.victory .victory-message');
    if (!container) return;

    let confettiContainer = container.querySelector('.confetti-container');
    if (!confettiContainer) {
        confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        container.appendChild(confettiContainer);
    }
    confettiContainer.innerHTML = '';

    const confettiCount = 100;
    const colors = ['#ff0077', '#00eeff', '#7700ff', '#ffffff', '#f4d35e'];
    for (let i = 0; i < confettiCount; i++) {
        const piece = document.createElement('i');
        piece.className = 'confetti-piece';
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * 3 + 4;
        piece.style.animationDuration = `${duration}s`;
        const delay = Math.random() * 5;
        piece.style.animationDelay = `${delay}s`;
        confettiContainer.appendChild(piece);
    }
}
''
// Enhanced error handling with cosmic-themed error messages
function showCosmicError(message, isSuccess = false) {
    const errorType = isSuccess ? 'success' : 'error';
    const cosmicMessage = isSuccess ?
        `🌟 ${message}` :
        `⚠️ ${message}`;

    showLoadingSpinner(cosmicMessage);

    setTimeout(() => {
        hideLoadingSpinner();
        if (!isSuccess) {
            showErrorModal(message);
        }
    }, 1500);
}

// Smooth animation coordination system
class AnimationCoordinator {
    constructor() {
        this.activeAnimations = new Set();
        this.animationQueue = [];
    }

    addAnimation(name, duration = 1000) {
        this.activeAnimations.add(name);
        setTimeout(() => {
            this.activeAnimations.delete(name);
            this.processQueue();
        }, duration);
    }

    queueAnimation(callback, waitFor = []) {
        if (waitFor.some(name => this.activeAnimations.has(name))) {
            this.animationQueue.push({ callback, waitFor });
        } else {
            callback();
        }
    }

    processQueue() {
        this.animationQueue = this.animationQueue.filter(item => {
            if (!item.waitFor.some(name => this.activeAnimations.has(name))) {
                item.callback();
                return false;
            }
            return true;
        });
    }
}

// Global animation coordinator
const animationCoordinator = new AnimationCoordinator();

// Enhanced performance monitoring for animations
function monitorAnimationPerformance() {
    let frameCount = 0;
    let lastTime = performance.now();

    function checkFrame(currentTime) {
        frameCount++;

        if (currentTime - lastTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

            // Adjust animation quality based on performance
            if (fps < 30) {
                document.body.classList.add('low-performance');
                console.warn('Low FPS detected, reducing animation complexity');
            } else if (fps > 50) {
                document.body.classList.remove('low-performance');
            }

            frameCount = 0;
            lastTime = currentTime;
        }

        requestAnimationFrame(checkFrame);
    }

    requestAnimationFrame(checkFrame);
}

// Initialize performance monitoring
document.addEventListener('DOMContentLoaded', () => {
    monitorAnimationPerformance();
});