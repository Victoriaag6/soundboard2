class TabSelector extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.activeTab = "all";
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="styles.css">
            <div class="tab-container">
                <button id="all" class="tab-btn active">All</button>
                <button id="fav" class="tab-btn">Fav</button>
            </div>
        `;
        this.shadowRoot.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", (e) => {
                this.activeTab = e.target.id;
                this.dispatchEvent(new CustomEvent("change-tab", { detail: this.activeTab, bubbles: true }));
                this.updateTabStyles();
            });
        });
    }

    updateTabStyles() {
        this.shadowRoot.querySelectorAll("button").forEach(btn => {
            btn.classList.toggle("active", btn.id === this.activeTab);
        });
    }
}
customElements.define("tab-selector", TabSelector);
