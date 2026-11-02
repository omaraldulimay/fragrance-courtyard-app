import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { addLine, createCart, fetchCart, removeLine, updateLine, type Cart } from './api';

type CartState = {
  // Only the cart id is stored on the device; Shopify stays the source of truth for contents.
  cartId: string | null;
  cart: Cart | null;
  pending: boolean;
  error: string | null;
  add: (variantId: string, quantity?: number) => Promise<boolean>;
  setQuantity: (lineId: string, quantity: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'Unbekannter Fehler';
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => {
      async function run(action: () => Promise<Cart | null>): Promise<boolean> {
        set({ pending: true, error: null });
        try {
          const cart = await action();
          set({ cart, cartId: cart?.id ?? null, pending: false });
          return true;
        } catch (error) {
          set({ pending: false, error: message(error) });
          return false;
        }
      }

      return {
        cartId: null,
        cart: null,
        pending: false,
        error: null,

        add: (variantId, quantity = 1) =>
          run(async () => {
            const { cartId } = get();
            if (cartId) {
              try {
                return await addLine(cartId, variantId, quantity);
              } catch {
                // An expired cart is replaced by a fresh one instead of failing the purchase.
              }
            }
            return createCart(variantId, quantity);
          }),

        setQuantity: async (lineId, quantity) => {
          const { cartId } = get();
          if (!cartId) return;
          await run(() =>
            quantity > 0 ? updateLine(cartId, lineId, quantity) : removeLine(cartId, lineId),
          );
        },

        remove: async (lineId) => {
          const { cartId } = get();
          if (!cartId) return;
          await run(() => removeLine(cartId, lineId));
        },

        refresh: async () => {
          const { cartId } = get();
          if (!cartId) return;
          await run(() => fetchCart(cartId));
        },
      };
    },
    {
      name: 'cart',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ cartId: state.cartId }),
      onRehydrateStorage: () => (state) => {
        void state?.refresh();
      },
    },
  ),
);
