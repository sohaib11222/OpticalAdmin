import OperationsWorkspace from './OperationsWorkspace'
import Vista from './Vista'
import { useEffect, useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import { useParams, useSearchParams } from 'react-router-dom'
import { adminApi, useAuthContext } from '@/context/useAuthContext'
import PageTitle from '@/components/PageTitle'
import { useTranslation } from '@/i18n'
import { canAccessVerifiedAccount } from '../../../../contracts/session'
import Customers from './Customers'
import Catalog from './Catalog'
import Orders, { Reporting } from './Orders'
import Documents from './Documents'
import { Agenda, Settings } from './AgendaSettings'
import { errorMessage, Pager, Status, WorkspaceContext, useWorkspaceValue, type ManagedShop } from './shared'

const modules: Record<string, { label: string; permission: string }> = {
  daily: { label: 'ops.daily', permission: 'operations.read' },
  employees: { label: 'ops.employees', permission: 'employees.read' },
  reminders: { label: 'ops.reminders', permission: 'reminders.read' },
  followups: { label: 'ops.followups', permission: 'followups.read' },
  communications: { label: 'ops.communications', permission: 'communications.read' },
  payments: { label: 'ops.payments', permission: 'payments.read' },
  activity: { label: 'ops.audit', permission: 'audit.read' },
  vista: { label: 'module.vista', permission: 'integrations.read' },
  dashboard: { label: 'module.dashboard', permission: 'reports.read' },
  customers: { label: 'module.customers', permission: 'customers.read' },
  optical: { label: 'module.optical', permission: 'optical.read' },
  agenda: { label: 'module.agenda', permission: 'agenda.read' },
  products: { label: 'module.products', permission: 'products.read' },
  inventory: { label: 'module.inventory', permission: 'stock.read' },
  orders: { label: 'module.orders', permission: 'orders.read' },
  sales: { label: 'module.sales', permission: 'reports.read' },
  documents: { label: 'module.documents', permission: 'files.read' },
  imports: { label: 'module.imports', permission: 'imports.read' },
  reports: { label: 'module.reports', permission: 'reports.read' },
  settings: { label: 'module.settings', permission: 'shop.view' },
}
export default function Workspace() {
  const { module = 'dashboard' } = useParams()
  const { user } = useAuthContext()
  const { t, tOr, translateMessage, humanize } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [shops, setShops] = useState<ManagedShop[]>([])
  const [last, setLast] = useState(1)
  const [selected, setSelected] = useState<ManagedShop | null>(null)
  const [error, setError] = useState('')
  const [id, setId] = useState(() => params.get('shop') || sessionStorage.getItem('admin-managed-shop') || '')
  const definition = modules[module]
  const requestedShop = params.get('shop')
  useEffect(() => {
    if (requestedShop) setId(requestedShop)
  }, [requestedShop])
  useEffect(() => {
    if (!canAccessVerifiedAccount(user) || !user.permissions.includes('shops.workspace')) return
    const c = new AbortController()
    void adminApi
      .request<{ data: ManagedShop[]; last_page: number }>('/admin/shops?' + new URLSearchParams({ search, page: String(page), per_page: '20' }), {
        signal: c.signal,
      })
      .then((r) => {
        setShops(r.data)
        setLast(r.last_page)
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(errorMessage(e))
      })
    return () => c.abort()
  }, [search, page, user])
  useEffect(() => {
    setSelected(null)
    setError('')
    if (!id || !canAccessVerifiedAccount(user)) return
    const c = new AbortController()
    void adminApi
      .request<{ data: ManagedShop }>('/admin/shops/' + encodeURIComponent(id) + '/workspace/shop', { signal: c.signal })
      .then((r) => setSelected(r.data))
      .catch((e) => {
        if (!c.signal.aborted) setError(errorMessage(e))
      })
    return () => c.abort()
  }, [id, user])
  if (!definition) return <Alert variant="warning">{t('platform.moduleNotFound')}</Alert>
  if (!canAccessVerifiedAccount(user)) return <Alert variant="warning">{t('platform.verifyForWorkspace')}</Alert>
  if (!user.permissions.includes('shops.workspace') || (!user.permissions.includes('shops.' + definition.permission) && !(module === 'dashboard' && user.permissions.includes('shops.operations.read'))))
    return <Alert variant="warning">{t('platform.moduleForbidden')}</Alert>
  return (
    <>
      <PageTitle title={t(definition.label)} />
      <h2>{t(definition.label)}</h2>
      <Card>
        <Card.Body>
          <Form.Label htmlFor="managed-shop">{t('common.selectShopFirst')}</Form.Label>
          <div className="d-flex gap-2">
            <Form.Control
              aria-label={t('platform.searchShopsToManage')}
              placeholder={t('common.searchPlaceholder')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
            <Form.Select
              id="managed-shop"
              value={id}
              onChange={(e) => {
                const id = e.target.value
                setId(id)
                sessionStorage.setItem('admin-managed-shop', id)
                setParams({ shop: id })
              }}>
              <option value="">{t('common.choose')}</option>
              {id && !shops.some((s) => String(s.id) === id) && (
                <option value={id}>{selected?.name || t('platform.selectedShop', { id })}</option>
              )}
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {tOr('status.' + s.status, humanize(s.status))}
                </option>
              ))}
            </Form.Select>
            <Button
              variant="outline-secondary"
              onClick={() => {
                setId('')
                setSelected(null)
                sessionStorage.removeItem('admin-managed-shop')
                setParams({})
              }}>
              {t('common.clear')}
            </Button>
          </div>
          <Pager page={page} last={last} setPage={setPage} />
          {selected && (
            <p className="mt-3 mb-0">
              <strong>{t('platform.managing', { name: selected.name })}</strong> · {t('platform.shopRef', { id: selected.id })} ·{' '}
              <Status value={selected.status} />. {t('platform.actionsRecorded')}
            </p>
          )}
          {selected && selected.status !== 'active' && (
            <Alert className="mt-3" variant="warning">
              {t('platform.readOnlyUntilActivated')}
            </Alert>
          )}
        </Card.Body>
      </Card>
      {error && <Alert variant="danger">{translateMessage(error)}</Alert>}
      {selected && <Selected key={selected.id + ':' + module} shop={selected} module={module} />}
    </>
  )
}
function Selected({ shop, module }: { shop: ManagedShop; module: string }) {
  const value = useWorkspaceValue(shop)
  return (
    <WorkspaceContext.Provider value={value}>
      {({customers:"customers",optical:"optical",agenda:"agenda",products:"products",inventory:"stock",orders:"orders",documents:"files"} as Record<string,string>)[module] && <OperationsWorkspace module={"output-" + ({customers:"customers",optical:"optical",agenda:"agenda",products:"products",inventory:"stock",orders:"orders",documents:"files"} as Record<string,string>)[module]} />}
      {module === 'dashboard' && !value.can('reports.read') ? <OperationsWorkspace module="daily" compact /> : ['daily', 'employees', 'reminders', 'followups', 'communications', 'payments', 'activity'].includes(module) ? <OperationsWorkspace module={module} /> : module === 'vista' ? (
        <Vista />
      ) : module === 'customers' ? (
        <Customers />
      ) : module === 'optical' ? (
        <Customers optical />
      ) : module === 'products' ? (
        <Catalog />
      ) : module === 'inventory' ? (
        <Catalog inventory />
      ) : module === 'orders' ? (
        <Orders />
      ) : module === 'documents' ? (
        <Documents />
      ) : module === 'imports' ? (
        <Documents importMode />
      ) : module === 'agenda' ? (
        <Agenda />
      ) : module === 'settings' ? (
        <Settings />
      ) : (
        <Reporting dashboard={module === 'dashboard'} />
      )}
    </WorkspaceContext.Provider>
  )
}
