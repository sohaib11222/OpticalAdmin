import { lazy, Suspense } from 'react'

import FallbackLoading from '@/components/FallbackLoading'
import LogoBox from '@/components/LogoBox'
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient'
import { useAuthContext } from '@/context/useAuthContext'
import { getMenuItems } from '@/helpers/menu'
import { useTranslation } from '@/i18n'
import HoverMenuToggle from './components/HoverMenuToggle'

const AppMenu = lazy(() => import('./components/AppMenu'))

const VerticalNavigationBar = () => {
  const { user } = useAuthContext()
  const { t } = useTranslation()
  const permissions: Record<string, string> = {
    daily: 'operations.read', employees: 'employees.read', reminders: 'reminders.read', followups: 'followups.read', communications: 'communications.read', payments: 'payments.read', activity: 'audit.read',
    dashboard: 'reports.read',
    customers: 'customers.read',
    optical: 'optical.read',
    agenda: 'agenda.read',
    products: 'products.read',
    inventory: 'stock.read',
    orders: 'orders.read',
    sales: 'reports.read',
    documents: 'files.read',
    imports: 'imports.read',
    reports: 'reports.read',
    settings: 'shop.view',
    vista: 'integrations.read',
  }
  const menuItems = getMenuItems(t).filter(
    (item) =>
      (item.key === 'dashboard' && user?.permissions.includes('shops.workspace') && user.permissions.includes('shops.operations.read')) || !permissions[item.key] || (user?.permissions.includes('shops.workspace') && user.permissions.includes('shops.' + permissions[item.key])),
  ).filter((item, i, items) => !item.isTitle || items.slice(i + 1, items.findIndex((next, n) => n > i && !!next.isTitle) === -1 ? undefined : items.findIndex((next, n) => n > i && !!next.isTitle)).some(next => !next.isTitle))

  return (
    <div className="main-nav" id="leftside-menu-container">
      <LogoBox containerClassName="logo-box" squareLogo={{ className: 'logo-sm' }} textLogo={{ className: 'logo-lg' }} />

      <HoverMenuToggle />

      <SimplebarReactClient className="scrollbar">
        <Suspense fallback={<FallbackLoading />}>
          <AppMenu menuItems={menuItems} />
        </Suspense>
      </SimplebarReactClient>
    </div>
  )
}

export default VerticalNavigationBar
