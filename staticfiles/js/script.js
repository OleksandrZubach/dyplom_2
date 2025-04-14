document.addEventListener("DOMContentLoaded", function () {
    // Check authentication status
    const user = JSON.parse(localStorage.getItem('user'));
    const authLinks = document.getElementById('authLinks');
    
    // Update cart count
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    // Initial cart count update
    updateCartCount();
    
    if (user && user.isLoggedIn) {
        authLinks.innerHTML = `
            <span>Привіт, ${user.name}</span>
            <a href="#" class="logout-btn">Вийти</a>
        `;
        
        // Add logout functionality
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('user');
                window.location.reload();
            });
        }
    }

    // Cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!user || !user.isLoggedIn) {
                window.location.href = 'auth.html';
                return;
            }

            const productId = button.dataset.productId;
            const product = {
                id: productId,
                name: button.parentElement.querySelector('p').textContent,
                price: parseFloat(button.parentElement.querySelector('span').textContent),
                image: button.parentElement.querySelector('img').src,
                quantity: 1
            };

            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingProduct = cart.find(item => item.id === productId);

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.push(product);
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            showNotification('Товар додано до корзини!');
        });
    });

    const track = document.querySelector(".carousel-track");
    const slides = document.querySelectorAll(".carousel-track img");
    const prevButton = document.querySelector(".prev");
    const nextButton = document.querySelector(".next");
    let index = 0;
    const slideWidth = slides[0].clientWidth;
    let autoPlayInterval;

    // Створюємо індикатори слайдів
    const indicatorsContainer = document.createElement("div");
    indicatorsContainer.className = "carousel-indicators";
    document.querySelector(".carousel").appendChild(indicatorsContainer);

    slides.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.className = "indicator";
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => moveSlide(i));
        indicatorsContainer.appendChild(dot);
    });

    const indicators = document.querySelectorAll(".indicator");

    function updateIndicators() {
        indicators.forEach((dot, i) => {
            dot.classList.toggle("active", i === index);
        });
    }

    function moveSlide(newIndex) {
        if (newIndex < 0) {
            index = slides.length - 1;
        } else if (newIndex >= slides.length) {
            index = 0;
        } else {
            index = newIndex;
        }
        track.style.transform = `translateX(${-index * slideWidth}px)`;
        updateIndicators();
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(() => moveSlide(index + 1), 5000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    // Додаємо обробники подій для кнопок
    nextButton.addEventListener("click", () => {
        moveSlide(index + 1);
        stopAutoPlay();
        startAutoPlay();
    });

    prevButton.addEventListener("click", () => {
        moveSlide(index - 1);
        stopAutoPlay();
        startAutoPlay();
    });

    // Додаємо обробники подій для зупинки автопрокрутки при наведенні
    track.addEventListener("mouseenter", stopAutoPlay);
    track.addEventListener("mouseleave", startAutoPlay);

    // Запускаємо автопрокрутку
    startAutoPlay();

    // Notification system
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Search functionality
    const searchInput = document.querySelector('.search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const products = document.querySelectorAll('.product');
            
            products.forEach(product => {
                const productName = product.querySelector('p').textContent.toLowerCase();
                product.style.display = productName.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }

    // Menu functionality
    const menuItems = document.querySelectorAll('.menu > ul > li');
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const submenu = item.querySelector('.submenu');
            if (submenu) {
                submenu.style.display = 'block';
            }
        });

        item.addEventListener('mouseleave', () => {
            const submenu = item.querySelector('.submenu');
            if (submenu) {
                submenu.style.display = 'none';
            }
        });
    });
});
