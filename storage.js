// Simple storage utilities and seed data for The Crafted Threads
(function () {
    const LS_KEYS = {
        items: 'tct_items_v1',
        categories: 'tct_categories_v1',
        cart: 'tct_cart_v1',
        sales: 'tct_sales_v1'
    };

    function read(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            console.error(`Error reading from localStorage key "${key}":`, e);
            return fallback;
        }
    }

    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Error writing to localStorage key "${key}":`, e);
        }
    }

    function seedIfEmpty() {
        const seeded = read(LS_KEYS.items, null);
        if (seeded) return;
        const categories = [
            { gender: 'Men', name: 'T-Shirts' },
            { gender: 'Men', name: 'Polos' },
            { gender: 'Men', name: 'Shirts' },
            { gender: 'Men', name: 'Jeans' },
            { gender: 'Men', name: 'Pants' },
            { gender: 'Men', name: 'Joggers' },
            { gender: 'Men', name: 'Cargos' },
            { gender: 'Men', name: 'Winterwear' },
            { gender: 'Men', name: 'Cotton' },
            { gender: 'Men', name: 'Linen' },
            { gender: 'Women', name: 'T-Shirts' },
            { gender: 'Women', name: 'Polos' },
            { gender: 'Women', name: 'Shirts' },
            { gender: 'Women', name: 'Jeans' },
            { gender: 'Women', name: 'Pants' },
            { gender: 'Women', name: 'Joggers' },
            { gender: 'Women', name: 'Cargos' },
            { gender: 'Women', name: 'Winterwear' },
            { gender: 'Women', name: 'Cotton' },
            { gender: 'Women', name: 'Linen' }
        ];
        const sample = (id, name, price, gender, category, img, desc) => ({
            id, name, price, gender, category, img, desc
        });
        const img = (q) => `https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&${q}`;
        const items = [
            sample('m-ts-1', 'Men Tee Classic', 499, 'Men', 'T-Shirts', img('tee'), 'Classic cotton T-shirt'),
            sample('m-pl-1', 'Men Polo Navy', 899, 'Men', 'Polos', img('polo'), 'Comfort pique polo'),
            sample('m-sh-1', 'Men Shirt Oxford', 1299, 'Men', 'Shirts', img('shirt'), 'Oxford button-down'),
            sample('m-je-1', 'Men Jeans Slim', 1599, 'Men', 'Jeans', img('jeans'), 'Stretch denim slim fit'),
            sample('m-pa-1', 'Men Pants Chino', 1399, 'Men', 'Pants', img('chino'), 'Chino pants'),
            sample('w-ts-1', 'Women Tee Relaxed', 549, 'Women', 'T-Shirts', img('tee2'), 'Relaxed fit tee'),
            sample('w-sh-1', 'Women Shirt Linen', 1499, 'Women', 'Linen', img('linen'), 'Breathable linen shirt'),
            sample('w-je-1', 'Women Jeans Mom', 1699, 'Women', 'Jeans', img('mom'), 'Mom fit jeans')
        ];
        write(LS_KEYS.items, items);
        write(LS_KEYS.categories, categories);
        write(LS_KEYS.cart, []);
        write(LS_KEYS.sales, []);
    }
    seedIfEmpty();

    window.StorageAPI = {
        keys: LS_KEYS,

        getItems() { return read(LS_KEYS.items, []); },
        saveItems(items) { write(LS_KEYS.items, items); },

        getCategories() { return read(LS_KEYS.categories, []); },
        saveCategories(categories) { write(LS_KEYS.categories, categories); },

        getCart() { return read(LS_KEYS.cart, []); },
        saveCart(cart) { write(LS_KEYS.cart, cart); },
        clearCart() { write(LS_KEYS.cart, []); },

        getSales() { return read(LS_KEYS.sales, []); },
        saveSales(sales) { write(LS_KEYS.sales, sales); },
        addSale(sale) {
            const all = read(LS_KEYS.sales, []);
            all.push(sale);
            write(LS_KEYS.sales, all);
        }
    };
})();