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
        const favIcon = isFavorite ? "Fav.png" : "NoFav.png";

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="styles.css">
            <div class="audio-container">
                <div class="audio-header">
                    <span class="audio-name">${name}</span>
                    <button class="fav">
                        <img src="${favIcon}" alt="Favorito" class="fav-icon">
                    </button>
                    <button class="delete">
                        <img src="delete.png" alt="Eliminar" class="delete-icon">
                    </button>
                </div>
                <audio controls>
                    <source src="${src}" type="audio/mpeg">
                    Your browser does not support the audio tag.
                </audio>
            </div>
        `;

        // Seleccionar los botones y añadir eventos
        const favButton = this.shadowRoot.querySelector(".fav");
        const deleteButton = this.shadowRoot.querySelector(".delete");

        favButton.addEventListener("click", () => {
            this.toggleFavorite();
        });

        deleteButton.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("delete-audio", { 
                bubbles: true, 
                composed: true, 
                detail: name 
            }));
        });
    }

    toggleFavorite() {
        const isFavorite = this.getAttribute("isFavorite") === "true";
        this.setAttribute("isFavorite", isFavorite ? "false" : "true");

        // Actualizar el icono de favorito sin recargar toda la interfaz
        const favIcon = this.shadowRoot.querySelector(".fav-icon");
        favIcon.src = this.getAttribute("isFavorite") === "true" ? "Fav.png" : "NoFav.png";

        this.dispatchEvent(new CustomEvent("toggle-favorite", { 
            bubbles: true, 
            composed: true, 
            detail: this.getAttribute("name") 
        }));
    }
}

customElements.define("audio-player", AudioPlayer);
