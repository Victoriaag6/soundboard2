import { SoundBoardMethods } from './SoundBoardMethods.js';

class Playlist extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const playlistName = this.getAttribute("name") || "Unknown";
        const audios = JSON.parse(this.getAttribute("audios")) || [];
        const isActive = this.getAttribute("isActive") === "true";

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="styles.css">
            <div class="playlist-container ${isActive ? 'active' : ''}">
                <h3>${playlistName}</h3>
                <div class="audio-list">
                    ${audios.map(audio => `
                        <audio-player 
                            name="${audio.name}"
                            src="${audio.src}"
                            isFavorite="${audio.isFavorite}"
                            playlist="${playlistName}">
                        </audio-player>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

customElements.define("playlist-component", Playlist);