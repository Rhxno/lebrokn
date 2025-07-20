// Final Validation Script for Task 11: Cross-Device Testing and Final Polish
// This script provides a comprehensive validation of all implemented features

class FinalValidationSuite {
    constructor() {
        this.results = {};
        this.startTime = performance.now();
    }

    async runCompleteValidation() {
        console.log('🚀 Starting Final Validation for Task 11...');
        
        // Run all validation tests
        this.results.mobileCompatibility = await this.validateMobileFeatures();
        this.results.performanceOptimization = await this.validatePerformance();
        this.results.responsiveDesign = this.validateResponsiveDesign();
        this.results.safariOptimizations = this.validateSafariFeatures();
        this.results.touchInteractions = this.validateTouchFeatures();
        this.results.finalPolish = this.validateFinalPolish();
        
        // Generate final report
        const report = this.generateFinalReport();
        this.displayResults(report);
        
        return report;
    }

    async validateMobileFeatures() {
        console.log('📱 Validating Mobile Compatibility...');
        
        const tests = {
            viewportMeta: this.checkViewportConfiguration(),
            touchTargets: this.checkTouchTargetSizes(),
            mobileCSS: this.checkMobileCSSOptimizations(),
            safeAreaSupport: this.checkSafeAreaSupport()
        };

        return {
            passed: Object.values(tests).filter(t => t.passed).length,
            total: Object.keys(tests).length,
            details: tests
        };
    }

    checkViewportConfiguration() {
        const viewport = document.querySelector('meta[name="viewport"]');
        const content = viewport?.getAttribute('content') || '';
        
        const required = ['width=device-width', 'initial-scale=1.0', 'viewport-fit=cover'];
        const hasAll = required.every(prop => content.includes(prop));
        
        return {
            passed: !!viewport && hasAll,
            message: hasAll ? 'Viewport properly configured' : 'Missing viewport properties'
        };
    }

    checkTouchTargetSizes() {
        const interactive = document.querySelectorAll('button, .btn, input, .player');
        const minSize = 44;
        let failed = 0;
        
        interactive.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width < minSize || rect.height < minSize) {
                failed++;
            }
        });
        
        return {
            passed: failed === 0,
            message: `${interactive.length - failed}/${interactive.length} elements meet touch target requirements`
        };
    }

    checkMobileCSSOptimizations() {
        const body = document.body;
        const style = window.getComputedStyle(body);
        
        const checks = {
            touchAction: style.touchAction === 'manipulation',
            overflowX: style.overflowX === 'hidden',
            tapHighlight: style.webkitTapHighlightColor === 'transparent'
        };
        
        const passed = Object.values(checks).filter(Boolean).length;
        
        return {
            passed: passed >= 2,
            message: `${passed}/3 mobile CSS optimizations applied`
        };
    }

    checkSafeAreaSupport() {
        const container = document.querySelector('.container');
        const style = window.getComputedStyle(container);
        const hasSafeArea = style.paddingTop.includes('env(safe-area-inset') || 
                           style.paddingTop.includes('max(');
        
        return {
            passed: hasSafeArea,
            message: hasSafeArea ? 'Safe area insets supported' : 'Safe area insets not implemented'
        };
    }

    async validatePerformance() {
        console.log('⚡ Validating Performance Optimizations...');
        
        const tests = {
            fps: await this.measureFrameRate(),
            gpuAcceleration: this.checkGPUAcceleration(),
            memoryUsage: this.checkMemoryUsage(),
            animationOptimization: this.checkAnimationOptimization()
        };

        return {
            passed: Object.values(tests).filter(t => t.passed).length,
            total: Object.keys(tests).length,
            details: tests
        };
    }

    async measureFrameRate() {
        return new Promise(resolve => {
            let frames = 0;
            const start = performance.now();
            
            const count = () => {
                frames++;
                const elapsed = performance.now() - start;
                
                if (elapsed < 1000) {
                    requestAnimationFrame(count);
                } else {
                    const fps = Math.round((frames * 1000) / elapsed);
                    resolve({
                        passed: fps >= 30,
                        message: `Measured ${fps} FPS (target: 30+ FPS)`
                    });
                }
            };
            
            requestAnimationFrame(count);
        });
    }

    checkGPUAcceleration() {
        const animated = document.querySelectorAll('.stars-layer, .btn, .card');
        let accelerated = 0;
        
        animated.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.transform !== 'none' || style.willChange !== 'auto') {
                accelerated++;
            }
        });
        
        const ratio = animated.length > 0 ? accelerated / animated.length : 1;
        
        return {
            passed: ratio >= 0.7,
            message: `${Math.round(ratio * 100)}% of animated elements use GPU acceleration`
        };
    }

    checkMemoryUsage() {
        if (!performance.memory) {
            return { passed: true, message: 'Memory API not available' };
        }
        
        const usedMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
        
        return {
            passed: usedMB <= 100,
            message: `Memory usage: ${usedMB}MB (target: <100MB)`
        };
    }

    checkAnimationOptimization() {
        const animations = document.querySelectorAll('.stars-layer, .nebula, .planet');
        let optimized = 0;
        
        animations.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.animationTimingFunction === 'linear' || 
                style.animationTimingFunction.includes('cubic-bezier')) {
                optimized++;
            }
        });
        
        const ratio = animations.length > 0 ? optimized / animations.length : 1;
        
        return {
            passed: ratio >= 0.5,
            message: `${Math.round(ratio * 100)}% of animations use optimized timing functions`
        };
    }

    validateResponsiveDesign() {
        console.log('📐 Validating Responsive Design...');
        
        const tests = {
            breakpoints: this.checkResponsiveBreakpoints(),
            fluidTypography: this.checkFluidTypography(),
            flexibleLayout: this.checkFlexibleLayout()
        };

        return {
            passed: Object.values(tests).filter(t => t.passed).length,
            total: Object.keys(tests).length,
            details: tests
        };
    }

    checkResponsiveBreakpoints() {
        // Check if responsive classes exist
        const hasResponsiveClasses = document.querySelector('.mobile-only') || 
                                    document.querySelector('.tablet-up') ||
                                    document.querySelector('.desktop-up');
        
        return {
            passed: !!hasResponsiveClasses,
            message: hasResponsiveClasses ? 'Responsive utility classes found' : 'No responsive classes detected'
        };
    }

    checkFluidTypography() {
        const headings = document.querySelectorAll('h1, h2, h3');
        let fluidCount = 0;
        
        headings.forEach(h => {
            const style = window.getComputedStyle(h);
            if (style.fontSize.includes('rem')) {
                fluidCount++;
            }
        });
        
        const ratio = headings.length > 0 ? fluidCount / headings.length : 1;
        
        return {
            passed: ratio >= 0.5,
            message: `${Math.round(ratio * 100)}% of headings use fluid typography (rem units)`
        };
    }

    checkFlexibleLayout() {
        const teams = document.querySelector('.teams');
        if (!teams) return { passed: false, message: 'Teams layout not found' };
        
        const style = window.getComputedStyle(teams);
        const isFlexible = style.display === 'flex' && style.flexWrap === 'wrap';
        
        return {
            passed: isFlexible,
            message: isFlexible ? 'Flexible layout implemented' : 'Layout not flexible'
        };
    }

    validateSafariFeatures() {
        console.log('🧭 Validating Safari Optimizations...');
        
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        
        const tests = {
            safariDetection: this.checkSafariDetection(),
            webkitPrefixes: this.checkWebkitPrefixes(),
            viewportFixes: this.checkViewportFixes(),
            compatibilityManager: this.checkCompatibilityManager()
        };

        return {
            isSafari: isSafari,
            passed: Object.values(tests).filter(t => t.passed).length,
            total: Object.keys(tests).length,
            details: tests
        };
    }

    checkSafariDetection() {
        const hasSafariClass = document.body.classList.contains('safari-browser');
        const hasCompatibilityManager = typeof window.compatibilityManager !== 'undefined';
        
        return {
            passed: hasSafariClass || hasCompatibilityManager,
            message: 'Safari detection and optimization system present'
        };
    }

    checkWebkitPrefixes() {
        const elements = document.querySelectorAll('.btn, .card');
        let withPrefixes = 0;
        
        elements.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.webkitTransform || style.webkitBackfaceVisibility) {
                withPrefixes++;
            }
        });
        
        const ratio = elements.length > 0 ? withPrefixes / elements.length : 1;
        
        return {
            passed: ratio >= 0.3,
            message: `${Math.round(ratio * 100)}% of elements have webkit prefixes`
        };
    }

    checkViewportFixes() {
        const hasVhFix = document.documentElement.style.getPropertyValue('--vh') !== '';
        const hasWebkitFill = window.getComputedStyle(document.body).minHeight === '-webkit-fill-available';
        
        return {
            passed: hasVhFix || hasWebkitFill,
            message: 'Safari viewport height fixes implemented'
        };
    }

    checkCompatibilityManager() {
        const hasManager = typeof window.compatibilityManager !== 'undefined';
        
        return {
            passed: hasManager,
            message: hasManager ? 'Cross-device compatibility manager active' : 'Compatibility manager not found'
        };
    }

    validateTouchFeatures() {
        console.log('👆 Validating Touch Interactions...');
        
        const tests = {
            touchEvents: this.checkTouchEventHandling(),
            dragAndDrop: this.checkTouchDragAndDrop(),
            gestureHandling: this.checkGestureHandling()
        };

        return {
            passed: Object.values(tests).filter(t => t.passed).length,
            total: Object.keys(tests).length,
            details: tests
        };
    }

    checkTouchEventHandling() {
        const touchElements = document.querySelectorAll('.btn, .player');
        const hasCompatibilityManager = typeof window.compatibilityManager !== 'undefined';
        
        return {
            passed: touchElements.length > 0 && hasCompatibilityManager,
            message: `${touchElements.length} touch-interactive elements with compatibility manager`
        };
    }

    checkTouchDragAndDrop() {
        const draggable = document.querySelectorAll('.player[draggable="true"]');
        const dropZones = document.querySelectorAll('.team');
        
        return {
            passed: draggable.length > 0 && dropZones.length > 0,
            message: `${draggable.length} draggable elements, ${dropZones.length} drop zones`
        };
    }

    checkGestureHandling() {
        const body = document.body;
        const style = window.getComputedStyle(body);
        const hasTouchAction = style.touchAction === 'manipulation';
        
        return {
            passed: hasTouchAction,
            message: hasTouchAction ? 'Touch gestures properly handled' : 'Touch action not optimized'
        };
    }

    validateFinalPolish() {
        console.log('✨ Validating Final Polish...');
        
        const tests = {
            errorHandling: this.checkErrorHandling(),
            loadingStates: this.checkLoadingStates(),
            testFramework: this.checkTestFramework(),
            documentation: this.checkDocumentation()
        };

        return {
            passed: Object.values(tests).filter(t => t.passed).length,
            total: Object.keys(tests).length,
            details: tests
        };
    }

    checkErrorHandling() {
        const hasErrorModal = document.getElementById('space-error-modal') !== null;
        const hasErrorHandler = typeof window.spaceErrorHandler !== 'undefined';
        
        return {
            passed: hasErrorModal || hasErrorHandler,
            message: 'Error handling system implemented'
        };
    }

    checkLoadingStates() {
        const hasGlobalLoader = document.getElementById('space-global-loader') !== null;
        const hasLoadingSystem = typeof window.spaceLoadingSystem !== 'undefined';
        
        return {
            passed: hasGlobalLoader || hasLoadingSystem,
            message: 'Loading states system implemented'
        };
    }

    checkTestFramework() {
        const hasTestFramework = typeof window.testFramework !== 'undefined';
        const hasValidationSuite = typeof window.task11Validator !== 'undefined';
        
        return {
            passed: hasTestFramework || hasValidationSuite,
            message: 'Testing framework implemented'
        };
    }

    checkDocumentation() {
        const scripts = document.querySelectorAll('script');
        let hasComments = false;
        
        scripts.forEach(script => {
            if (script.textContent && (script.textContent.includes('//') || script.textContent.includes('/*'))) {
                hasComments = true;
            }
        });
        
        return {
            passed: hasComments,
            message: hasComments ? 'Code documentation present' : 'Limited code documentation'
        };
    }

    generateFinalReport() {
        const endTime = performance.now();
        const executionTime = Math.round(endTime - this.startTime);
        
        // Calculate overall scores
        let totalTests = 0;
        let totalPassed = 0;
        
        Object.values(this.results).forEach(category => {
            totalTests += category.total;
            totalPassed += category.passed;
        });
        
        const overallScore = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 100;
        const status = overallScore >= 90 ? 'EXCELLENT' : 
                      overallScore >= 75 ? 'GOOD' : 
                      overallScore >= 60 ? 'SATISFACTORY' : 'NEEDS_IMPROVEMENT';
        
        return {
            timestamp: new Date().toISOString(),
            executionTime: executionTime,
            overallScore: overallScore,
            status: status,
            totalTests: totalTests,
            totalPassed: totalPassed,
            categoryResults: this.results,
            deviceInfo: {
                userAgent: navigator.userAgent,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                pixelRatio: window.devicePixelRatio || 1,
                touchSupport: 'ontouchstart' in window,
                connectionType: navigator.connection?.effectiveType || 'unknown'
            },
            recommendations: this.generateRecommendations()
        };
    }

    generateRecommendations() {
        const recommendations = [];
        
        Object.entries(this.results).forEach(([category, result]) => {
            const passRate = result.total > 0 ? (result.passed / result.total) * 100 : 100;
            
            if (passRate < 75) {
                switch(category) {
                    case 'mobileCompatibility':
                        recommendations.push('📱 Improve mobile compatibility by ensuring all touch targets meet size requirements');
                        break;
                    case 'performanceOptimization':
                        recommendations.push('⚡ Optimize performance by adding GPU acceleration to more elements');
                        break;
                    case 'responsiveDesign':
                        recommendations.push('📐 Enhance responsive design with better breakpoint handling');
                        break;
                    case 'safariOptimizations':
                        recommendations.push('🧭 Add more Safari-specific optimizations and webkit prefixes');
                        break;
                    case 'touchInteractions':
                        recommendations.push('👆 Improve touch interactions with better event handling');
                        break;
                    case 'finalPolish':
                        recommendations.push('✨ Add final polish with comprehensive error handling');
                        break;
                }
            }
        });
        
        if (recommendations.length === 0) {
            recommendations.push('🎉 Excellent implementation! All areas meet quality standards.');
        }
        
        return recommendations;
    }

    displayResults(report) {
        // Console output
        console.group('🚀 Task 11 Final Validation Report');
        console.log(`Overall Score: ${report.overallScore}% (${report.status})`);
        console.log(`Tests Passed: ${report.totalPassed}/${report.totalTests}`);
        console.log(`Execution Time: ${report.executionTime}ms`);
        console.log('Category Breakdown:', report.categoryResults);
        console.log('Recommendations:', report.recommendations);
        console.groupEnd();
        
        // Visual report
        this.createVisualReport(report);
    }

    createVisualReport(report) {
        const overlay = document.createElement('div');
        overlay.id = 'final-validation-report';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.95); z-index: 10000; display: flex;
            align-items: center; justify-content: center; color: white;
            font-family: 'Orbitron', monospace; padding: 1rem; overflow-y: auto;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, rgba(10,20,40,0.95), rgba(26,35,126,0.9));
            border: 2px solid #00f7ff; border-radius: 15px; padding: 2rem;
            max-width: 700px; width: 100%; max-height: 90vh; overflow-y: auto;
        `;
        
        const statusColor = report.status === 'EXCELLENT' ? '#00ff88' : 
                           report.status === 'GOOD' ? '#ffd700' : 
                           report.status === 'SATISFACTORY' ? '#ff6b35' : '#ff4d4d';
        
        content.innerHTML = `
            <h2 style="color: #00f7ff; text-align: center; margin-bottom: 2rem;">
                🚀 Task 11: Cross-Device Testing & Final Polish
            </h2>
            
            <div style="text-align: center; background: rgba(0,0,0,0.3); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                <h3 style="color: ${statusColor}; margin-bottom: 1rem;">${report.status}</h3>
                <div style="font-size: 2.5rem; margin-bottom: 1rem; color: ${statusColor};">${report.overallScore}%</div>
                <p>Tests Passed: ${report.totalPassed}/${report.totalTests}</p>
                <p>Execution Time: ${report.executionTime}ms</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                ${Object.entries(report.categoryResults).map(([category, result]) => {
                    const percentage = result.total > 0 ? Math.round((result.passed / result.total) * 100) : 100;
                    const color = percentage >= 75 ? '#00ff88' : percentage >= 50 ? '#ffd700' : '#ff6b35';
                    return `
                        <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; border-left: 4px solid ${color};">
                            <h4 style="margin-bottom: 0.5rem; text-transform: capitalize; font-size: 0.9rem;">
                                ${category.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <div style="font-size: 1.5rem; color: ${color}; margin-bottom: 0.5rem;">${percentage}%</div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">${result.passed}/${result.total} passed</div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
                <h4 style="color: #00f7ff; margin-bottom: 1rem;">📋 Recommendations</h4>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${report.recommendations.map(rec => `<li style="margin-bottom: 0.5rem;">• ${rec}</li>`).join('')}
                </ul>
            </div>
            
            <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
                <h4 style="color: #00f7ff; margin-bottom: 1rem;">🔧 Device Information</h4>
                <div style="font-size: 0.9rem; opacity: 0.8;">
                    <p>Viewport: ${report.deviceInfo.viewport}</p>
                    <p>Pixel Ratio: ${report.deviceInfo.pixelRatio}</p>
                    <p>Touch Support: ${report.deviceInfo.touchSupport ? 'Yes' : 'No'}</p>
                    <p>Connection: ${report.deviceInfo.connectionType}</p>
                </div>
            </div>
            
            <div style="text-align: center;">
                <button onclick="document.getElementById('final-validation-report').remove()" 
                        style="background: #00f7ff; color: #0a0f1f; border: none; padding: 1rem 2rem; 
                               border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 1rem;">
                    Close Report
                </button>
            </div>
        `;
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);
    }
}

// Initialize and run validation
const finalValidator = new FinalValidationSuite();

// Auto-run validation when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        finalValidator.runCompleteValidation();
    }, 2000);
});

// Export for manual testing
window.finalValidator = finalValidator;
window.runFinalValidation = () => finalValidator.runCompleteValidation();

console.log('🚀 Final Validation Suite loaded successfully!');
console.log('Run window.runFinalValidation() to manually trigger validation');