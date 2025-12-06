// ============================================
// ETNIK AR - Fixed Camera Issue
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized');
    
    // ============================================
    // ELEMENTS
    // ============================================
    const onboarding = document.getElementById('onboarding-overlay');
    const btnStart = document.getElementById('btn-start');
    const loadingStatus = document.getElementById('loading-status');
    const statusTextEl = loadingStatus?.querySelector('.status-text');
    const headerStatus = document.getElementById('status-text');
    
    const arContainer = document.getElementById('ar-container');
    const arHeader = document.getElementById('ar-header');
    const scanHint = document.getElementById('scan-hint');
    
    const infoPanel = document.getElementById('info-panel');
    const btnClose = document.getElementById('btn-close');
    const btnAudio = document.getElementById('btn-audio');
    const btnWiki = document.getElementById('btn-wiki');
    const infoName = document.getElementById('info-name');
    const infoBadge = document.getElementById('info-badge');
    const infoDescription = document.getElementById('info-description');
    
    let isAudioPlaying = false;
    let currentAudioEl = null;
    let arStarted = false;

    // ============================================
    // WAIT FOR AR.JS & CAMERA
    // ============================================
    function checkARReady() {
        const scene = document.querySelector('a-scene');
        
        if (!scene) {
            console.error('No a-scene found');
            enableButton();
            return;
        }
        
        // Check if scene is already loaded
        if (scene.hasLoaded) {
            console.log('Scene already loaded');
            onARReady();
            return;
        }
        
        // Wait for scene to load
        scene.addEventListener('loaded', () => {
            console.log('Scene loaded');
            onARReady();
        });
        
        // Also listen for camera ready
        scene.addEventListener('arjs-video-loaded', () => {
            console.log('Camera video loaded');
        });
        
        // Fallback timeout
        setTimeout(() => {
            if (!arStarted) {
                console.log('Fallback: enabling button');
                onARReady();
            }
        }, 8000);
    }
    
    function onARReady() {
        if (statusTextEl) {
            statusTextEl.textContent = '✅ Siap digunakan!';
        }
        if (loadingStatus) {
            loadingStatus.classList.add('ready');
        }
        enableButton();
    }
    
    function enableButton() {
        if (btnStart) {
            btnStart.disabled = false;
            const btnText = btnStart.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = 'Mulai Pengalaman AR';
            }
        }
    }
    
    // Start checking
    checkARReady();

    // ============================================
    // START AR
    // ============================================
    function startAR() {
        if (arStarted) return;
        arStarted = true;
        
        console.log('Starting AR experience...');
        
        // Hide onboarding
        if (onboarding) {
            onboarding.classList.add('hide');
        }
        
        // Show AR container (change from hidden to visible)
        if (arContainer) {
            arContainer.classList.remove('ar-hidden');
            arContainer.classList.add('ar-visible');
        }
        
        // Show header
        if (arHeader) {
            arHeader.classList.remove('ar-ui-hidden');
            arHeader.classList.add('ar-ui-visible');
        }
        
        // Show scan hint
        if (scanHint) {
            scanHint.classList.remove('ar-ui-hidden');
            scanHint.classList.add('ar-ui-visible');
        }
        
        // Initialize marker listeners
        initMarkerListeners();
    }

    // ============================================
    // MARKER LISTENERS
    // ============================================
    function initMarkerListeners() {
        const markers = document.querySelectorAll('a-marker');
        
        markers.forEach(marker => {
            marker.addEventListener('markerFound', () => {
                const data = getMarkerData(marker);
                console.log(`Marker found: ${data.name}`);
                
                if (headerStatus) headerStatus.textContent = `🎯 ${data.name} Terdeteksi!`;
                if (scanHint) scanHint.classList.add('hidden');
                
                updateInfoPanel(data);
                if (infoPanel) infoPanel.classList.remove('hidden');
            });
            
            marker.addEventListener('markerLost', () => {
                const data = getMarkerData(marker);
                console.log(`Marker lost: ${data.name}`);
                
                if (headerStatus) headerStatus.textContent = 'Arahkan kamera ke marker';
                if (scanHint) scanHint.classList.remove('hidden');
                if (infoPanel) infoPanel.classList.add('hidden');
                
                stopAudio();
            });
        });
        
        console.log(`Initialized ${markers.length} marker listeners`);
    }

    // ============================================
    // HELPER FUNCTIONS
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

    function updateInfoPanel(data) {
        if (infoName) infoName.textContent = data.name;
        if (infoBadge) {
            infoBadge.textContent = data.origin;
            infoBadge.className = 'info-badge';
            const badgeClass = data.id.replace('marker-', '');
            infoBadge.classList.add(badgeClass);
        }
        if (infoDescription) infoDescription.textContent = data.description;
        if (btnWiki) btnWiki.href = data.wikiUrl;
        
        currentAudioEl = data.audioId ? document.getElementById(data.audioId) : null;
    }

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
                alert('Audio tidak tersedia.');
                return;
            }
            
            if (!isAudioPlaying) {
                // Stop all audio first
                document.querySelectorAll('audio').forEach(a => {
                    a.pause();
                    a.currentTime = 0;
                });
                
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
    
    // Audio ended event
    document.querySelectorAll('audio').forEach(audio => {
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
            console.log('Start button clicked');
            startAR();
        });
    }
    
    if (btnClose) {
        btnClose.addEventListener('click', () => {
            if (infoPanel) infoPanel.classList.add('hidden');
            stopAudio();
        });
    }
});
