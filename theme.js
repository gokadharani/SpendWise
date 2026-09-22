const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeLabel = document.querySelector('.theme-label');
const htmlElement = document.documentElement;

function initTheme() {
    const savedTheme = localStorage.getItem('spendwise_theme');

    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        const prefersDark =
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches;

        applyTheme(prefersDark ? 'dark' : 'light');
    }
}

function applyTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('spendwise_theme', theme);

    if (theme === 'dark') {
        if (themeLabel) themeLabel.textContent = 'Light Mode';
        themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
    } else {
        if (themeLabel) themeLabel.textContent = 'Dark Mode';
        themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
    }
}

function toggleTheme() {
    const currentTheme =
        htmlElement.getAttribute('data-theme') || 'light';

    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    applyTheme(newTheme);

    showToast(`Switched to ${newTheme} mode`, 'info');
}

themeToggleBtn.addEventListener('click', toggleTheme);