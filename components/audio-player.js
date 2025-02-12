class AudioPlayer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const name = this.getAttribute("name") || "Unknown";
        const src = this.getAttribute("src") || "";
        const isFavorite = this.getAttribute("isFavorite") === "true";
        const playlist = this.getAttribute("playlist") || "All";
        const favIcon = isFavorite ? "assets/Fav.png" : "assets/NoFav.png";

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="styles.css">
            <div class="audio-container">
                <div class="audio-header">
                    <span class="audio-name">${name} - <small>${playlist}</small></span>
                    <button class="fav">
                        <img src="${favIcon}" alt="Favorito" class="fav-icon">
                    </button>
                    <button class="delete">
                        <img src="assets/delete.png" alt="Eliminar" class="delete-icon">
                    </button>
                    <select class="playlist-select" id="playlist-select-${name}" name="playlist">
                        <option value="">Añadir a Playlist</option>
                    </select>
                </div>
                <audio controls>
                    <source src="${src}" type="audio/mpeg">
                    Your browser does not support the audio tag.
                </audio>
            </div>
        `;

        const favButton = this.shadowRoot.querySelector(".fav");
        const deleteButton = this.shadowRoot.querySelector(".delete");
        const playlistSelect = this.shadowRoot.querySelector(".playlist-select");

        favButton.addEventListener("click", () => this.toggleFavorite());
        deleteButton.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("delete-audio", { 
                bubbles: true, 
                composed: true, 
                detail: name 
            }));
        });

        this.populatePlaylists(playlistSelect);
        playlistSelect.addEventListener("change", (event) => {
            if (event.target.value) {
                this.dispatchEvent(new CustomEvent("add-to-playlist", {
                    bubbles: true,
                    composed: true,
                    detail: { audioName: name, playlistName: event.target.value }
                }));
            }
        });
    }

    toggleFavorite() {
        const isFavorite = this.getAttribute("isFavorite") === "true";
        this.setAttribute("isFavorite", isFavorite ? "false" : "true");
        const favIcon = this.shadowRoot.querySelector(".fav-icon");
        favIcon.src = this.getAttribute("isFavorite") === "true" ? "assets/Fav.png" : "assets/NoFav.png";

        this.dispatchEvent(new CustomEvent("toggle-favorite", { 
            bubbles: true, 
            composed: true, 
            detail: this.getAttribute("name") 
        }));
    }

    populatePlaylists(selectElement) {
        const playlists = JSON.parse(localStorage.getItem("playlists")) || { "All": [], "Fav": [] };
        Object.keys(playlists).forEach(playlist => {
            if (playlist !== "All" && playlist !== "Fav") {
                const option = document.createElement("option");
                option.value = playlist;
                option.textContent = playlist;
                selectElement.appendChild(option);
            }
        });
    }
}

customElements.define("audio-player", AudioPlayer);
