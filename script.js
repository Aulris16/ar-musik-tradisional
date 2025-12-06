// ============================================
// ETNIK AR - Production Script
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // ELEMENTS
    // ============================================
    const onboarding = document.getElementById('onboarding-overlay');
    const btnStart = document.getElementById('btn-start');
    const loadingStatus = document.getElementById('loading-status');
    const statusText = document.getElementById('status-text');
    const scene = document.querySelector('a-scene');
    
    const infoPanel = document.getElementById('info-panel');
    const btnClose = document.getElementById('btn-close');
    const btnAudio = document.getElementById('btn-audio');
    const audioEl = document.getElementById('sound-angklung');
    
    const scanHint = document.getElementById('scan-hint');
    const markerAngklung = document.getElementById('marker-angklung');
    
    let isAudioPlaying = false;
    let arReady = false;

    // ============================================
    // WAIT FOR AR.JS TO LOAD
    // ============================================
    function checkARReady() {
        let attempts = 0;
        const maxAttempts = 30;
        
        const check = setInterval(() => {
            attempts++;
            
            if (typeof AFRAME !== 'undefined' && AFRAME.components) {
                clearInterval(check);
                onARReady();
            } else if (attempts >= maxAttempts) {
                clearInterval(check);
                // Enable anyway
                onARReady();
            }
        }, 300);
    }
    
    function onARReady() {
        arReady = true;
        loadingStatus.innerHTML = '<span>✅ Siap digunakan!</span>';
        loadingStatus.classList.add('ready');
        
        btnStart.disabled = false;
        btnStart.innerHTML = '<span class="btn-icon">📷</span><span>Mulai Pengalaman AR</span>';
    }
    
    checkARReady();

    // ============================================
    // SCENE EVENTS
    // ============================================
    if (scene) {
        scene.addEventListener('loaded', () => {
            console.log('Scene loaded');
        });
        
        scene.addEventListener('arjs-video-loaded', () => {
            console.log('Camera ready');
            if (statusText) {
                statusText.textContent = 'Arahkan kamera ke marker';
            }
        });
    }

    // ============================================
    // MARKER EVENTS
    // ============================================
    if (markerAngklung) {
        markerAngklung.addEventListener('markerFound', () => {
            console.log('Marker found!');
            
            // Update UI
            if (statusText) statusText.textContent = '🎯 Angklung Terdeteksi!';
            if (scanHint) scanHint.classList.add('hidden');
            if (infoPanel) infoPanel.classList.remove('hidden');
        });
        
        markerAngklung.addEventListener('markerLost', () => {
            console.log('Marker lost');
            
            // Update UI
            if (statusText) statusText.textContent = 'Arahkan kamera ke marker';
            if (scanHint) scanHint.classList.remove('hidden');
            if (infoPanel) infoPanel.classList.add('hidden');
            
            // Stop audio
            stopAudio();
        });
    }

    // ============================================
    // AUDIO CONTROLS
    // ============================================
    function stopAudio() {
        if (audioEl && isAudioPlaying) {
            audioEl.pause();
            audioEl.currentTime = 0;
            isAudioPlaying = false;
            updateAudioButton();
        }
    }
    
    function updateAudioButton() {
        if (btnAudio) {
            if (isAudioPlaying) {
                btnAudio.innerHTML = '<span class="action-icon">⏸️</span><span>Hentikan</span>';
                btnAudio.classList.add('playing');
            } else {
                btnAudio.innerHTML = '<span class="action-icon">🔊</span><span>Putar Suara</span>';
                btnAudio.classList.remove('playing');
            }
        }
    }
    
    if (btnAudio && audioEl) {
        btnAudio.addEventListener('click', () => {
            if (!isAudioPlaying) {
                audioEl.play()
                    .then(() => {
                        isAudioPlaying = true;
                        updateAudioButton();
                    })
                    .catch(err => {
                        console.error('Audio error:', err);
                        alert('Tidak dapat memutar audio. Pastikan file audio tersedia.');
                    });
            } else {
                stopAudio();
            }
        });
        
        audioEl.addEventListener('ended', () => {
            isAudioPlaying = false;
            updateAudioButton();
        });
    }

    // ============================================
    // BUTTON HANDLERS
    // ============================================
    
    // Start Button
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            if (onboarding) {
                onboarding.classList.add('hide');
            }
        });
    }
    
    // Close Info Panel
    if (btnClose) {
        btnClose.addEventListener('click', () => {
            if (infoPanel) {
                infoPanel.classList.add('hidden');
            }
        });
    }

    // ============================================
    // FALLBACK: Enable button after 8 seconds
    // ============================================
    setTimeout(() => {
        if (!arReady) {
            onARReady();
        }
    }, 8000);
});