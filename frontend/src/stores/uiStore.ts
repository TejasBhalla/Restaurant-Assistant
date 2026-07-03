import { create } from "zustand"

interface UIStore {
  loading: boolean
  sidebarOpen: boolean
  darkMode: boolean
  setLoading: (loading: boolean) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleDarkMode: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  loading: false,
  sidebarOpen: false,
  darkMode: false,
  setLoading: (loading) => set({ loading }),
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleDarkMode: () =>
    set((state) => ({ darkMode: !state.darkMode })),
}))
