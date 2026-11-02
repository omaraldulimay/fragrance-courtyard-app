import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type WishlistState = {
  handles: string[];
  toggle: (handle: string) => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set) => ({
      handles: [],
      toggle: (handle) =>
        set((state) => ({
          handles: state.handles.includes(handle)
            ? state.handles.filter((existing) => existing !== handle)
            : [handle, ...state.handles],
        })),
    }),
    { name: 'wishlist', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export function useIsWished(handle: string): boolean {
  return useWishlist((state) => state.handles.includes(handle));
}
