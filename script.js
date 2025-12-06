// ============================================
// DEBUG HELPER - Tampil di layar HP
// ============================================
const debugLog = document.getElementById('debug-log');
let logCount = 0;

function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    logCount++;
    
    // Warna berdasarkan type
    let color = '#0f0'; // hijau default
    let icon = 'ℹ️';
    
    switch(type) {
        case 'error':
            color = '#f00';
            icon = '❌';
            console.error(message);
            break;
        case 'warn':
            color = '#ff0';
            icon = '⚠️';
            console.warn(message);
            break;
        case 'success':
            color = '#0f0';
            icon = '✅';
            console.log(message);
            break;
        default:
            console.log(message);
    }
    
    // Tampilkan di debug overlay
    if (debugLog) {
        const logEntry = document.createElement('div');
        logEntry.style.color = color;
        logEntry.style.borderBottom = '1px solid #333';
        logEntry.style.padding = '3px 0';
        logEntry.innerHTML = `${icon} ${message}`;
        debugLog.appendChild(logEntry);
        
        // Auto scroll ke bawah
        debugLog.parentElement.scrollTop = debugLog.parentElement.scrollHeight;
        
        // Batasi log (max 20)
        if (logCount > 20) {
            debugLog.removeChild(debugLog.firstChild);
        }
    }
    
    // Update status text
    const statusText = document.getElementById('status-text');
    if (statusText && (type === 'success' || type === 'error')) {
        statusText.textContent = message;
    }
}

// ============================================
// MAIN INITIALIZATION
// ============================================
window.addEventListener('DOMContentLoaded', () => {
    log('🚀 App Started', 'success');
    
    const onboarding = document.getElementById('onboarding-overlay');
    const btnStart = document.getElementById('btn-start');
    const btnTestHiro = document.getElementById('btn-test-hiro');
    const bgMusic = document.getElementById('sound-angklung');
    const loader = document.querySelector('.arjs-loader');
    const scene = document.querySelector('a-scene');
    const assetStatus = document.getElementById('asset-status');

    let assetsLoaded = false;

    // ============================================
    // ASSET LOADING
    // ============================================
    const assets = document.querySelector('a-assets');
    
    if (assets) {
        assets.addEventListener('loaded', () => {
            assetsLoaded = true;
            log('Assets loaded!', 'success');
            if (assetStatus) {
                assetStatus.innerHTML = '✅ Model 3D siap!';
                assetStatus.style.background = '#d4edda';
            }
            enableStartButton();
        });

        assets.addEventListener('timeout', () => {
            log('Asset timeout!', 'warn');
            if (assetStatus) {
                assetStatus.innerHTML = '⚠️ Loading lambat...';
                assetStatus.style.background = '#fff3cd';
            }
            enableStartButton();
        });
    }

    // Check model loading
    const angklungAsset = document.getElementById('angklung-model');
    if (angklungAsset) {
        angklungAsset.addEventListener('loaded', () => {
            log('GLB Model OK!', 'success');
        });
        
        angklungAsset.addEventListener('error', (e) => {
            log('GLB GAGAL LOAD!', 'error');
            if (assetStatus) {
                assetStatus.innerHTML = '❌ Model gagal dimuat!';
                assetStatus.style.background = '#f8d7da';
            }
        });
    }

    // ============================================
    // SCENE EVENTS
    // ============================================
    if (scene) {
        scene.addEventListener('loaded', () => {
            log('Scene ready!', 'success');
            if (loader) loader.style.display = 'none';
            enableStartButton();
        });

        scene.addEventListener('camera-set-active', () => {
            log('Camera active!', 'success');
        });
    }

    // ============================================
    // ENABLE START BUTTON
    // ============================================
    function enableStartButton() {
        if (btnStart) {
            btnStart.disabled = false;
            btnStart.textContent = 'MULAI PENGALAMAN';
            btnStart.style.background = '#6c5ce7';
        }
    }

    // Fallback enable after 5s
    setTimeout(() => {
        enableStartButton();
        log('Fallback enable btn', 'info');
    }, 5000);

    // ============================================
    // BUTTON HANDLERS
    // ============================================
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            log('Start clicked!', 'info');
            onboarding.style.opacity = '0';
            onboarding.style.visibility = 'hidden';

            // Unlock audio
            if (bgMusic) {
                bgMusic.volume = 0;
                bgMusic.play().then(() => {
                    bgMusic.pause();
                    bgMusic.currentTime = 0;
                    bgMusic.volume = 1;
                    log('Audio unlocked!', 'success');
                }).catch(e => {
                    log('Audio blocked', 'warn');
                });
            }
        });
    }

    // Test HIRO button
    if (btnTestHiro) {
        btnTestHiro.addEventListener('click', () => {
            log('HIRO test mode!', 'info');
            onboarding.style.opacity = '0';
            onboarding.style.visibility = 'hidden';
            
            alert('Gunakan marker HIRO standar.\n\nJika kotak BIRU muncul = AR berfungsi!\n\nDownload marker HIRO di:\nhttps://jeromeetienne.github.io/AR.js/data/images/HIRO.jpg');
        });
    }
});

// ============================================
// MARKER HANDLER COMPONENT
// ============================================
AFRAME.registerComponent('marker-handler', {
    init: function () {
        const marker = this.el;
        const infoPanel = document.getElementById('info-panel');
        const btnAudio = document.getElementById('btn-audio');
        const audioEl = document.getElementById('sound-angklung');
        
        let isPlaying = false;

        log('Custom marker init', 'info');

        // MARKER FOUND
        marker.addEventListener('markerFound', () => {
            log('🎯 MARKER FOUND!', 'success');
            if (infoPanel) infoPanel.classList.remove('hidden');
        });

        // MARKER LOST
        marker.addEventListener('markerLost', () => {
            log('Marker lost', 'warn');
            if (infoPanel) infoPanel.classList.add('hidden');
            
            if (isPlaying && audioEl) {
                audioEl.pause();
                audioEl.currentTime = 0;
                if (btnAudio) btnAudio.innerText = "🔊 Mainkan Suara";
                isPlaying = false;
            }
        });

        // AUDIO BUTTON
        if (btnAudio && audioEl) {
            btnAudio.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                if (!isPlaying) {
                    audioEl.play().then(() => {
                        btnAudio.innerText = "⏸️ Stop Suara";
                        isPlaying = true;
                        log('Audio playing', 'info');
                    }).catch(err => {
                        log('Audio error!', 'error');
                    });
                } else {
                    audioEl.pause();
                    btnAudio.innerText = "🔊 Mainkan Suara";
                    isPlaying = false;
                }
            });

            audioEl.addEventListener('ended', () => {
                btnAudio.innerText = "🔊 Mainkan Suara";
                isPlaying = false;
            });
        }
    }
});

// ============================================
// HIRO MARKER HANDLER
// ============================================
AFRAME.registerComponent('marker-handler-hiro', {
    init: function () {
        log('HIRO marker init', 'info');
        
        this.el.addEventListener('markerFound', () => {
            log('🧪 HIRO FOUND!', 'success');
        });
        
        this.el.addEventListener('markerLost', () => {
            log('HIRO lost', 'info');
        });
    }
});

// ============================================
// MODEL LOADED COMPONENT
// ============================================
AFRAME.registerComponent('model-loaded', {
    init: function () {
        this.el.addEventListener('model-loaded', () => {
            log('3D Model rendered!', 'success');
        });
        
        this.el.addEventListener('model-error', () => {
            log('3D Model ERROR!', 'error');
        });
    }
});
