export function addAudio(audio, audioList, playlists) {
    audioList.push(audio);
    playlists["All"].push(audio);
    localStorage.setItem("audioList", JSON.stringify(audioList));
    localStorage.setItem("playlists", JSON.stringify(playlists));
    return { audioList, playlists };
}