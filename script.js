// Menunggu sampai Scene AR siap
window.onload = () => {
    // Menghilangkan Loader
    const scene = document.querySelector('a-scene');
    const loader = document.querySelector('.arjs-loader');
    
    scene.addEventListener('loaded', () => {
        loader.style.display = 'none';
        console.log("AR Scene Loaded");
    });
};

// Mendaftarkan Component Custom 'marker-handler' ke A-Frame
// Ini adalah cara A-Frame berkomunikasi dengan UI HTML
AFRAME.registerComponent('marker-handler', {
    init: function () {
        const marker = this.el;
        const infoPanel = document.getElementById('info-panel');
        const btnAudio = document.getElementById('btn-audio');

        // Status Audio (Simulasi)
        let isPlaying = false;

        // Event saat Marker Ditemukan (Found)
        marker.addEventListener('markerFound', () => {
            console.log("Marker ditemukan!");
            
            // Tampilkan Panel Info di Footer
            infoPanel.classList.remove('hidden');
        });

        // Event saat Marker Hilang (Lost)
        marker.addEventListener('markerLost', () => {
            console.log("Marker hilang!");
            
            // Sembunyikan Panel Info
            infoPanel.classList.add('hidden');
            
            // Reset Audio button text (Opsional)
            btnAudio.innerText = "🔊 Mainkan Suara";
            isPlaying = false;
        });

        // Logika Tombol Audio
        btnAudio.addEventListener('click', function() {
            if(!isPlaying) {
                // Di sini nanti kode: audio.play();
                btnAudio.innerText = "⏸️ Stop Suara";
                alert("Suara Angklung dimainkan! (Placeholder)");
                isPlaying = true;
            } else {
                // Di sini nanti kode: audio.pause();
                btnAudio.innerText = "🔊 Mainkan Suara";
                isPlaying = false;
            }
        });
    }
});