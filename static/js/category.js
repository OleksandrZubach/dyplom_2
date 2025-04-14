document.addEventListener('DOMContentLoaded', () => {
    // Get category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    // Sample products data (in a real app, this would come from a backend)
    const products = {
        'Декоративні кущі': [
            { id: 1, name: 'Самшит', price: 450, image: 'images/flower.jpg' },
            { id: 2, name: 'Туя', price: 600, image: 'images/stovp.jpg' },
            { id: 3, name: 'Можжевельник', price: 550, image: 'images/flower.jpg' },
            { id: 4, name: 'Барбарис', price: 400, image: 'images/stovp.jpg' }
        ],
        'Плодові дерева': [
            { id: 5, name: 'Яблуня', price: 800, image: 'images/flower.jpg' },
            { id: 6, name: 'Груша', price: 850, image: 'images/stovp.jpg' },
            { id: 7, name: 'Слива', price: 750, image: 'images/flower.jpg' },
            { id: 8, name: 'Вишня', price: 700, image: 'images/stovp.jpg' }
        ],
        'Квіткові рослини': [
            { id: 9, name: 'Троянда', price: 300, image: 'images/flower.jpg' },
            { id: 10, name: 'Півонія', price: 350, image: 'images/stovp.jpg' },
            { id: 11, name: 'Георгіна', price: 250, image: 'images/flower.jpg' },
            { id: 12, name: 'Хризантема', price: 280, image: 'images/stovp.jpg' }
        ],
        'Овочеві культури': [
            { id: 13, name: 'Помідори', price: 150, image: 'images/flower.jpg' },
            { id: 14, name: 'Огірки', price: 120, image: 'images/stovp.jpg' },
            { id: 15, name: 'Перець', price: 180, image: 'images/flower.jpg' },
            { id: 16, name: 'Баклажани', price: 160, image: 'images/stovp.jpg' }
        ]
    };

    // Update page title and display products
    if (category && products[category]) {
        document.title = `${category} | Інтернет-магазин`;
        const categoryTitle = document.querySelector('.category-title');
        if (categoryTitle) {
            categoryTitle.textContent = category;
        }

        const productList = document.querySelector('.product-list');
        if (productList) {
            productList.innerHTML = products[category].map(product => `
                <div class="product">
                    <img src="${product.image}" alt="${product.name}">
                    <p>${product.name}</p>
                    <span>${product.price} ₴</span>
                    <button class="add-to-cart" data-product-id="${product.id}">🛒</button>
                </div>
            `).join('');

            // Add event listeners to new buttons
            const addToCartButtons = productList.querySelectorAll('.add-to-cart');
            addToCartButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const user = JSON.parse(localStorage.getItem('user'));
                    if (!user || !user.isLoggedIn) {
                        window.location.href = 'auth.html';
                        return;
                    }

                    const productId = button.dataset.productId;
                    const product = products[category].find(p => p.id === parseInt(productId));

                    let cart = JSON.parse(localStorage.getItem('cart')) || [];
                    const existingProduct = cart.find(item => item.id === productId);

                    if (existingProduct) {
                        existingProduct.quantity += 1;
                    } else {
                        cart.push({ ...product, quantity: 1 });
                    }

                    localStorage.setItem('cart', JSON.stringify(cart));
                    showNotification('Товар додано до корзини!');
                });
            });
        }
    }
}); 