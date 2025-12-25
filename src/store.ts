
import { create } from 'zustand';
import type { User, Notification } from './types'
import { supabase } from '@/lib/supabaseClient';

interface UserSettings {
  reducedMotion: boolean;
  compactMode: boolean;
  emailSecurity: boolean;
  emailTickets: boolean;
  emailMarketing: boolean;
  pushMentions: boolean;
  pushReminders: boolean;
  twoFactor: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  reducedMotion: false,
  compactMode: false,
  emailSecurity: true,
  emailTickets: true,
  emailMarketing: false,
  pushMentions: true,
  pushReminders: true,
  twoFactor: false,
};

interface AppState {
  // Sidebar State
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Session State
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  fetchUser: () => Promise<void>;

  // Settings State
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;

  // Theme State
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // CLI Modal State
  isCliOpen: boolean;
  isCliMinimized: boolean;
  toggleCli: () => void;
  setIsCliMinimized: (minimized: boolean) => void;

  // Monitor Drawer State
  isMonitorOpen: boolean;
  toggleMonitor: () => void;

  // Global Search State
  isSearchOpen: boolean;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;

  // AI Chat State
  isAIChatOpen: boolean;
  toggleAIChat: () => void;

  // Global Modals
  isCreateTicketModalOpen: boolean;
  toggleCreateTicketModal: () => void;
  setCreateTicketModalOpen: (open: boolean) => void;

  // Notification State
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarCollapsed: true, // Default to collapsed as requested
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  user: null, // Start with null to allow fetching

  login: (user) => set({ user }),
  logout: () => set({ user: null }),
  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),
  fetchUser: async () => {
    try {
      // Fetch the first user from the 'users' table to simulate the current session
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        set({
          user: {
            id: String(data.id),
            name: data.full_name || data.username || 'System User',
            username: data.username || 'system',
            // email: data.username || 'user@system.com', // Removed as it's not in User type
            password: data.password || 'password',
            role: data.role || 'noc',
            // avatarUrl: data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name || data.username)}&background=random`,
            // coordinates: { lat: 40.7128, lng: -74.0060 }
          }
        });
      }
    } catch (err) {
      console.error("Failed to fetch user from Supabase:", err);
    }
  },

  settings: DEFAULT_SETTINGS,
  updateSettings: (updates) => set((state) => ({
    settings: { ...state.settings, ...updates }
  })),

  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  isCliOpen: false,
  isCliMinimized: false,
  // When toggling, if we are opening, ensure we aren't minimized
  toggleCli: () => set((state) => ({
    isCliOpen: !state.isCliOpen,
    isCliMinimized: !state.isCliOpen ? false : state.isCliMinimized
  })),
  setIsCliMinimized: (minimized) => set({ isCliMinimized: minimized }),

  isMonitorOpen: false,
  toggleMonitor: () => set((state) => ({ isMonitorOpen: !state.isMonitorOpen })),

  isSearchOpen: false,
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  setSearchOpen: (open) => set({ isSearchOpen: open }),

  isAIChatOpen: false,
  toggleAIChat: () => set((state) => ({ isAIChatOpen: !state.isAIChatOpen })),

  isCreateTicketModalOpen: false,
  toggleCreateTicketModal: () => set((state) => ({ isCreateTicketModalOpen: !state.isCreateTicketModalOpen })),
  setCreateTicketModalOpen: (open) => set({ isCreateTicketModalOpen: open }),

  // Notification Implementation - Updated to match screenshot data
  notifications: [
    { id: 'n1', title: 'System Update', message: 'Nexus Dashboard v2.0 is live! Check out the new dark mode.', type: 'success', timestamp: new Date().toISOString(), read: false },
    { id: 'n2', title: 'High Latency Alert', message: 'Switch Floor 2 is reporting 150ms latency. Investigate immediately.', type: 'error', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false, link: '/monitor' },
    { id: 'n3', title: 'New Ticket Assigned', message: 'Ticket #T-2045 has been assigned to you.', type: 'info', timestamp: new Date(Date.now() - 7200000).toISOString(), read: true, link: '/tickets' },
    { id: 'n4', title: 'Backup Completed', message: 'Daily database backup finished successfully.', type: 'success', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true }
  ],
  addNotification: (n) => set((state) => ({
    notifications: [{ ...n, id: `n-${Date.now()}`, timestamp: new Date().toISOString(), read: false }, ...state.notifications]
  })),
  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  markAllNotificationsAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
  clearNotifications: () => set({ notifications: [] }),
}));