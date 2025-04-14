document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.isLoggedIn) {
        window.location.href = '/login/';
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

    // Helper function to get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Helper function to update cart count
    function updateCartCount(count) {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = count;
        }
    }

    // Helper function to show notifications
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Helper function to show quick view modal
    function showQuickViewModal(product) {
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="product-details">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h2>${product.name}</h2>
                        <p class="price">$${product.price}</p>
                        <p class="description">${product.description}</p>
                        <button class="add-to-cart" data-product-id="${product.id}">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal when clicking the close button
        const closeButton = modal.querySelector('.close-modal');
        closeButton.addEventListener('click', () => {
            modal.remove();
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Add event listener for add to cart button in modal
        const addToCartButton = modal.querySelector('.add-to-cart');
        addToCartButton.addEventListener('click', () => {
            addToCart(product.id);
            modal.remove();
        });
    }

    // Function to add product to cart
    function addToCart(productId) {
        fetch(`/cart/add/${productId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ quantity: 1 })
        })
        .then(response => {
            if (response.status === 401) {
                window.location.href = '/login/';
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                updateCartCount(data.cart_count);
                showNotification('Товар додано до кошика', 'success');
            } else {
                showNotification(data.message || 'Помилка при додаванні товару', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Помилка при додаванні товару', 'error');
        });
    }

    // Function to handle quick view
    function quickView(productId) {
        fetch(`/products/${productId}/quick-view/`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showQuickViewModal(data.product);
                } else {
                    showNotification(data.message || 'Error loading product details', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error loading product details', 'error');
            });
    }

    // Add event listeners when DOM is loaded
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });

    // Quick view buttons
    document.querySelectorAll('.quick-view').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = button.dataset.productId;
            quickView(productId);
        });
    });

    // Initial display
    displayCartItems();
}); 