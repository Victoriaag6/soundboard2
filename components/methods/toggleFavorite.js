import { getFavoriteAudios } from './getFavoriteAudios.js';

export function toggleFavorite(audioName, favList, playlists) {
    if (favList.includes(audioName)) {
        favList = favList.filter(name => name !== audioName);
    } else {
        favList.push(audioName);
    }
    playlists["Fav"] = getFavoriteAudios(playlists["All"], favList);
    localStorage.setItem("favList", JSON.stringify(favList));
    localStorage.setItem("playlists", JSON.stringify(playlists));
    return { favList, playlists };
}