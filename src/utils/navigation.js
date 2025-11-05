import { sidebarNav } from '@/data/nav';

// Get all navigation items flattened
export function getAllNavItems() {
  const items = [];
  
  sidebarNav.forEach(navItem => {
    if (navItem.isStandalone) {
      items.push(navItem);
    } else if (navItem.items) {
      items.push(...navItem.items);
    }
  });
  
  return items;
}

// Find navigation item by href
export function findNavItem(href) {
  const allItems = getAllNavItems();
  return allItems.find(item => item.href === href);
}

// Get navigation item by label
export function findNavItemByLabel(label) {
  const allItems = getAllNavItems();
  return allItems.find(item => item.label.toLowerCase().includes(label.toLowerCase()));
}

// Get quick action items for dashboard
export function getQuickActions() {
  return [
    findNavItemByLabel('Blog Posts'),
    findNavItemByLabel('Categories'),
    findNavItemByLabel('Settings')
  ].filter(Boolean);
}