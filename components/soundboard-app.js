import { SoundBoardMethods } from './SoundBoardMethods.js';

class SoundBoardApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.audioList = JSON.parse(localStorage.getItem("audioList")) || [];
        this.favList = JSON.parse(localStorage.getItem("favList")) || [];
        this.playlists = JSON.parse(localStorage.getItem("playlists")) || { "All": this.audioList, "Fav": SoundBoardMethods.getFavoriteAudios(this.audioList, this.favList) };
        this.currentPlaylist = "All";
        this.searchQuery = "";
        this.render();
    }

    connectedCallback() {
        this.shadowRoot.addEventListener("audio-added", (e) => this.addAudio(e.detail));
        this.shadowRoot.addEventListener("toggle-favorite", (e) => this.toggleFavorite(e.detail));
        this.shadowRoot.addEventListener("delete-audio", (e) => this.deleteAudio(e.detail));
        this.shadowRoot.addEventListener("switch-tab", (e) => {
            this.currentPlaylist = e.detail;
            this.render();
        });
        this.shadowRoot.addEventListener("add-to-playlist", (e) => {
            this.addToPlaylist(e.detail.audioName, e.detail.playlistName);
        });
        this.shadowRoot.addEventListener("delete-playlist", (e) => {
            this.deletePlaylist(e.detail);
        });
    }

    toggleFavorite(audioName) {
        try {
            const result = SoundBoardMethods.toggleFavorite(audioName, this.favList, this.playlists);
            this.favList = result.favList;
            this.playlists = result.playlists;
            this.render();
        } catch (e) {
            this.handleError(e);
        }
    }

    createPlaylist() {
        try {
            this.playlists = SoundBoardMethods.createPlaylist(this.playlists, () => this.render());
        } catch (e) {
            this.handleError(e);
        }
    }

    deletePlaylist(playlistName) {
        try {
            this.playlists = SoundBoardMethods.deletePlaylist(playlistName, this.playlists);
            this.currentPlaylist = "All";
            this.render();
        } catch (e) {
            this.handleError(e);
        }
    }

    uploadAudio() {
        try {
            SoundBoardMethods.uploadAudio(this.audioList, this.playlists, (audio) => this.addAudio(audio));
        } catch (e) {
            this.handleError(e);
        }
    }

    addAudio(audio) {
        try {
            const result = SoundBoardMethods.addAudio(audio, this.audioList, this.playlists);
            this.audioList = result.audioList;
            this.playlists = result.playlists;
            this.render();
        } catch (e) {
            this.handleError(e);
        }
    }

    addToPlaylist(audioName, playlistName) {
        try {
            this.playlists = SoundBoardMethods.addToPlaylist(audioName, playlistName, this.audioList, this.playlists);
            this.render();
        } catch (e) {
            this.handleError(e);
        }
    }

    deleteAudio(audioName) {
        try {
            const result = SoundBoardMethods.deleteAudio(audioName, this.currentPlaylist, this.audioList, this.playlists);
            this.audioList = result.audioList;
            this.playlists = result.playlists;
            this.render();
        } catch (e) {
            this.handleError(e);
        }
    }

    importPlaylists() {
        try {
            SoundBoardMethods.importPlaylists((importedPlaylists) => {
                this.playlists = { ...this.playlists, ...importedPlaylists };
                localStorage.setItem("playlists", JSON.stringify(this.playlists));
                this.render();
            });
        } catch (e) {
            this.handleError(e);
        }
    }

    handleError(e) {
        if (e.name === 'QuotaExceededError') {
            alert("No se pudo completar la operación. Se ha excedido el límite de almacenamiento.");
        } else if (e.name === 'SyntaxError') {
            alert("Error en el formato de los datos. Por favor, verifica los datos ingresados.");
        } else if (e.name === 'TypeError') {
            alert("Error de tipo. Por favor, verifica los datos ingresados.");
        } else {
            alert("Ocurrió un error inesperado: " + e.message);
        }
        console.error(e);
    }

    handleSearch(event) {
        this.searchQuery = event.target.value.toLowerCase();
        this.render();
    }

    render() {
        const displayedAudios = this.playlists[this.currentPlaylist].filter(audio => 
            audio.name.toLowerCase().includes(this.searchQuery)
        ) || [];
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="styles.css">
            <link rel="icon" href="data:;base64,iVBORw0KGgo=">
            <div class="container">
                <div class="header">
                    <div class="title-background">
                        <div class="title-container">
                            <span class="title">SoundBoard</span>
                            <span class="subtitle">Save and listen to your favorite sounds</span>
                        </div>
                    </div>
                    <button id="add-audio" class="add-btn">+ Add Sound</button>
                    <input type="text" id="search-bar" class="search-bar" placeholder="Search...">
                    <button id="export-playlists" class="add-btn">Export Playlists</button>
                    <button id="import-playlists" class="add-btn">Import Playlists</button>
                </div>
                <div class="tab-container">
                    ${Object.keys(this.playlists).map(playlist => 
                        `<div class="playlist-container">
                            <button class="tab-btn ${this.currentPlaylist === playlist ? 'active' : ''}" id="${playlist}-tab">
                                ${playlist}
                                ${playlist !== "All" && playlist !== "Fav" ? `<img src="assets/delete.png" alt="Eliminar" class="delete-icon small-icon" data-playlist="${playlist}">` : ''}
                            </button>
                        </div>`
                    ).join('')}
                    <div class="playlist-container">
                        <button id="create-playlist" class="tab-btn">+ New Playlist</button>
                    </div>
                </div>
                <div class="audio-list">
                    ${displayedAudios.map(audio => 
                        `<audio-player 
                            name="${audio.name}"
                            src="${audio.src}"
                            isFavorite="${this.favList.includes(audio.name)}"
                            playlist="${this.currentPlaylist}">
                        </audio-player>`).join('')}
                </div>
            </div>
        `;

        this.shadowRoot.querySelector("#search-bar").addEventListener("input", (e) => this.handleSearch(e));
        this.shadowRoot.querySelector("#add-audio").addEventListener("click", () => this.uploadAudio());
        this.shadowRoot.querySelector("#create-playlist").addEventListener("click", () => this.createPlaylist());
        this.shadowRoot.querySelector("#export-playlists").addEventListener("click", () => SoundBoardMethods.exportPlaylists(this.playlists, this.currentPlaylist));
        this.shadowRoot.querySelector("#import-playlists").addEventListener("click", () => this.importPlaylists());

        this.shadowRoot.querySelectorAll(".delete-icon").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const playlistName = e.target.dataset.playlist;
                this.deletePlaylist(playlistName);
            });
        });

        Object.keys(this.playlists).forEach(playlist => {
            this.shadowRoot.querySelector(`#${playlist}-tab`).addEventListener("click", () => {
                this.currentPlaylist = playlist;
                this.render();
            });
        });
    }
}

customElements.define("soundboard-app", SoundBoardApp);