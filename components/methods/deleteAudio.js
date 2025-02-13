export function deleteAudio(audioName, currentPlaylist, audioList, playlists) {
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