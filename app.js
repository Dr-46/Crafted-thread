// The Crafted Threads - SPA logic
(function () {
    // Elements
    const els = {
        year: document.getElementById('year'),
        productGrid: document.getElementById('productGrid'),
        sectionTitle: document.getElementById('sectionTitle'),
        filterGender: document.getElementById('filterGender'),
        filterCategory: document.getElementById('filterCategory'),
        searchInput: document.getElementById('searchInput'),
        resetFilters: document.getElementById('resetFilters'),
        sortSelect: document.getElementById('sortSelect'),
        cartBtn: document.getElementById('cartBtn'),
        cartCount: document.getElementById('cartCount'),
        cartDrawer: document.getElementById('cartDrawer'),
        cartItems: document.getElementById('cartItems'),
        cartItemsCount: document.getElementById('cartItemsCount'),
        cartTotal: document.getElementById('cartTotal'),
        clearCartBtn: document.getElementById('clearCartBtn'),
        checkoutBtn: document.getElementById('checkoutBtn'),
        manageMenuBtn: document.getElementById('manageMenuBtn'),
        reportBtn: document.getElementById('reportBtn'),
        checkoutModal: document.getElementById('checkoutModal'),
        billItems: document.getElementById('billItems'),
        billTotal: document.getElementById('billTotal'),
        printBillBtn: document.getElementById('printBillBtn'),
        confirmPaymentBtn: document.getElementById('confirmPaymentBtn'),
        manageModal: document.getElementById('manageModal'),
        categoryForm: document.getElementById('categoryForm'),
        catGender: document.getElementById('catGender'),
        catName: document.getElementById('catName'),
        categoryList: document.getElementById('categoryList'),
        itemForm: document.getElementById('itemForm'),
        itemId: document.getElementById('itemId'),
        itemName: document.getElementById('itemName'),
        itemPrice: document.getElementById('itemPrice'),
        itemGender: document.getElementById('itemGender'),
        itemCategory: document.getElementById('itemCategory'),
        itemImage: document.getElementById('itemImage'),
        itemDesc: document.getElementById('itemDesc'),
        resetItemFormBtn: document.getElementById('resetItemFormBtn'),
        itemManageList: document.getElementById('itemManageList'),
        reportModal: document.getElementById('reportModal'),
        reportMonth: document.getElementById('reportMonth'),
        generateReportBtn: document.getElementById('generateReportBtn'),
        reportSummary: document.getElementById('reportSummary'),
        reportTable: document.getElementById('reportTable')
    };
    els.year.textContent = new Date().getFullYear();

    // State
    let items = StorageAPI.getItems();
    let categories = StorageAPI.getCategories();
    let cart = StorageAPI.getCart();
    let filters = { gender: 'All', category: 'All', search: '', sort: 'newest' };

    // Helpers
    function formatCurrency(n) {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);
    }

    function updateCartBadge() {
        els.cartCount.textContent = cart.length;
    }

    function ensureCategoryExists(gender, name) {
        const exists = categories.some(c => c.gender === gender && c.name === name);
        if (!exists) {
            categories.push({ gender, name });
            StorageAPI.saveCategories(categories);
        }
    }

    function applyFilters(all) {
        let filtered = all;

        if (filters.gender !== 'All') {
            filtered = filtered.filter(item => item.gender === filters.gender);
        }

        if (filters.category !== 'All') {
            filtered = filtered.filter(item => item.category === filters.category);
        }

        if (filters.search) {
            const q = filters.search.toLowerCase();
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(q) || 
                item.desc.toLowerCase().includes(q)
            );
        }

        if (filters.sort === 'priceLow') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (filters.sort === 'priceHigh') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (filters.sort === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            filtered.sort((a, b) => new Date(b.id) - new Date(a.id));
        }

        return filtered;
    }

    // Rendering
    function renderProducts() {
        const filtered = applyFilters(items);
        els.productGrid.innerHTML = filtered.map(item => `
            <div class="card">
                <img src="${item.img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/180?text=No+Image'">
                <div class="card-body">
                    <div class="card-title">${item.name}</div>
                    <div class="card-meta">
                        <span>${item.category}</span>
                        <span class="price">${formatCurrency(item.price)}</span>
                    </div>
                    <p style="font-size: 12px; color: var(--muted); margin: 0;">${item.desc}</p>
                    <div class="card-actions">
                        <button class="btn primary" onclick="addToCart('${item.id}')">Add Cart</button>
                        <button class="btn secondary" onclick="viewItem('${item.id}')">View</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderCart() {
        if (!cart.length) {
            els.cartItems.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--muted);">Cart is empty</div>';
            els.cartItemsCount.textContent = '0';
            els.cartTotal.textContent = formatCurrency(0);
            return;
        }

        els.cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/64?text=No+Image'">
                <div style="flex: 1;">
                    <div style="font-weight: 600;">${item.name}</div>
                    <div style="font-size: 12px; color: var(--muted);">${formatCurrency(item.price)}</div>
                    <div class="qty">
                        <button class="btn" onclick="updateQty('${item.id}', -1)" style="flex: 0; padding: 4px 8px;">−</button>
                        <input type="number" value="${item.qty}" readonly style="width: 50px; text-align: center;">
                        <button class="btn" onclick="updateQty('${item.id}', 1)" style="flex: 0; padding: 4px 8px;">+</button>
                        <button class="btn danger" onclick="removeFromCart('${item.id}')" style="flex: 0;">✕</button>
                    </div>
                </div>
                <div style="text-align: right; font-weight: 600;">${formatCurrency(item.price * item.qty)}</div>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        els.cartItemsCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
        els.cartTotal.textContent = formatCurrency(total);
    }

    function renderCategoryPills() {
        els.categoryList.innerHTML = categories.map(cat => `
            <div class="pill">
                ${cat.gender} - ${cat.name}
                <span class="x" onclick="deleteCategory('${cat.gender}', '${cat.name}')">×</span>
            </div>
        `).join('');
    }

    function renderManageItems() {
        els.itemManageList.innerHTML = `
            <div class="row" style="font-weight: 600;">
                <div>Name</div>
                <div>Price</div>
                <div>Category</div>
                <div>Actions</div>
            </div>
            ${items.map(item => `
                <div class="row">
                    <div>${item.name}</div>
                    <div>${formatCurrency(item.price)}</div>
                    <div>${item.category}</div>
                    <div class="row-actions">
                        <button class="btn secondary" onclick="editItem('${item.id}')" style="flex: 0;">Edit</button>
                        <button class="btn danger" onclick="deleteItem('${item.id}')" style="flex: 0;">Delete</button>
                    </div>
                </div>
            `).join('')}
        `;
    }

    // Cart Operations
    window.addToCart = function(itemId) {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const cartItem = cart.find(c => c.id === itemId);
        if (cartItem) {
            cartItem.qty++;
        } else {
            cart.push({ ...item, qty: 1 });
        }
        StorageAPI.saveCart(cart);
        renderCart();
        updateCartBadge();
    };

    window.updateQty = function(itemId, delta) {
        const cartItem = cart.find(c => c.id === itemId);
        if (cartItem) {
            cartItem.qty = Math.max(1, cartItem.qty + delta);
            StorageAPI.saveCart(cart);
            renderCart();
        }
    };

    window.removeFromCart = function(itemId) {
        cart = cart.filter(c => c.id !== itemId);
        StorageAPI.saveCart(cart);
        renderCart();
        updateCartBadge();
    };

    window.viewItem = function(itemId) {
        const item = items.find(i => i.id === itemId);
        if (item) {
            alert(`${item.name}\n\n${item.desc}\n\nPrice: ${formatCurrency(item.price)}`);
        }
    };

    // Category Management
    window.deleteCategory = function(gender, name) {
        if (confirm(`Delete ${gender} - ${name}?`)) {
            categories = categories.filter(c => !(c.gender === gender && c.name === name));
            StorageAPI.saveCategories(categories);
            renderCategoryPills();
        }
    };

    // Item Management
    window.editItem = function(itemId) {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        els.itemId.value = item.id;
        els.itemName.value = item.name;
        els.itemPrice.value = item.price;
        els.itemGender.value = item.gender;
        els.itemCategory.value = item.category;
        els.itemImage.value = item.img;
        els.itemDesc.value = item.desc;
        els.itemForm.scrollIntoView({ behavior: 'smooth' });
    };

    window.deleteItem = function(itemId) {
        if (confirm('Delete this item?')) {
            items = items.filter(i => i.id !== itemId);
            StorageAPI.saveItems(items);
            renderManageItems();
            renderProducts();
        }
    };

    // Event Listeners
    els.year.addEventListener('click', () => {
        els.year.textContent = new Date().getFullYear();
    });

    els.cartBtn.addEventListener('click', () => {
        els.cartDrawer.classList.toggle('hidden');
    });

    document.querySelector('[data-close-cart]').addEventListener('click', () => {
        els.cartDrawer.classList.add('hidden');
    });

    els.clearCartBtn.addEventListener('click', () => {
        if (confirm('Clear entire cart?')) {
            cart = [];
            StorageAPI.saveCart(cart);
            renderCart();
            updateCartBadge();
        }
    });

    els.checkoutBtn.addEventListener('click', () => {
        if (!cart.length) {
            alert('Cart is empty');
            return;
        }
        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        els.billItems.innerHTML = cart.map(item => `
            <div class="bill-line">
                <div>${item.name} × ${item.qty}</div>
                <div>${formatCurrency(item.price)}</div>
                <div>${formatCurrency(item.price * item.qty)}</div>
            </div>
        `).join('');
        els.billTotal.textContent = formatCurrency(total);

        const upi = encodeURIComponent(`upi://pay?pa=crafted@upi&pn=The Crafted Threads&am=${total.toFixed(2)}&tn=Order Payment`);
        document.getElementById('paymentQr').src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${upi}`;
        els.checkoutModal.classList.remove('hidden');
    });

    document.querySelector('[data-close-checkout]').addEventListener('click', () => {
        els.checkoutModal.classList.add('hidden');
    });

    els.printBillBtn.addEventListener('click', () => {
        const billContent = `
            THE CRAFTED THREADS
            ${new Date().toLocaleString()}
            
            ${cart.map(item => `${item.name} × ${item.qty} = ${formatCurrency(item.price * item.qty)}`).join('\n')}
            
            TOTAL: ${els.billTotal.textContent}
        `;
        const w = window.open('', '', 'width=400,height=600');
        w.document.write(`<pre>${billContent}</pre>`);
        w.print();
    });

    els.confirmPaymentBtn.addEventListener('click', () => {
        if (!cart.length) return;
        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const sale = {
            id: 'sale_' + Date.now(),
            at: new Date().toISOString(),
            items: cart.map(item => ({ id: item.id, name: item.name, qty: item.qty, price: item.price })),
            total
        };
        StorageAPI.addSale(sale);
        cart = [];
        StorageAPI.saveCart(cart);
        renderCart();
        updateCartBadge();
        els.checkoutModal.classList.add('hidden');
        alert('Payment confirmed! Sale recorded.');
    });

    els.manageMenuBtn.addEventListener('click', () => {
        renderCategoryPills();
        renderManageItems();
        els.manageModal.classList.remove('hidden');
    });

    document.querySelector('[data-close-manage]').addEventListener('click', () => {
        els.manageModal.classList.add('hidden');
    });

    els.categoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const gender = els.catGender.value;
        const name = els.catName.value.trim();
        if (!name) return;
        ensureCategoryExists(gender, name);
        els.catName.value = '';
        renderCategoryPills();
    });

    els.itemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = els.itemId.value || 'item_' + Date.now();
        const newItem = {
            id,
            name: els.itemName.value.trim(),
            price: parseFloat(els.itemPrice.value),
            gender: els.itemGender.value,
            category: els.itemCategory.value,
            img: els.itemImage.value || 'https://via.placeholder.com/180?text=No+Image',
            desc: els.itemDesc.value.trim()
        };

        const idx = items.findIndex(i => i.id === id);
        if (idx >= 0) {
            items[idx] = newItem;
        } else {
            items.push(newItem);
        }
        StorageAPI.saveItems(items);
        ensureCategoryExists(newItem.gender, newItem.category);
        els.itemForm.reset();
        els.itemId.value = '';
        renderManageItems();
        renderProducts();
    });

    els.resetItemFormBtn.addEventListener('click', () => {
        els.itemForm.reset();
        els.itemId.value = '';
    });

    els.filterGender.addEventListener('change', (e) => {
        filters.gender = e.target.value;
        renderProducts();
    });

    els.filterCategory.addEventListener('change', (e) => {
        filters.category = e.target.value;
        renderProducts();
    });

    els.searchInput.addEventListener('input', (e) => {
        filters.search = e.target.value;
        renderProducts();
    });

    els.sortSelect.addEventListener('change', (e) => {
        filters.sort = e.target.value;
        renderProducts();
    });

    els.resetFilters.addEventListener('click', () => {
        filters = { gender: 'All', category: 'All', search: '', sort: 'newest' };
        els.filterGender.value = 'All';
        els.filterCategory.value = 'All';
        els.searchInput.value = '';
        els.sortSelect.value = 'newest';
        renderProducts();
    });

    els.reportBtn.addEventListener('click', () => {
        els.reportMonth.valueAsDate = new Date();
        els.reportSummary.innerHTML = '';
        els.reportTable.innerHTML = '';
        els.reportModal.classList.remove('hidden');
    });

    document.querySelector('[data-close-report]').addEventListener('click', () => {
        els.reportModal.classList.add('hidden');
    });

    els.generateReportBtn.addEventListener('click', () => {
        const monthStr = els.reportMonth.value;
        if (!monthStr) {
            alert('Please select a month');
            return;
        }
        const [year, month] = monthStr.split('-');
        const sales = StorageAPI.getSales();
        const filtered = sales.filter(s => {
            const saleDate = new Date(s.at);
            return saleDate.getFullYear() === parseInt(year) && 
                   (saleDate.getMonth() + 1) === parseInt(month);
        });
        const totalAmount = filtered.reduce((sum, s) => sum + s.total, 0);
        const totalItems = filtered.reduce((sum, s) => sum + s.items.reduce((iq, i) => iq + i.qty, 0), 0);
        els.reportSummary.innerHTML = `
            <div class="summary-card">
                <div class="summary-item">
                    <span>Total Sales</span>
                    <strong>${filtered.length}</strong>
                </div>
                <div class="summary-item">
                    <span>Total Items Sold</span>
                    <strong>${totalItems}</strong>
                </div>
                <div class="summary-item">
                    <span>Total Revenue</span>
                    <strong>${formatCurrency(totalAmount)}</strong>
                </div>
            </div>
        `;
        els.reportTable.innerHTML = `
            <div class="row" style="font-weight: 600;">
                <div>Sale ID</div>
                <div>Date</div>
                <div>Items</div>
                <div>Amount</div>
            </div>
            ${filtered.map(s => `
                <div class="row">
                    <div>${s.id}</div>
                    <div>${new Date(s.at).toLocaleString()}</div>
                    <div>${s.items.reduce((sum, i) => sum + i.qty, 0)}</div>
                    <div>${formatCurrency(s.total)}</div>
                </div>
            `).join('')}
        `;
    });

    // Initial render
    renderProducts();
    updateCartBadge();
})();