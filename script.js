// ============================================
// ETNIK AR - Production Script (Fixed)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // ELEMENTS
    // ============================================
    const onboarding = document.getElementById('onboarding-overlay');
    const btnStart = document.getElementById('btn-start');
    const loadingStatus = document.getElementById('loading-status');
    const statusTextEl = loadingStatus?.querySelector('.status-text');
    const headerStatus = document.getElementById('status-text');
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
                onARReady();
            }
        }, 300);
    }
    
    function onARReady() {
        arReady = true;
        
        // ✅ FIX: Update text content only, don't change structure
        if (statusTextEl) {
            statusTextEl.textContent = '✅ Siap digunakan!';
        }
        if (loadingStatus) {
            loadingStatus.classList.add('ready');
        }
        
        // Enable button
        if (btnStart) {
            btnStart.disabled = false;
            const btnText = btnStart.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = 'Mulai Pengalaman AR';
            }
        }
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
            if (headerStatus) {
                headerStatus.textContent = 'Arahkan kamera ke marker';
            }
        });
    }

    // ============================================
    // MARKER EVENTS
    // ============================================
    if (markerAngklung) {
        markerAngklung.addEventListener('markerFound', () => {
            console.log('Marker found!');
            
            if (headerStatus) headerStatus.textContent = '🎯 Angklung Terdeteksi!';
            if (scanHint) scanHint.classList.add('hidden');
            if (infoPanel) infoPanel.classList.remove('hidden');
        });
        
        markerAngklung.addEventListener('markerLost', () => {
            console.log('Marker lost');
            
            if (headerStatus) headerStatus.textContent = 'Arahkan kamera ke marker';
            if (scanHint) scanHint.classList.remove('hidden');
            if (infoPanel) infoPanel.classList.add('hidden');
            
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
        if (!btnAudio) return;
        
        const icon = btnAudio.querySelector('.action-icon');
        const text = btnAudio.querySelector('span:last-child');
        
        if (isAudioPlaying) {
            if (icon) icon.textContent = '⏸️';
            if (text) text.textContent = 'Hentikan';
            btnAudio.classList.add('playing');
        } else {
            if (icon) icon.textContent = '🔊';
            if (text) text.textContent = 'Putar Suara';
            btnAudio.classList.remove('playing');
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
                        alert('Tidak dapat memutar audio.');
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
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            if (onboarding) {
                onboarding.classList.add('hide');
            }
        });
    }
    
    if (btnClose) {
        btnClose.addEventListener('click', () => {
            if (infoPanel) {
                infoPanel.classList.add('hidden');
            }
        });
    }

    // ============================================
    // FALLBACK
    // ============================================
    setTimeout(() => {
        if (!arReady) {
            onARReady();
        }
    }, 8000);
});
