// ============================================
// ETNIK AR - Dynamic Scene Creation
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
    // CHECK IF AFRAME LOADED
    // ============================================
    function checkLibraries() {
        let attempts = 0;
        const maxAttempts = 30;
        
        const check = setInterval(() => {
            attempts++;
            
            if (typeof AFRAME !== 'undefined') {
                clearInterval(check);
                console.log('A-Frame ready!');
                onLibrariesReady();
            } else if (attempts >= maxAttempts) {
                clearInterval(check);
                console.log('Timeout - enabling anyway');
                onLibrariesReady();
            }
        }, 200);
    }
    
    function onLibrariesReady() {
        if (statusTextEl) {
            statusTextEl.textContent = '✅ Siap! Klik tombol untuk mulai';
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
    
    checkLibraries();

    // ============================================
    // CREATE AR SCENE (Dipanggil saat tombol diklik)
    // ============================================
    function createARScene() {
        console.log('Creating AR Scene...');
        
        // Buat elemen a-scene
        const sceneHTML = `
            <a-scene 
                embedded 
                arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
                vr-mode-ui="enabled: false"
                renderer="logarithmicDepthBuffer: true; antialias: true;"
                loading-screen="enabled: false">

                <a-assets timeout="30000">
                    <a-asset-item id="angklung-model" src="assets/angklung.glb"></a-asset-item>
                    <audio id="sound-angklung" src="assets/angklung.mp3" preload="auto"></audio>
                    
                    <a-asset-item id="gendang-bulo-model" src="assets/gendang-bulo.glb"></a-asset-item>
                    <audio id="sound-gendang-bulo" src="assets/gendang-bulo.mp3" preload="auto"></audio>
                </a-assets>

                <a-marker 
                    type="pattern" 
                    url="markers/pattern-angklung.patt" 
                    id="marker-angklung"
                    data-name="Angklung"
                    data-origin="Jawa Barat"
                    data-description="Angklung adalah alat musik multitonal yang berkembang dari masyarakat Sunda. Terbuat dari bambu dan dimainkan dengan cara digoyangkan. UNESCO mengakui Angklung sebagai Warisan Budaya Dunia pada tahun 2010."
                    data-audio="sound-angklung"
                    data-wiki="https://id.wikipedia.org/wiki/Angklung">
                    
                    <a-light type="ambient" color="#ffffff" intensity="1"></a-light>
                    <a-light type="directional" color="#ffffff" intensity="0.6" position="0 2 1"></a-light>
                    
                    <a-entity 
                        gltf-model="#angklung-model"
                        scale="0.5 0.5 0.5" 
                        rotation="0 0 0" 
                        position="0 0 0"
                        animation="property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear;">
                    </a-entity>

                    <a-text value="ANGKLUNG" position="0 1.2 0" align="center" color="#ffffff" scale="1.2 1.2 1.2"></a-text>
                    <a-text value="Jawa Barat" position="0 0.95 0" align="center" color="#ffd700" scale="0.8 0.8 0.8"></a-text>
                </a-marker>

                <a-marker 
                    type="pattern" 
                    url="markers/pattern-gendang-bulo.patt" 
                    id="marker-gendang-bulo"
                    data-name="Gendang Bulo"
                    data-origin="Sulawesi Selatan"
                    data-description="Gendang Bulo adalah alat musik perkusi tradisional dari Sulawesi Selatan. Terbuat dari kayu dan kulit binatang, biasa digunakan dalam upacara adat dan pertunjukan tari tradisional Makassar."
                    data-audio="sound-gendang-bulo"
                    data-wiki="https://id.wikipedia.org/wiki/Gendang">
                    
                    <a-light type="ambient" color="#ffffff" intensity="1"></a-light>
                    <a-light type="directional" color="#ffffff" intensity="0.6" position="0 2 1"></a-light>
                    
                    <a-entity 
                        gltf-model="#gendang-bulo-model"
                        scale="0.5 0.5 0.5" 
                        rotation="0 0 0" 
                        position="0 0 0"
                        animation="property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear;">
                    </a-entity>

                    <a-text value="GENDANG BULO" position="0 1.2 0" align="center" color="#ffffff" scale="1.2 1.2 1.2"></a-text>
                    <a-text value="Sulawesi Selatan" position="0 0.95 0" align="center" color="#ffd700" scale="0.8 0.8 0.8"></a-text>
                </a-marker>

                <a-entity camera></a-entity>
            </a-scene>
        `;
        
        // Masukkan ke container
        arContainer.innerHTML = sceneHTML;
        
        // Tunggu scene loaded, lalu init marker listeners
        const scene = document.querySelector('a-scene');
        if (scene) {
            scene.addEventListener('loaded', () => {
                console.log('Scene loaded!');
                initMarkerListeners();
            });
            
            scene.addEventListener('arjs-video-loaded', () => {
                console.log('Camera active!');
            });
        }
    }

    // ============================================
    // START AR
    // ============================================
    function startAR() {
        if (arStarted) return;
        arStarted = true;
        
        console.log('Starting AR...');
        
        // Hide onboarding
        if (onboarding) {
            onboarding.classList.add('hide');
        }
        
        // Show UI elements
        if (arHeader) {
            arHeader.classList.remove('ar-ui-hidden');
            arHeader.classList.add('ar-ui-visible');
        }
        if (scanHint) {
            scanHint.classList.remove('ar-ui-hidden');
            scanHint.classList.add('ar-ui-visible');
        }
        
        // CREATE SCENE (ini yang trigger kamera!)
        createARScene();
    }

    // ============================================
    // MARKER LISTENERS
    // ============================================
    function initMarkerListeners() {
        const markers = document.querySelectorAll('a-marker');
        console.log(`Found ${markers.length} markers`);
        
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
