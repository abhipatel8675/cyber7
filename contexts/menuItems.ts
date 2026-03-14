import { Role } from './AuthContext';

export interface MenuItem {
  id: number;
  title: string;
  icon: string;
  iconType: string;
  /** If true, only visible to admin. Otherwise visible to both user and admin. */
  adminOnly?: boolean;
}

export const ALL_MENU_ITEMS: MenuItem[] = [
  { id: 1, title: 'Dashboard', icon: 'dashboard', iconType: 'MaterialIcons' },
  { id: 2, title: 'Alerts', icon: 'notifications', iconType: 'MaterialIcons' },
  { id: 3, title: 'Clients', icon: 'people', iconType: 'MaterialIcons', adminOnly: true },
  { id: 4, title: 'Contacts', icon: 'contacts', iconType: 'MaterialIcons', adminOnly: true },
  { id: 5, title: 'Notifications', icon: 'bell', iconType: 'MaterialIcons' },
  { id: 6, title: 'Settings', icon: 'settings', iconType: 'MaterialIcons', adminOnly: true },
];

export function getMenuItemsForRole(role: Role): MenuItem[] {
  return role === 'admin'
    ? ALL_MENU_ITEMS
    : ALL_MENU_ITEMS.filter((item) => !item.adminOnly);
}

export function canAccessMenu(title: string, role: Role): boolean {
  const items = getMenuItemsForRole(role);
  return items.some((item) => item.title === title);
}
