document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.isLoggedIn) {
        window.location.href = 'auth.html';
        return;
    }

    // Cart functionality
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');

    // Display cart items
    function displayCartItems() {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Ваша корзина порожня</p>';
            return;
        }

        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="price">${item.price} грн</p>
                </div>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <button class="remove-item" onclick="removeItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        updateTotals();
    }

    // Update quantity
    window.updateQuantity = (index, change) => {
        cart[index].quantity += change;
        if (cart[index].quantity < 1) {
            cart.splice(index, 1);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
    };

    // Remove item
    window.removeItem = (index) => {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
    };

    // Update totals
    function updateTotals() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 0 ? 50 : 0;
        const total = subtotal + shipping;

        subtotalElement.textContent = `${subtotal.toFixed(2)} грн`;
        shippingElement.textContent = `${shipping.toFixed(2)} грн`;
        totalElement.textContent = `${total.toFixed(2)} грн`;
    }

    // Payment method toggle
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const cardDetails = document.getElementById('cardDetails');

    paymentOptions.forEach(option => {
        option.addEventListener('change', () => {
            cardDetails.style.display = option.value === 'card' ? 'block' : 'none';
        });
    });

    // Checkout form handling
    const checkoutForm = document.getElementById('checkoutForm');
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (cart.length === 0) {
            alert('Ваша корзина порожня!');
            return;
        }

        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            payment: document.querySelector('input[name="payment"]:checked').value,
            items: cart,
            total: parseFloat(totalElement.textContent),
            date: new Date().toISOString()
        };

        // Here you would typically send this data to your backend
        console.log('Order submitted:', formData);
        
        // Clear cart and redirect to success page
        localStorage.removeItem('cart');
        alert('Замовлення успішно оформлено!');
        window.location.href = 'index.html';
    });

    // Initial display
    displayCartItems();
}); 