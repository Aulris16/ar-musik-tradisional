window.onload = () => {
    const onboarding = document.getElementById('onboarding-overlay');
    const btnStart = document.getElementById('btn-start');
    const bgMusic = document.getElementById('sound-angklung');
    const loader = document.querySelector('.arjs-loader');
    const scene = document.querySelector('a-scene');

    scene.addEventListener('loaded', () => {
        loader.style.display = 'none';
    });

    // Onboarding & Audio Unlock
    btnStart.addEventListener('click', () => {
        onboarding.style.opacity = '0';
        onboarding.style.visibility = 'hidden';

        // Trik memancing browser agar audio diizinkan
        if(bgMusic) {
            bgMusic.volume = 0;
            bgMusic.play().then(() => {
                bgMusic.pause();
                bgMusic.currentTime = 0;
                bgMusic.volume = 1;
                console.log("Audio Context Unlocked!");
            }).catch(error => {
                console.warn("Audio autoplay policy handled:", error);
            });
        }
    });
};

AFRAME.registerComponent('marker-handler', {
    init: function () {
        const marker = this.el;
        const infoPanel = document.getElementById('info-panel');
        const btnAudio = document.getElementById('btn-audio');
        const audioEl = document.getElementById('sound-angklung');
        
        let isPlaying = false;

        marker.addEventListener('markerFound', () => {
            console.log("Marker Found");
            infoPanel.classList.remove('hidden');
        });

        marker.addEventListener('markerLost', () => {
            console.log("Marker Lost");
            infoPanel.classList.add('hidden');
            
            if (isPlaying && audioEl) {
                audioEl.pause();
                audioEl.currentTime = 0;
                btnAudio.innerText = "🔊 Mainkan Suara";
                isPlaying = false;
            }
        });

        if(btnAudio && audioEl) {
            btnAudio.addEventListener('click', function(e) {
                e.stopPropagation();

                if(!isPlaying) {
                    audioEl.play().then(() => {
                        btnAudio.innerText = "⏸️ Stop Suara";
                        isPlaying = true;
                    }).catch(err => {
                        console.error("Error play:", err);
                        alert("Gagal memutar audio. Cek path file audio.");
                    });
                } else {
                    audioEl.pause();
                    btnAudio.innerText = "🔊 Mainkan Suara";
                    isPlaying = false;
                }
            });

            audioEl.addEventListener('ended', function() {
                btnAudio.innerText = "🔊 Mainkan Suara";
                isPlaying = false;
            });
        }
    }
});