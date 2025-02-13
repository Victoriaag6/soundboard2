export function addToPlaylist(audioName, playlistName, audioList, playlists) {
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