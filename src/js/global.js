// Hamburger Menu.
function configureModal(modalId, toggleId) {
    const modal = document.getElementById(modalId),
        toggle = document.getElementById(toggleId),
        lastFocusable = modal.querySelector('[data-modal-last-focusable]'),
        firstFocusable = modal.querySelector('[data-modal-first-focusable]');

    toggle.onclick = () => {
        if (modal.classList.contains('expanded')) {
            modal.classList.remove('expanded');
            setTimeout(() => modal.classList.add('hidden'), 1000);
        }
        else { 
            modal.classList.remove('hidden');
            // Wait a tick to ensure transition plays.
            setTimeout(() => modal.classList.add('expanded'), 1);
        }
    }

    lastFocusable.addEventListener("focusout", () => {
        if (!modal.classList.contains('expanded')) return;
        if (document.querySelector(`#${modalId}:focus-within`)) return;

        firstFocusable.focus();
    });

    firstFocusable.addEventListener("focusout", () => {
        if (!modal.classList.contains('expanded')) return;
        if (document.querySelector(`#${modalId}:focus-within`)) return;

        lastFocusable.focus();
    });
}
configureModal('site-nav', 'site-nav-toggle');
