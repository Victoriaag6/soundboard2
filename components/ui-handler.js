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
            `<button class="playlist-btn ${this.app.currentPlaylist === playlist ? 'active' : ''}" id="${playlist}-btn">${playlist}</button>`
        ).join('');
    }

    renderAudioList() {
        const displayedAudios = this.playlistManager.playlists[this.app.currentPlaylist] || [];
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
