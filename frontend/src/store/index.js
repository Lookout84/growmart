import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user, tokens) => {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useCartStore = create(
  persist(
    (set, get) => ({
      // Auth cart
      cart: null,
      items: [],
      totalPrice: 0,
      totalItems: 0,
      setCart: (cart) => set({
        cart,
        items: cart.items || [],
        totalPrice: cart.total_price || 0,
        totalItems: cart.total_items || 0,
      }),
      clearCart: () => set({ cart: null, items: [], totalPrice: 0, totalItems: 0 }),
      addItem: async (productId, quantity = 1, variantId = null) => {
        const payload = { product_id: productId, quantity };
        if (variantId) payload.variant_id = variantId;
        const { data } = await api.post('/api/cart/add_item/', payload);
        set({
          cart: data,
          items: data.items || [],
          totalPrice: data.total_price || 0,
          totalItems: data.total_items || 0,
        });
        return data;
      },

      // Guest cart
      guestItems: [],
      addGuestItem: (product, quantity = 1, variant = null) => {
        set((state) => {
          const key = variant ? `${product.id}|${variant.id}` : `${product.id}`;
          const existing = state.guestItems.find((i) => i._key === key);
          if (existing) {
            return {
              guestItems: state.guestItems.map((i) =>
                i._key === key ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return { guestItems: [...state.guestItems, { _key: key, product, variant, quantity }] };
        });
      },
      updateGuestItem: (key, quantity) => {
        set((state) => ({
          guestItems:
            quantity <= 0
              ? state.guestItems.filter((i) => i._key !== key)
              : state.guestItems.map((i) =>
                  i._key === key ? { ...i, quantity } : i
                ),
        }));
      },
      removeGuestItem: (key) => {
        set((state) => ({
          guestItems: state.guestItems.filter((i) => i._key !== key),
        }));
      },
      clearGuestCart: () => set({ guestItems: [] }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ guestItems: state.guestItems }),
    }
  )
);

export const useWishlistStore = create((set, get) => ({
  ids: [],       // product IDs currently in wishlist
  loaded: false,

  fetch: async () => {
    try {
      const { data } = await api.get('/api/products/wishlist/');
      const items = Array.isArray(data) ? data : (data.results || []);
      set({ ids: items.map((i) => i.product.id), loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  toggle: async (productId) => {
    const prev = get().ids;
    const isIn = prev.includes(productId);
    // Optimistic update
    set({ ids: isIn ? prev.filter((id) => id !== productId) : [...prev, productId] });
    try {
      await api.post('/api/products/wishlist/', { product_id: productId });
    } catch {
      set({ ids: prev }); // rollback
    }
  },

  isWishlisted: (productId) => get().ids.includes(productId),
  clear: () => set({ ids: [], loaded: false }),
}));

