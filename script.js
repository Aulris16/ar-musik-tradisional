// ============================================
// DEBUG LOGGER - Tampil di layar HP
// ============================================
const debugLog = document.getElementById('debug-log');
let logCount = 0;

function log(msg, type = 'info') {
    const colors = {
        'info': '#88ff88',
        'success': '#00ff00', 
        'warn': '#ffff00',
        'error': '#ff4444'
    };
    const icons = {
        'info': 'ℹ️',
        'success': '✅',
        'warn': '⚠️', 
        'error': '❌'
    };
    
    // Console
    console.log(`[${type.toUpperCase()}] ${msg}`);
    
    // Visual debug
    if (debugLog) {
        const entry = document.createElement('div');
        entry.style.color = colors[type];
        entry.style.padding = '3px 0';
        entry.style.borderBottom = '1px solid #333';
        entry.textContent = `${icons[type]} ${msg}`;
        debugLog.appendChild(entry);
        debugLog.scrollTop = debugLog.scrollHeight;
        
        // Limit entries
        logCount++;
        if (logCount > 20 && debugLog.firstChild) {
            debugLog.removeChild(debugLog.firstChild);
        }
    }
    
    // Update status text
    const statusText = document.getElementById('status-text');
    if (statusText) {
        statusText.textContent = msg;
    }
}

// ============================================
// WAIT FOR AFRAME & ARJS
// ============================================
function waitForAR(callback, maxAttempts = 20) {
    let attempts = 0;
    
    const check = () => {
        attempts++;
        log(`Cek library... (${attempts})`, 'info');
        
        if (typeof AFRAME !== 'undefined') {
            log('A-Frame OK!', 'success');
            
            // Check AR.js
            if (AFRAME.components && AFRAME.components['arjs-look-controls']) {
                log('AR.js OK!', 'success');
                callback(true);
                return;
            }
        }
        
        if (attempts >= maxAttempts) {
            log('Timeout - coba refresh', 'error');
            callback(false);
            return;
        }
        
        setTimeout(check, 500);
    };
    
    check();
}

// ============================================
// MAIN APP
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    log('App dimulai...', 'info');
    
    const onboarding = document.getElementById('onboarding-overlay');
    const btnStart = document.getElementById('btn-start');
    const btnTestHiro = document.getElementById('btn-test-hiro');
    const assetStatus = document.getElementById('asset-status');
    const scene = document.querySelector('a-scene');
    const infoPanel = document.getElementById('info-panel');
    const btnAudio = document.getElementById('btn-audio');
    const audioEl = document.getElementById('sound-angklung');
    
    let isAudioPlaying = false;
    
    // ============================================
    // CHECK LIBRARIES
    // ============================================
    waitForAR((success) => {
        if (success) {
            assetStatus.textContent = '✅ AR.js siap!';
            assetStatus.className = 'status-ready';
            enableButtons();
        } else {
            assetStatus.textContent = '❌ Gagal load AR.js';
            assetStatus.className = 'status-error';
            // Enable anyway for retry
            enableButtons();
        }
    });
    
    // ============================================
    // SCENE & ASSET EVENTS
    // ============================================
    if (scene) {
        scene.addEventListener('loaded', () => {
            log('Scene ready!', 'success');
        });
        
        scene.addEventListener('arjs-video-loaded', () => {
            log('Kamera aktif!', 'success');
        });
    }
    
    // Assets
    const assets = document.querySelector('a-assets');
    if (assets) {
        assets.addEventListener('loaded', () => {
            log('Assets loaded!', 'success');
        });
    }
    
    // GLB Model
    const glbAsset = document.getElementById('angklung-model');
    if (glbAsset) {
        glbAsset.addEventListener('loaded', () => {
            log('Model 3D OK!', 'success');
        });
        glbAsset.addEventListener('error', () => {
            log('Model 3D gagal!', 'error');
        });
    }
    
    // ============================================
    // MARKER EVENTS (Direct binding)
    // ============================================
    const markerHiro = document.getElementById('marker-hiro');
    const markerAngklung = document.getElementById('marker-angklung');
    
    if (markerHiro) {
        markerHiro.addEventListener('markerFound', () => {
            log('🎯 HIRO FOUND!', 'success');
        });
        markerHiro.addEventListener('markerLost', () => {
            log('HIRO hilang', 'warn');
        });
    }
    
    if (markerAngklung) {
        markerAngklung.addEventListener('markerFound', () => {
            log('🎯 ANGKLUNG FOUND!', 'success');
            if (infoPanel) infoPanel.classList.remove('hidden');
        });
        markerAngklung.addEventListener('markerLost', () => {
            log('Angklung hilang', 'warn');
            if (infoPanel) infoPanel.classList.add('hidden');
            stopAudio();
        });
    }
    
    // ============================================
    // BUTTON FUNCTIONS
    // ============================================
    function enableButtons() {
        if (btnStart) {
            btnStart.disabled = false;
            btnStart.textContent = '🚀 MULAI AR';
        }
    }
    
    function hideOnboarding() {
        if (onboarding) {
            onboarding.classList.add('hide');
        }
    }
    
    function stopAudio() {
        if (audioEl && isAudioPlaying) {
            audioEl.pause();
            audioEl.currentTime = 0;
            isAudioPlaying = false;
            if (btnAudio) btnAudio.textContent = '🔊 Mainkan Suara';
        }
    }
    
    // ============================================
    // BUTTON HANDLERS
    // ============================================
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            log('Mulai AR...', 'info');
            hideOnboarding();
        });
    }
    
    if (btnTestHiro) {
        btnTestHiro.addEventListener('click', () => {
            log('Mode test HIRO', 'info');
            hideOnboarding();
        });
    }
    
    if (btnAudio && audioEl) {
        btnAudio.addEventListener('click', () => {
            if (!isAudioPlaying) {
                audioEl.play()
                    .then(() => {
                        isAudioPlaying = true;
                        btnAudio.textContent = '⏸️ Stop Suara';
                        log('Audio playing', 'info');
                    })
                    .catch(err => {
                        log('Audio error!', 'error');
                    });
            } else {
                stopAudio();
            }
        });
        
        audioEl.addEventListener('ended', () => {
            isAudioPlaying = false;
            btnAudio.textContent = '🔊 Mainkan Suara';
        });
    }
    
    // ============================================
    // FALLBACK: Enable buttons after 6 seconds
    // ============================================
    setTimeout(() => {
        enableButtons();
        log('Fallback enable', 'info');
    }, 6000);
});
