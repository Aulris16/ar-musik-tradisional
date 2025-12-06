// ============================================
// ETNIK AR - Multi-Marker Support
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
    
    // Info Panel Elements
    const infoPanel = document.getElementById('info-panel');
    const btnClose = document.getElementById('btn-close');
    const btnAudio = document.getElementById('btn-audio');
    const btnWiki = document.getElementById('btn-wiki');
    const infoName = document.getElementById('info-name');
    const infoBadge = document.getElementById('info-badge');
    const infoDescription = document.getElementById('info-description');
    
    const scanHint = document.getElementById('scan-hint');
    
    // All markers
    const markers = document.querySelectorAll('a-marker');
    
    let isAudioPlaying = false;
    let currentAudioEl = null;
    let currentMarkerData = null;
    let arReady = false;

    // ============================================
    // INSTRUMENT DATA (from marker attributes)
    // ============================================
    function getMarkerData(marker) {
        return {
            id: marker.id,
            name: marker.dataset.name || 'Unknown',
            origin: marker.dataset.origin || 'Indonesia',
            description: marker.dataset.description || 'Deskripsi tidak tersedia.',
            audioId: marker.dataset.audio || null,
            wikiUrl: marker.dataset.wiki || '#'
        };
    }

    // ============================================
    // UPDATE INFO PANEL
    // ============================================
    function updateInfoPanel(data) {
        if (infoName) infoName.textContent = data.name;
        if (infoBadge) {
            infoBadge.textContent = data.origin;
            // Remove old classes and add new one
            infoBadge.className = 'info-badge';
            const badgeClass = data.id.replace('marker-', '');
            infoBadge.classList.add(badgeClass);
        }
        if (infoDescription) infoDescription.textContent = data.description;
        if (btnWiki) btnWiki.href = data.wikiUrl;
        
        // Set current audio element
        if (data.audioId) {
            currentAudioEl = document.getElementById(data.audioId);
        } else {
            currentAudioEl = null;
        }
        
        currentMarkerData = data;
    }

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
        
        if (statusTextEl) {
            statusTextEl.textContent = '✅ Siap digunakan!';
        }
        if (loadingStatus) {
            loadingStatus.classList.add('ready');
        }
        
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
    // MARKER EVENTS (All Markers)
    // ============================================
    markers.forEach(marker => {
        // Marker Found
        marker.addEventListener('markerFound', () => {
            const data = getMarkerData(marker);
            console.log(`Marker found: ${data.name}`);
            
            // Update UI
            if (headerStatus) headerStatus.textContent = `🎯 ${data.name} Terdeteksi!`;
            if (scanHint) scanHint.classList.add('hidden');
            
            // Update and show info panel
            updateInfoPanel(data);
            if (infoPanel) infoPanel.classList.remove('hidden');
        });
        
        // Marker Lost
        marker.addEventListener('markerLost', () => {
            const data = getMarkerData(marker);
            console.log(`Marker lost: ${data.name}`);
            
            // Update UI
            if (headerStatus) headerStatus.textContent = 'Arahkan kamera ke marker';
            if (scanHint) scanHint.classList.remove('hidden');
            if (infoPanel) infoPanel.classList.add('hidden');
            
            // Stop audio
            stopAudio();
        });
    });

    // ============================================
    // AUDIO CONTROLS
    // ============================================
    function stopAudio() {
        if (currentAudioEl && isAudioPlaying) {
            currentAudioEl.pause();
            currentAudioEl.currentTime = 0;
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
    
    if (btnAudio) {
        btnAudio.addEventListener('click', () => {
            if (!currentAudioEl) {
                alert('Audio tidak tersedia untuk alat musik ini.');
                return;
            }
            
            if (!isAudioPlaying) {
                // Stop any previously playing audio first
                stopAllAudio();
                
                currentAudioEl.play()
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
    }
    
    // Stop all audio elements
    function stopAllAudio() {
        const allAudio = document.querySelectorAll('audio');
        allAudio.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        isAudioPlaying = false;
    }
    
    // Listen for audio ended on all audio elements
    const allAudioElements = document.querySelectorAll('audio');
    allAudioElements.forEach(audio => {
        audio.addEventListener('ended', () => {
            isAudioPlaying = false;
            updateAudioButton();
        });
    });

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
            stopAudio();
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
