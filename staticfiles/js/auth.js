document.addEventListener('DOMContentLoaded', () => {
    // Tab switching functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (btn.dataset.tab === 'login') {
                loginForm.classList.add('active');
                registerForm.classList.remove('active');
            } else {
                registerForm.classList.add('active');
                loginForm.classList.remove('active');
            }
        });
    });

    // Login form handling
    const loginFormElement = document.getElementById('loginForm');
    loginFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Here you would typically make an API call to your backend
        // For now, we'll just simulate a successful login
        const user = {
            email,
            name: 'User',
            isLoggedIn: true
        };

        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = 'index.html';
    });

    // Register form handling
    const registerFormElement = document.getElementById('registerForm');
    registerFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (password !== confirmPassword) {
            alert('Паролі не співпадають!');
            return;
        }

        // Here you would typically make an API call to your backend
        // For now, we'll just simulate a successful registration
        const user = {
            name,
            email,
            isLoggedIn: true
        };

        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = 'index.html';
    });
}); 