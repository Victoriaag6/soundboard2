import { SoundBoardMethods } from './SoundBoardMethods.js';
import './playlist.js';

class UIHandler {
    constructor(audioManager, playlistManager, app) {
        this.audioManager = audioManager;
        this.playlistManager = playlistManager;
        this.app = app;
    }

    switchPlaylist(playlistName) {
        this.app.currentPlaylist = playlistName;
    }

    renderPlaylists() {
        return Object.keys(this.playlistManager.playlists).map(playlist => 
            `<playlist-component 
                name="${playlist}" 
                audios='${JSON.stringify(this.playlistManager.playlists[playlist])}' 
                isActive="${this.app.currentPlaylist === playlist}">
            </playlist-component>`
        ).join('');
    }

    renderAudioList() {
        const displayedAudios = this.playlistManager.playlists[this.app.currentPlaylist] || [];
        if (displayedAudios.length === 0) {
            return `<p>Aún no hay audios en esta playlist.</p>`;
        }
        return displayedAudios.map(audio => 
            `<audio-player 
                name="${audio.name}"
                src="${audio.src}"
                isFavorite="${this.playlistManager.favList.includes(audio.name)}"
                playlist="${this.app.currentPlaylist}">
            </audio-player>`
        ).join('');
    }

    addEventListeners() {
        this.app.shadowRoot.querySelector("#add-audio").addEventListener("click", () => 
            this.audioManager.uploadAudio(() => this.app.render(), this.playlistManager));

        this.app.shadowRoot.addEventListener("add-to-playlist", (e) => {
            this.playlistManager.addToPlaylist(e.detail.audioName, e.detail.playlistName);
            this.app.render();
        });

        Object.keys(this.playlistManager.playlists).forEach(playlist => {
            this.app.shadowRoot.querySelector(`#${playlist}-btn`).addEventListener("click", () => {
                this.switchPlaylist(playlist);
                this.app.render();
            });
        });
    }
}

export { UIHandler };
