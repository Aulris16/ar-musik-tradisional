// ============================================
// DEBUG HELPER
// ============================================
const debugLog = document.getElementById('debug-log');
let logCount = 0;

function log(message, type = 'info') {
    logCount++;
    
    let color = '#0f0';
    let icon = 'ℹ️';
    
    switch(type) {
        case 'error':
            color = '#ff4444';
            icon = '❌';
            console.error(message);
            break;
        case 'warn':
            color = '#ffff00';
            icon = '⚠️';
            console.warn(message);
            break;
        case 'success':
            color = '#44ff44';
            icon = '✅';
            console.log(message);
            break;
        default:
            color = '#88ff88';
            console.log(message);
    }
    
    if (debugLog) {
        const logEntry = document.createElement('div');
        logEntry.style.color = color;
        logEntry.style.padding = '2px 0';
        logEntry.style.borderBottom = '1px solid #222';
        logEntry.innerHTML = `${icon} ${message}`;
        debugLog.appendChild(logEntry);
        debugLog.parentElement.scrollTop = debugLog.parentElement.scrollHeight;
        
        if (logCount > 25) {
            debugLog.removeChild(debugLog.firstChild);
        }
    }
    
    // Update header status
    const statusText = document.getElementById('status-text');
    if (statusText && (type === 'success' || type === 'error')) {
        statusText.textContent = message;
    }
}

// ============================================
// CHECK IF AR.JS LOADED
// ============================================
function checkARJS() {
    if (typeof AFRAME === 'undefined') {
        log('A-Frame GAGAL load!', 'error');
        return false;
    }
    log('A-Frame OK', 'success');
    
    // Check AR.js component
    if (AFRAME.components && AFRAME.components['arjs']) {
        log('AR.js OK', 'success');
        return true;
    } else {
        log('AR.js mungkin belum ready', 'warn');
        return true; // Continue anyway
    }
}

// ============================================
// MAIN INIT
// ============================================
window.addEventListener('DOMContentLoaded', () => {
    log('DOM Ready', 'success');
    
    // Check libraries
    setTimeout(() => {
        checkARJS();
    }, 1000);
    
    const onboarding = document.getElementById('onboarding-overlay');
    const btnStart = document.getElementById('btn-start');
    const btnTestHiro = document.getElementById('btn-test-hiro');
    const loader = document.querySelector('.arjs-loader');
    const scene = document.querySelector('a-scene');
    const assetStatus = document.getElementById('asset-status');

    // ============================================
    // SCENE EVENTS
    // ============================================
    if (scene) {
        scene.addEventListener('loaded', () => {
            log('Scene loaded!', 'success');
            if (loader) loader.style.display = 'none';
            enableButton();
        });

        scene.addEventListener('arjs-video-loaded', () => {
            log('Camera ready!', 'success');
        });

        // Tambahan: cek error
        scene.addEventListener('error', (e) => {
            log('Scene error: ' + e.detail, 'error');
        });
    }

    // ============================================
    // ASSET EVENTS  
    // ============================================
    const assets = document.querySelector('a-assets');
    if (assets) {
        assets.addEventListener('loaded', () => {
            log('Assets loaded!', 'success');
            if (assetStatus) {
                assetStatus.innerHTML = '✅ Semua siap!';
                assetStatus.style.background = '#d4edda';
            }
            enableButton();
        });

        assets.addEventListener('timeout', () => {
            log('Asset timeout', 'warn');
            enableButton();
        });

        assets.addEventListener('error', (e) => {
            log('Asset error!', 'error');
        });
    }

    // Check GLB model specifically
    const glbModel = document.getElementById('angklung-model');
    if (glbModel) {
        glbModel.addEventListener('loaded', () => {
            log('GLB model OK!', 'success');
        });
        glbModel.addEventListener('error', () => {
            log('GLB model GAGAL!', 'error');
        });
    }

    // ============================================
    // ENABLE BUTTON
    // ============================================
    function enableButton() {
        if (btnStart) {
            btnStart.disabled = false;
            btnStart.textContent = '🚀 MULAI AR';
            btnStart.style.background = '#6c5ce7';
        }
    }

    // Fallback
    setTimeout(enableButton, 4000);

    // ============================================
    // BUTTON HANDLERS
    // ============================================
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            log('Start clicked', 'info');
            onboarding.style.opacity = '0';
            setTimeout(() => {
                onboarding.style.display = 'none';
            }, 500);
        });
    }

    if (btnTestHiro) {
        btnTestHiro.addEventListener('click', () => {
            log('HIRO test mode', 'info');
            onboarding.style.opacity = '0';
            setTimeout(() => {
                onboarding.style.display = 'none';
            }, 500);
        });
    }
});

// ============================================
// MARKER COMPONENTS
// ============================================

// HIRO Marker Handler
AFRAME.registerComponent('marker-handler-hiro', {
    init: function () {
        log('HIRO handler ready', 'info');
        
        this.el.addEventListener('markerFound', () => {
            log('🎯 HIRO FOUND!', 'success');
            document.getElementById('status-text').textContent = '🎯 HIRO Terdeteksi!';
        });
        
        this.el.addEventListener('markerLost', () => {
            log('HIRO lost', 'warn');
            document.getElementById('status-text').textContent = 'Cari marker...';
        });
    }
});

// Custom Marker Handler
AFRAME.registerComponent('marker-handler', {
    init: function () {
        log('Custom marker ready', 'info');
        
        const infoPanel = document.getElementById('info-panel');
        const btnAudio = document.getElementById('btn-audio');
        const audioEl = document.getElementById('sound-angklung');
        let isPlaying = false;

        this.el.addEventListener('markerFound', () => {
            log('🎯 ANGKLUNG FOUND!', 'success');
            if (infoPanel) infoPanel.classList.remove('hidden');
        });

        this.el.addEventListener('markerLost', () => {
            log('Angklung lost', 'warn');
            if (infoPanel) infoPanel.classList.add('hidden');
            
            if (isPlaying && audioEl) {
                audioEl.pause();
                audioEl.currentTime = 0;
                if (btnAudio) btnAudio.innerText = "🔊 Mainkan Suara";
                isPlaying = false;
            }
        });

        // Audio control
        if (btnAudio && audioEl) {
            btnAudio.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (!isPlaying) {
                    audioEl.play().then(() => {
                        btnAudio.innerText = "⏸️ Stop";
                        isPlaying = true;
                        log('Audio play', 'info');
                    }).catch(err => {
                        log('Audio error', 'error');
                    });
                } else {
                    audioEl.pause();
                    btnAudio.innerText = "🔊 Mainkan Suara";
                    isPlaying = false;
                }
            });
        }
    }
});

// Model loaded handler
AFRAME.registerComponent('model-loaded', {
    init: function () {
        this.el.addEventListener('model-loaded', () => {
            log('3D Model OK!', 'success');
        });
        
        this.el.addEventListener('model-error', () => {
            log('3D Model ERROR!', 'error');
        });
    }
});
