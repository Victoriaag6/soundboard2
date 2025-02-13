export function showModal(title, callback) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>${title}</h2>
            <input type="text" id="modal-input" placeholder="Enter name">
            <button id="modal-submit">Submit</button>
        </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => {
        modal.style.display = "none";
        document.body.removeChild(modal);
    };

    modal.querySelector('.close').onclick = closeModal;
    modal.querySelector('#modal-submit').onclick = () => {
        const inputValue = modal.querySelector('#modal-input').value;
        if (inputValue) {
            callback(inputValue);
            closeModal();
        } else {
            alert("The name cannot be empty.");
        }
    };

    modal.style.display = "block";
}