export function getFavoriteAudios(audioList, favList) {
    return audioList.filter(audio => favList.includes(audio.name));
}