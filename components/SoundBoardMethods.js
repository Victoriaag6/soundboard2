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
                // Revert changes to favList and playlists
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

    static createPlaylist(playlists) {
        const playlistName = prompt("Nombre de la nueva playlist:");
        if (playlistName && !playlists[playlistName]) {
            playlists[playlistName] = [];
            try {
                localStorage.setItem("playlists", JSON.stringify(playlists));
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    alert("No se pudo crear la playlist. Se ha excedido el límite de almacenamiento.");
                    delete playlists[playlistName]; // Clean up the added playlist
                } else {
                    throw e;
                }
            }
        }
        return playlists;
    }

    static deletePlaylist(playlistName, playlists) {
        if (playlistName !== "All" && playlistName !== "Fav") {
            delete playlists[playlistName];
            localStorage.setItem("playlists", JSON.stringify(playlists));
        }
        return playlists;
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