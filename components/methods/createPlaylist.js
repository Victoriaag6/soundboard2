export function createPlaylist(playlists) {
    const playlistName = prompt("Nombre de la nueva playlist:");
    if (playlistName && !playlists[playlistName]) {
        playlists[playlistName] = [];
        localStorage.setItem("playlists", JSON.stringify(playlists));
    }
    return playlists;
}