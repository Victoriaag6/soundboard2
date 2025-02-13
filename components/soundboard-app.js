import { getFavoriteAudios } from './methods/getFavoriteAudios.js';
import { toggleFavorite } from './methods/toggleFavorite.js';
import { createPlaylist } from './methods/createPlaylist.js';
import { deletePlaylist } from './methods/deletePlaylist.js';
import { uploadAudio } from './methods/uploadAudio.js';
import { addAudio } from './methods/addAudio.js';
import { addToPlaylist } from './methods/addToPlaylist.js';
import { deleteAudio } from './methods/deleteAudio.js';

class SoundBoardApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.audioList = JSON.parse(localStorage.getItem("audioList")) || [];
        this.favList = JSON.parse(localStorage.getItem("favList")) || [];
        this.playlists = JSON.parse(localStorage.getItem("playlists")) || { "All": this.audioList, "Fav": getFavoriteAudios(this.audioList, this.favList) };
        this.currentPlaylist = "All";
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
        const result = toggleFavorite(audioName, this.favList, this.playlists);
        this.favList = result.favList;
        this.playlists = result.playlists;
        this.render();
    }

    createPlaylist() {
        this.playlists = createPlaylist(this.playlists);
        this.render();
    }

    deletePlaylist(playlistName) {
        this.playlists = deletePlaylist(playlistName, this.playlists);
        this.currentPlaylist = "All";
        this.render();
    }

    uploadAudio() {
        uploadAudio(this.audioList, this.playlists, (audio) => this.addAudio(audio));
    }

    addAudio(audio) {
        const result = addAudio(audio, this.audioList, this.playlists);
        this.audioList = result.audioList;
        this.playlists = result.playlists;
        this.render();
    }

    addToPlaylist(audioName, playlistName) {
        this.playlists = addToPlaylist(audioName, playlistName, this.audioList, this.playlists);
        this.render();
    }

    deleteAudio(audioName) {
        const result = deleteAudio(audioName, this.currentPlaylist, this.audioList, this.playlists);
        this.audioList = result.audioList;
        this.playlists = result.playlists;
        this.render();
    }

    render() {
        const displayedAudios = this.playlists[this.currentPlaylist] || [];
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="styles.css">
            <div class="container">
                <div class="header">
                    <div class="title-background">
                        <div class="title-container">
                            <span class="title">SoundBoard</span>
                            <span class="subtitle">Your personal sound collection</span>
                        </div>
                    </div>
                    <button id="add-audio" class="add-btn">+ Add Sound</button>
                    <button id="create-playlist" class="add-btn">+ New Playlist</button>
                </div>
                <div class="tab-container">
                    ${Object.keys(this.playlists).map(playlist => 
                        `<div class="playlist-container">
                            <button class="tab-btn ${this.currentPlaylist === playlist ? 'active' : ''}" id="${playlist}-tab">${playlist}</button>
                            ${playlist !== "All" && playlist !== "Fav" ? `<button class="delete-playlist" data-playlist="${playlist}">
                                <img src="assets/delete.png" alt="Eliminar" class="delete-icon">
                            </button>` : ''}
                        </div>`
                    ).join('')}
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

        this.shadowRoot.querySelector("#add-audio").addEventListener("click", () => this.uploadAudio());
        this.shadowRoot.querySelector("#create-playlist").addEventListener("click", () => this.createPlaylist());
        
        this.shadowRoot.querySelectorAll(".delete-playlist").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const playlistName = e.target.closest("button").dataset.playlist;
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
