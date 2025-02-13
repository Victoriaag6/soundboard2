export function uploadAudio(audioList, playlists, addAudioCallback) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "audio/*";
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const audioName = prompt("Nombre del audio:");
                if (!audioName || audioList.some(audio => audio.name === audioName)) {
                    alert("El nombre del audio ya existe o es inválido.");
                    return;
                }
                const audio = { name: audioName, src: e.target.result };
                addAudioCallback(audio);
            };
            reader.readAsDataURL(file);
        }
    });
    fileInput.click();
}