import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useCartStore = create((set) => ({
  cart: null,
  items: [],
  totalPrice: 0,
  totalItems: 0,
  setCart: (cart) => set({ 
    cart, 
    items: cart.items || [], 
    totalPrice: cart.total_price || 0,
    totalItems: cart.total_items || 0 
  }),
  clearCart: () => set({ cart: null, items: [], totalPrice: 0, totalItems: 0 }),
}));
