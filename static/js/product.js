document.addEventListener('DOMContentLoaded', function() {
    // Отримуємо ID товару з URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Приклад даних товару (в реальному проекті це буде API)
    const product = {
        id: 1,
        name: "Садові ножиці",
        description: "Професійні садові ножиці з нержавіючої сталі. Ідеально підходять для обрізки гілок та формування кущів. Мають ергономічну рукоятку та захист від корозії.",
        price: 1200,
        oldPrice: 1500,
        images: [
            "images/flower.jpg",
            "images/stovp.jpg",
            "images/carousel3.jpg"
        ],
        specs: {
            material: "Нержавіюча сталь",
            length: "25 см",
            weight: "0.5 кг",
            country: "Україна"
        },
        isNew: true,
        discount: 20
    };

    // Оновлюємо інформацію про товар на сторінці
    function updateProductInfo() {
        // Оновлюємо заголовок сторінки
        document.title = `${product.name} - GREEN MARKET`;

        // Оновлюємо основне зображення
        const mainImage = document.getElementById('mainImage');
        mainImage.src = product.images[0];
        mainImage.alt = product.name;

        // Оновлюємо мініатюри
        const thumbnailList = document.querySelector('.thumbnail-list');
        thumbnailList.innerHTML = product.images.map((img, index) => `
            <img src="${img}" alt="${product.name} ${index + 1}" 
                 class="thumbnail ${index === 0 ? 'active' : ''}"
                 data-index="${index}">
        `).join('');

        // Оновлюємо бейджі
        const badges = document.querySelector('.product-badges');
        badges.innerHTML = `
            ${product.isNew ? '<span class="badge-new">Новинка</span>' : ''}
            ${product.discount > 0 ? `<span class="badge-sale">-${product.discount}%</span>` : ''}
        `;

        // Оновлюємо назву
        document.querySelector('.product-title').textContent = product.name;

        // Оновлюємо ціну
        const priceContainer = document.querySelector('.product-price');
        priceContainer.innerHTML = `
            <span class="current-price">${product.price} ₴</span>
            ${product.oldPrice ? `<span class="old-price">${product.oldPrice} ₴</span>` : ''}
        `;

        // Оновлюємо опис
        document.querySelector('.product-description p').textContent = product.description;

        // Оновлюємо характеристики
        const specsList = document.querySelector('.product-specs ul');
        specsList.innerHTML = Object.entries(product.specs).map(([key, value]) => `
            <li><strong>${key}:</strong> ${value}</li>
        `).join('');
    }

    // Обробники для мініатюр
    function setupThumbnails() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        const mainImage = document.getElementById('mainImage');

        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                // Оновлюємо активну мініатюру
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // Оновлюємо основне зображення
                const index = this.dataset.index;
                mainImage.src = product.images[index];
            });
        });
    }

    // Обробники для кнопок кількості
    function setupQuantityButtons() {
        const minusBtn = document.querySelector('.quantity-btn.minus');
        const plusBtn = document.querySelector('.quantity-btn.plus');
        const quantityInput = document.querySelector('.quantity-selector input');

        minusBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue < 10) {
                quantityInput.value = currentValue + 1;
            }
        });

        quantityInput.addEventListener('change', () => {
            let value = parseInt(quantityInput.value);
            if (value < 1) value = 1;
            if (value > 10) value = 10;
            quantityInput.value = value;
        });
    }

    // Обробники для кнопок дій
    function setupActionButtons() {
        const addToCartBtn = document.querySelector('.add-to-cart');
        const buyNowBtn = document.querySelector('.buy-now');
        const quantityInput = document.querySelector('.quantity-selector input');

        addToCartBtn.addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value);
            // Тут буде логіка додавання в кошик
            alert(`Додано ${quantity} шт. до кошика!`);
        });

        buyNowBtn.addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value);
            // Тут буде логіка швидкого замовлення
            alert(`Перехід до оформлення замовлення ${quantity} шт.`);
        });
    }

    // Ініціалізація
    updateProductInfo();
    setupThumbnails();
    setupQuantityButtons();
    setupActionButtons();
}); 