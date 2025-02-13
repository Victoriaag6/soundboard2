export function deletePlaylist(playlistName, playlists) {
    if (playlistName !== "All" && playlistName !== "Fav") {
        delete playlists[playlistName];
        localStorage.setItem("playlists", JSON.stringify(playlists));
    }
    return playlists;
}