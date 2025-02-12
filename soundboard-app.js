class SoundBoardApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.audioList = JSON.parse(localStorage.getItem("audioList")) || [];
        this.favList = JSON.parse(localStorage.getItem("favList")) || [];
        this.playlists = JSON.parse(localStorage.getItem("playlists")) || { "All": this.audioList, "Fav": this.favList };
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
    }

    uploadAudio() {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "audio/*";
        fileInput.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const audioName = prompt("Nombre del audio:");
                    if (!audioName) return;

                    const audio = {
                        name: audioName,
                        src: e.target.result // Convertimos el archivo a Data URL
                    };

                    this.addAudio(audio);
                };
                reader.readAsDataURL(file);
            }
        });
        fileInput.click();
    }

    addAudio(audio) {
        this.audioList.push(audio);
        this.playlists["All"].push(audio);
        localStorage.setItem("audioList", JSON.stringify(this.audioList));
        localStorage.setItem("playlists", JSON.stringify(this.playlists));
        this.render();
    }

    toggleFavorite(audioName) {
        if (this.favList.includes(audioName)) {
            this.favList = this.favList.filter(name => name !== audioName);
        } else {
            this.favList.push(audioName);
        }
        this.playlists["Fav"] = this.audioList.filter(audio => this.favList.includes(audio.name));
        localStorage.setItem("favList", JSON.stringify(this.favList));
        localStorage.setItem("playlists", JSON.stringify(this.playlists));
        this.render();
    }

    deleteAudio(audioName) {
        this.audioList = this.audioList.filter(audio => audio.name !== audioName);
        Object.keys(this.playlists).forEach(playlist => {
            this.playlists[playlist] = this.playlists[playlist].filter(audio => audio.name !== audioName);
        });
        localStorage.setItem("audioList", JSON.stringify(this.audioList));
        localStorage.setItem("playlists", JSON.stringify(this.playlists));
        setTimeout(() => this.render(), 10);
    }

    createPlaylist(name) {
        if (!this.playlists[name]) {
            this.playlists[name] = [];
            localStorage.setItem("playlists", JSON.stringify(this.playlists));
            this.render();
        }
    }

    addToPlaylist(audioName, playlistName) {
        const audio = this.audioList.find(a => a.name === audioName);
        if (audio && this.playlists[playlistName]) {
            this.playlists[playlistName].push(audio);
            localStorage.setItem("playlists", JSON.stringify(this.playlists));
            this.render();
        }
    }

    exportPlaylist(playlistName) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.playlists[playlistName]));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${playlistName}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    importPlaylist(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const importedPlaylist = JSON.parse(e.target.result);
                const playlistName = prompt("Nombre de la playlist importada:");
                if (playlistName) {
                    this.playlists[playlistName] = importedPlaylist;
                    localStorage.setItem("playlists", JSON.stringify(this.playlists));
                    this.render();
                }
            };
            reader.readAsText(file);
        }
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
                    <button id="import-playlist" class="add-btn">📂 Import Playlist</button>
                </div>
                <div class="tab-container">
                    ${Object.keys(this.playlists).map(playlist => `
                        <button class="tab-btn ${this.currentPlaylist === playlist ? 'active' : ''}" id="${playlist}-tab">${playlist}</button>
                    `).join('')}
                </div>
                <div class="audio-list">
                    ${displayedAudios.map(audio => `
                        <audio-player 
                            name="${audio.name}"
                            src="${audio.src}"
                            isFavorite="${this.favList.includes(audio.name)}">
                        </audio-player>`).join('')}
                </div>
            </div>
            <input type="file" id="import-file" style="display: none;"/>
        `;

        this.shadowRoot.querySelector("#add-audio").addEventListener("click", () => this.uploadAudio());
        this.shadowRoot.querySelector("#create-playlist").addEventListener("click", () => {
            const name = prompt("Nombre de la nueva playlist:");
            if (name) this.createPlaylist(name);
        });
        this.shadowRoot.querySelector("#import-playlist").addEventListener("click", () => {
            this.shadowRoot.querySelector("#import-file").click();
        });
        this.shadowRoot.querySelector("#import-file").addEventListener("change", (e) => this.importPlaylist(e));
        Object.keys(this.playlists).forEach(playlist => {
            this.shadowRoot.querySelector(`#${playlist}-tab`).addEventListener("click", () => {
                this.currentPlaylist = playlist;
                this.render();
            });
        });
    }
}

customElements.define("soundboard-app", SoundBoardApp);
