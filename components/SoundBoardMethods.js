import { showModal } from './modal.js';

export class SoundBoardMethods {
    static getFavoriteAudios(audioList, favList) {
        return audioList.filter(audio => favList.includes(audio.name));
    }

    static toggleFavorite(audioName, favList, playlists) {
        if (favList.includes(audioName)) {
            favList = favList.filter(name => name !== audioName);
        } else {
            favList.push(audioName);
        }
        playlists["Fav"] = SoundBoardMethods.getFavoriteAudios(playlists["All"], favList);
        try {
            localStorage.setItem("favList", JSON.stringify(favList));
            localStorage.setItem("playlists", JSON.stringify(playlists));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                alert("No se pudo actualizar la lista de favoritos. Se ha excedido el límite de almacenamiento.");
                if (favList.includes(audioName)) {
                    favList = favList.filter(name => name !== audioName);
                } else {
                    favList.push(audioName);
                }
                playlists["Fav"] = SoundBoardMethods.getFavoriteAudios(playlists["All"], favList);
            } else {
                throw e;
            }
        }
        return { favList, playlists };
    }

    static exportPlaylists(playlists, playlistName) {
        const playlistToExport = playlistName ? { [playlistName]: playlists[playlistName] } : playlists;
        const fileName = prompt("Ingrese el nombre del archivo para exportar:", "playlists.json");
        if (!fileName) {
            alert("El nombre del archivo no puede estar vacío.");
            return;
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(playlistToExport));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", fileName);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    static createPlaylist(playlists) {
        showModal("Nombre de la nueva playlist:", (playlistName) => {
            if (playlistName && !playlists[playlistName]) {
                playlists[playlistName] = [];
                try {
                    localStorage.setItem("playlists", JSON.stringify(playlists));
                } catch (e) {
                    if (e.name === 'QuotaExceededError') {
                        alert("No se pudo crear la playlist. Se ha excedido el límite de almacenamiento.");
                        delete playlists[playlistName]; 
                    } else {
                        throw e;
                    }
                }
            }
        });
        return playlists;
    }

    static deletePlaylist(playlistName, playlists) {
        if (playlistName !== "All" && playlistName !== "Fav") {
            delete playlists[playlistName];
            localStorage.setItem("playlists", JSON.stringify(playlists));
        }
        return playlists;
    }

    static importPlaylists(callback) {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "application/json";
        fileInput.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedPlaylists = JSON.parse(e.target.result);
                        callback(importedPlaylists);
                    } catch (error) {
                        alert("Error importing playlists: " + error.message);
                    }
                };
                reader.readAsText(file);
            }
        });
        fileInput.click();
    }

    static uploadAudio(audioList, playlists, addAudioCallback) {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "audio/*";
        fileInput.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    showModal("Nombre del audio:", (audioName) => {
                        if (!audioName || audioList.some(audio => audio.name === audioName)) {
                            alert("El nombre del audio ya existe o es inválido.");
                            return;
                        }
                        const audio = { name: audioName, src: e.target.result };
                        addAudioCallback(audio);
                    });
                };
                reader.readAsDataURL(file);
            }
        });
        fileInput.click();
    }

    static addAudio(audio, audioList, playlists) {
        audioList.push(audio);
        playlists["All"].push(audio);
        localStorage.setItem("audioList", JSON.stringify(audioList));
        localStorage.setItem("playlists", JSON.stringify(playlists));
        return { audioList, playlists };
    }

    static addToPlaylist(audioName, playlistName, audioList, playlists) {
        const audio = audioList.find(a => a.name === audioName);
        if (audio && playlists[playlistName]) {
            const alreadyInPlaylist = playlists[playlistName].some(a => a.name === audioName);
            if (!alreadyInPlaylist) {
                playlists[playlistName].push(audio);
                localStorage.setItem("playlists", JSON.stringify(playlists));
            }
        }
        return playlists;
    }

    static deleteAudio(audioName, currentPlaylist, audioList, playlists) {
        if (currentPlaylist === "All") {
            audioList = audioList.filter(audio => audio.name !== audioName);
            Object.keys(playlists).forEach(playlist => {
                playlists[playlist] = playlists[playlist].filter(audio => audio.name !== audioName);
            });
        } else {
            playlists[currentPlaylist] = playlists[currentPlaylist].filter(audio => audio.name !== audioName);
        }
        localStorage.setItem("audioList", JSON.stringify(audioList));
        localStorage.setItem("playlists", JSON.stringify(playlists));
        return { audioList, playlists };
    }
}