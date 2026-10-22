import type { MenuItemType } from '@/types/menu'
import type { TranslateFn } from '@/i18n'

/**
 * `label` holds a dictionary key rather than literal text, so the sidebar can
 * re-render in the active language without rebuilding this list.
 */
const MENU_ITEMS: MenuItemType[] = [
  {"key": "dashboard", "label": "menu.dashboard", "icon": "bx:home-alt", "url": "/workspace/dashboard"},
  {"key": "group-customers", "label": "ops.nav.customers", "isTitle": true},
  {"key": "customers", "label": "menu.customers", "icon": "bx:user", "url": "/workspace/customers"},
  {"key": "optical", "label": "menu.optical", "icon": "bx:glasses", "url": "/workspace/optical"},
  {"key": "agenda", "label": "menu.agenda", "icon": "bx:calendar", "url": "/workspace/agenda"},
  {"key": "reminders", "label": "ops.reminders", "icon": "bx:bell", "url": "/workspace/reminders"},
  {"key": "followups", "label": "ops.followups", "icon": "bx:repeat", "url": "/workspace/followups"},
  {"key": "communications", "label": "ops.communications", "icon": "bx:message", "url": "/workspace/communications"},
  {"key": "group-commerce", "label": "ops.nav.commerce", "isTitle": true},
  {"key": "products", "label": "menu.products", "icon": "bx:package", "url": "/workspace/products"},
  {"key": "inventory", "label": "menu.inventory", "icon": "bx:layer", "url": "/workspace/inventory"},
  {"key": "orders", "label": "menu.orders", "icon": "bx:cart", "url": "/workspace/orders"},
  {"key": "sales", "label": "menu.sales", "icon": "bx:receipt", "url": "/workspace/sales"},
  {"key": "payments", "label": "ops.payments", "icon": "bx:wallet", "url": "/workspace/payments"},
  {"key": "reports", "label": "menu.reports", "icon": "bx:bar-chart", "url": "/workspace/reports"},
  {"key": "vista", "label": "menu.vista", "icon": "bx:link", "url": "/workspace/vista"},
  {"key": "group-records", "label": "ops.nav.records", "isTitle": true},
  {"key": "documents", "label": "menu.documents", "icon": "bx:file", "url": "/workspace/documents"},
  {"key": "imports", "label": "menu.imports", "icon": "bx:import", "url": "/workspace/imports"},
  {"key": "activity", "label": "ops.audit", "icon": "bx:history", "url": "/workspace/activity"},
  {"key": "group-admin", "label": "ops.nav.admin", "isTitle": true},
  {"key": "shops", "label": "menu.shops", "icon": "bx:store", "url": "/"},
  {"key": "employees", "label": "ops.employees", "icon": "bx:group", "url": "/workspace/employees"},
  {"key": "settings", "label": "menu.settings", "icon": "bx:cog", "url": "/workspace/settings"},
  {"key": "operations", "label": "menu.operations", "icon": "bx:analyse", "url": "/operations"},
  {"key": "security", "label": "menu.security", "icon": "bx:shield", "url": "/account/security"},
]

/**
 * Resolves the menu for the active language. The caller supplies `t` because
 * this module is a plain helper and cannot read the translation context.
 */
export const getMenuItems = (t?: TranslateFn): MenuItemType[] => {
  return t ? MENU_ITEMS.map((item) => ({ ...item, label: t(item.label) })) : MENU_ITEMS
}

export const findAllParent = (menuItems: MenuItemType[], menuItem: MenuItemType): string[] => {
  let parents: string[] = []
  const parent = findMenuItem(menuItems, menuItem.parentKey)
  if (parent) {
    parents.push(parent.key)
    if (parent.parentKey) {
      parents = [...parents, ...findAllParent(menuItems, parent)]
    }
  }
  return parents
}

export const getMenuItemFromURL = (items: MenuItemType | MenuItemType[], url: string): MenuItemType | undefined => {
  if (items instanceof Array) {
    for (const item of items) {
      const foundItem = getMenuItemFromURL(item, url)
      if (foundItem) {
        return foundItem
      }
    }
  } else {
    if (items.url == url) return items
    if (items.children != null) {
      for (const item of items.children) {
        if (item.url == url) return item
      }
    }
  }
}

export const findMenuItem = (menuItems: MenuItemType[] | undefined, menuItemKey: MenuItemType['key'] | undefined): MenuItemType | null => {
  if (menuItems && menuItemKey) {
    for (const item of menuItems) {
      if (item.key === menuItemKey) {
        return item
      }
      const found = findMenuItem(item.children, menuItemKey)
      if (found) return found
    }
  }
  return null
}
