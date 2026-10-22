import OperationsWorkspace from './OperationsWorkspace'
import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import type { Customer, Page } from '../../../../contracts/customers'
import type { Order, Product, SalesSummary, SaleEntry } from '../../../../contracts/commerce'
import { useTranslation } from '@/i18n'
import { Editor, LoadState, Pager, Panel, RecordHistory, RecordPicker, Records, Status, options, useLoad, useWorkspace } from './shared'

/**
 * Formats a minor-unit amount the way the active language expects it. The
 * currency code is server data and stays verbatim, only the amount is localized.
 */
function amount(
  minor: number,
  currency: string,
  digits: number,
  format: (value: number, digits?: number) => string,
) {
  return currency + ' ' + format(minor / 10 ** digits, digits)
}

export default function Orders() {
  const { t, formatNumber } = useTranslation()
  const { request, can } = useWorkspace()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [params] = useSearchParams()
  const [id, setId] = useState<number | null>(() => params.get('record') ? Number(params.get('record')) : null)
  useEffect(() => { if (params.get('record')) setId(Number(params.get('record'))) }, [params])
  const [create, setCreate] = useState(false)
  const list = useLoad<Page<Order>>('/orders?' + new URLSearchParams({ page: String(page), search, status }), 5000)
  return (
    <>
      <Panel title="orders.listTitle" action={can('orders.write') && can('orders.create') && <Button onClick={() => setCreate(true)}>{t('orders.create')}</Button>}>
        <div className="d-flex gap-2 mb-3">
          <Form.Control
            aria-label={t('orders.searchAria')}
            placeholder={t('orders.searchPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <Form.Select
            aria-label={t('orders.statusFilterAria')}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}>
            <option value="">{t('orders.statusFilterAll')}</option>
            {options(['draft', 'confirmed', 'fulfilled', 'cancelled', 'reversed'], 'status').map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.label)}
              </option>
            ))}
          </Form.Select>
          <Button variant="outline-primary" onClick={() => void list.reload()}>
            {t('orders.refresh')}
          </Button>
        </div>
        <LoadState {...list} />
        <Records
          headers={['orders.headerOrder', 'orders.headerCustomer', 'orders.headerStatus', 'orders.headerTotal', 'orders.headerActions']}
          empty={!list.data?.data.length}>
          {list.data?.data.map((o) => (
            <tr key={o.id}>
              <td>{o.number}</td>
              <td>
                {o.customer.first_name} {o.customer.last_name}
              </td>
              <td>
                <Status value={o.status} />
              </td>
              <td>{amount(o.total_minor, o.currency, o.price_decimals, formatNumber)}</td>
              <td>
                <Button variant="outline-primary" size="sm" onClick={() => setId(o.id)}>
                  {t('orders.manage')}
                </Button>
              </td>
            </tr>
          ))}
        </Records>
        <Pager page={page} last={list.data?.last_page} setPage={setPage} />
      </Panel>
      {create && (
        <OrderEditor
          close={() => setCreate(false)}
          save={async (values) => {
            const r = await request<{ data: Order }>('/orders', { method: 'POST', body: JSON.stringify(values) })
            setId(r.data.id)
            await list.reload()
          }}
        />
      )}
      {id && (
        <OrderDetail
          key={id}
          id={id}
          close={() => {
            setId(null)
            void list.reload()
          }}
        />
      )}
    </>
  )
}
function OrderEditor({ order, close, save }: { order?: Order; close: () => void; save: (v: object) => Promise<void> }) {
  const { t, formatNumber } = useTranslation()
  const [customer, setCustomer] = useState<number | null>(order?.customer_id ?? null)
  const [product, setProduct] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [items, setItems] = useState<{ product_id: number; quantity: number; name?: string }[]>(
    order?.items.map((i) => ({ product_id: i.product_id, quantity: i.quantity, name: i.name })) ?? [],
  )
  const [key] = useState(crypto.randomUUID())
  return (
    <Editor
      title={order ? 'orders.editDraftTitle' : 'orders.createTitle'}
      fields={[
        {
          key: 'prescription_id',
          label: 'orders.fieldPrescriptionId',
          type: 'number',
          min: 1,
          help: 'orders.helpPrescription',
        },
        { key: 'notes', label: 'orders.fieldNotes', type: 'textarea', maxLength: 5000 },
      ]}
      initial={{ notes: order?.notes ?? '', prescription_id: order?.prescription_id ? String(order.prescription_id) : '' }}
      close={close}
      onSave={(v) =>
        save({
          customer_id: customer,
          prescription_id: v.prescription_id ? Number(v.prescription_id) : null,
          notes: v.notes || null,
          items: items.map(({ product_id, quantity }) => ({ product_id, quantity })),
          ...(order ? { version: order.version } : { creation_key: key }),
        })
      }>
      <RecordPicker<Customer>
        path="/customers?status=active"
        label="orders.pickerCustomer"
        value={customer}
        onChange={setCustomer}
        describe={(c) => c.first_name + ' ' + c.last_name}
      />
      <RecordPicker<Product>
        path="/products?status=active"
        label="orders.pickerProduct"
        value={product}
        onChange={setProduct}
        describe={(p) =>
          p.name +
          ' · ' +
          p.sku +
          ' · ' +
          amount(p.price_minor, p.currency, p.price_decimals, formatNumber) +
          ' · ' +
          t('orders.pickerAvailable', { quantity: formatNumber(p.balance.available) })
        }
      />
      <div className="d-flex gap-2 mb-3">
        <Form.Control
          aria-label={t('orders.quantityAria')}
          type="number"
          min={1}
          max={1000000}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <Button
          type="button"
          variant="outline-primary"
          disabled={!product || !Number.isInteger(quantity) || quantity < 1 || items.some((i) => i.product_id === product)}
          onClick={() => {
            setItems([...items, { product_id: product!, quantity }])
            setProduct(null)
            setQuantity(1)
          }}>
          {t('orders.addItem')}
        </Button>
      </div>
      <Records headers={['orders.headerProduct', 'orders.headerQuantity', 'orders.headerAction']} empty={!items.length}>
        {items.map((i, index) => (
          <tr key={i.product_id}>
            <td>{i.name ?? t('orders.itemFallback', { id: i.product_id })}</td>
            <td>{formatNumber(i.quantity)}</td>
            <td>
              <Button type="button" size="sm" variant="link" onClick={() => setItems(items.filter((_, n) => n !== index))}>
                {t('orders.remove')}
              </Button>
            </td>
          </tr>
        ))}
      </Records>
      <Alert variant="info">{t('orders.itemHint')}</Alert>
    </Editor>
  )
}
function OrderDetail({ id, close }: { id: number; close: () => void }) {
  const { t, tOr, formatNumber, formatDateTime } = useTranslation()
  const { request, can } = useWorkspace()
  const q = useLoad<{ data: Order }>('/orders/' + id)
  const o = q.data?.data
  const [edit, setEdit] = useState(false)
  const [action, setAction] = useState('')
  const [key, setKey] = useState(crypto.randomUUID())
  const [returnStock, setReturnStock] = useState(false)
  return (
    <Panel
      title={o ? t('orders.orderTitle', { number: o.number }) : 'orders.detailTitle'}
      action={
        <Button variant="link" onClick={close}>
          {t('orders.closeOrder')}
        </Button>
      }>
      <LoadState {...q} />
      {o && (
        <>
          <p>
            {o.customer.first_name} {o.customer.last_name} · <Status value={o.status} /> ·{' '}
            {amount(o.total_minor, o.currency, o.price_decimals, formatNumber)}
          </p>
          <p>{o.notes}</p>
          {o.prescription_id && <p>{t('orders.prescriptionRef', { id: o.prescription_id })}</p>}
          <Records headers={['orders.headerSkuProduct', 'orders.headerQuantity', 'orders.headerUnitPrice', 'orders.headerTotal']}>
            {o.items.map((i) => (
              <tr key={i.id}>
                <td>
                  {i.sku} · {i.name}
                  <small className="d-block">
                    {i.brand} / {i.model} / {i.color}
                  </small>
                </td>
                <td>{formatNumber(i.quantity)}</td>
                <td>{amount(i.unit_price_minor, o.currency, o.price_decimals, formatNumber)}</td>
                <td>{amount(i.total_minor, o.currency, o.price_decimals, formatNumber)}</td>
              </tr>
            ))}
          </Records>
          <div className="d-flex gap-2 mb-3">
            {o.status === 'draft' && can('orders.write') && can('orders.edit') && (
              <Button variant="outline-primary" onClick={() => setEdit(true)}>
                {t('orders.editDraft')}
              </Button>
            )}
            {(o.status === 'draft'
              ? ['confirm', 'cancel']
              : o.status === 'confirmed'
                ? ['fulfil', 'cancel']
                : o.status === 'fulfilled'
                  ? ['reverse']
                  : []
            )
              .filter((a) => (a === 'confirm' ? can('orders.edit') : a === 'cancel' ? can('orders.archive') : true) && can(a === 'fulfil' ? 'orders.fulfil' : a === 'reverse' ? 'sales.reverse' : 'orders.write'))
              .map((a) => (
                <Button
                  key={a}
                  variant={['reverse', 'cancel'].includes(a) ? 'outline-danger' : 'primary'}
                  onClick={() => {
                    setKey(crypto.randomUUID())
                    setReturnStock(false)
                    setAction(a)
                  }}>
                  {a === 'reverse'
                    ? t('orders.actionReverse')
                    : a === 'fulfil'
                      ? t('orders.actionFulfil')
                      : a === 'confirm'
                        ? t('orders.actionConfirm')
                        : t('orders.actionCancel')}
                </Button>
              ))}
          </div>
          <h5>{t('orders.salesLedger')}</h5>
          <Records
            headers={['orders.headerEntry', 'orders.headerAmount', 'orders.headerStockReturned', 'orders.headerReasonActor']}
            empty={!o.sales.length}>
            {o.sales.map((s) => (
              <tr key={s.id}>
                <td>
                  {tOr('orders.entryKind.' + s.kind, s.kind)}
                  <small className="d-block">{formatDateTime(s.created_at)}</small>
                </td>
                <td>{amount(s.amount_minor, s.currency, s.price_decimals, formatNumber)}</td>
                <td>{s.stock_returned ? t('orders.yes') : t('orders.no')}</td>
                <td>
                  {s.reason}
                  <small className="d-block">{s.actor?.name}</small>
                </td>
              </tr>
            ))}
          </Records>
          <RecordHistory path={'/orders/' + id + '/history'} />
          {edit && (
            <OrderEditor
              order={o}
              close={() => setEdit(false)}
              save={async (v) => {
                await request('/orders/' + id, { method: 'PATCH', body: JSON.stringify(v) })
                await q.reload()
              }}
            />
          )}
          {action && (
            <Editor
              title={
                action === 'reverse'
                  ? t('orders.actionTitleReverse')
                  : action === 'confirm'
                    ? t('orders.actionTitleConfirm')
                    : action === 'fulfil'
                      ? t('orders.actionTitleFulfil')
                      : t('orders.actionTitleCancel')
              }
              fields={
                ['reverse', 'cancel'].includes(action) ? [{ key: 'reason', label: 'orders.fieldReason', type: 'textarea', required: true, maxLength: 2000 }] : []
              }
              help={action === 'reverse' ? 'orders.helpReverse' : 'orders.helpAction'}
              close={() => setAction('')}
              onSave={async (v) => {
                await request('/orders/' + id + '/' + action, {
                  method: 'POST',
                  body: JSON.stringify({
                    version: o.version,
                    creation_key: key,
                    reason: v.reason,
                    ...(action === 'reverse' ? { return_stock: returnStock } : {}),
                  }),
                })
                await q.reload()
              }}>
              {action === 'reverse' && (
                <Form.Check
                  label={t('orders.returnStock')}
                  checked={returnStock}
                  onChange={(e) => setReturnStock(e.target.checked)}
                />
              )}
            </Editor>
          )}
        </>
      )}
    </Panel>
  )
}

type Report = { summary: SalesSummary[]; entries: Page<SaleEntry>; period: { timezone: string } }
type Dashboard = {
  summary: SalesSummary[]
  counts: Record<string, number>
  daily: { date: string; sales_minor: number; reversals_minor: number; net_minor: number }[]
  currency: string
  price_decimals: number
  trend_available: boolean
}
export function Reporting({ dashboard = false }: { dashboard?: boolean }) {
  const { t, tOr, humanize, formatNumber, formatDateTime } = useTranslation()
  const { prefix, can } = useWorkspace()
  const today = new Date().toISOString().slice(0, 10)
  const [from, setFrom] = useState(today.slice(0, 7) + '-01')
  const [to, setTo] = useState(today)
  const [kind, setKind] = useState('')
  const [page, setPage] = useState(1)
  const [params] = useSearchParams()
  const [id, setId] = useState<number | null>(() => params.get('record') ? Number(params.get('record')) : null)
  useEffect(() => { if (params.get('record')) setId(Number(params.get('record'))) }, [params])
  const query = new URLSearchParams({ from, to, kind, page: String(page) })
  const q = useLoad<Report>('/reports/sales?' + query)
  const dash = useLoad<Dashboard>(dashboard ? '/dashboard?' + query : null)
  return (
    <>
      <Panel
        title={dashboard ? 'orders.dashboardTitle' : 'orders.reportTitle'}
        action={
          can('reports.export') && (
            <a className="btn btn-outline-primary" href={'/api/v1' + prefix + '/reports/sales/export?' + query}>
              {t('orders.exportCsv')}
            </a>
          )
        }>
        <div className="row mb-3">
          <Form.Group className="col-md-4" controlId="report-from">
            <Form.Label>{t('orders.fromDate')}</Form.Label>
            <Form.Control
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value)
                setPage(1)
              }}
            />
          </Form.Group>
          <Form.Group className="col-md-4" controlId="report-to">
            <Form.Label>{t('orders.toDate')}</Form.Label>
            <Form.Control
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value)
                setPage(1)
              }}
            />
          </Form.Group>
          <Form.Group className="col-md-4" controlId="report-kind">
            <Form.Label>{t('orders.entryKind')}</Form.Label>
            <Form.Select
              value={kind}
              onChange={(e) => {
                setKind(e.target.value)
                setPage(1)
              }}>
              <option value="">{t('orders.kindAll')}</option>
              <option value="sale">{t('orders.kindSale')}</option>
              <option value="reversal">{t('orders.kindReversal')}</option>
            </Form.Select>
          </Form.Group>
        </div>
        <LoadState {...q} />
        {dashboard && <LoadState {...dash} />}
        <p>{t('orders.ledgerNote', { timezone: q.data?.period.timezone ?? '' })}</p>
        <div className="row">
          {q.data?.summary.map((s) => (
            <div className="col-md-4" key={s.currency}>
              <h5>{s.currency}</h5>
              <p>
                {t('orders.summarySales', { amount: amount(s.sales_minor, s.currency, s.price_decimals, formatNumber) })}
                <br />
                {t('orders.summaryReversals', { amount: amount(s.reversals_minor, s.currency, s.price_decimals, formatNumber) })}
                <br />
                <strong>{t('orders.summaryNet', { amount: amount(s.net_minor, s.currency, s.price_decimals, formatNumber) })}</strong>
              </p>
            </div>
          ))}
        </div>
        {dashboard && (
          <div className="row">
            {Object.entries(dash.data?.counts ?? {}).map(([k, v]) => (
              <div key={k} className="col-md-3 border rounded p-3 mb-3">
                <span className="text-muted text-capitalize">{tOr('orders.count.' + k, humanize(k))}</span>
                <h3>{formatNumber(v)}</h3>
              </div>
            ))}
          </div>
        )}
        {dashboard && can("operations.read") && <OperationsWorkspace module="daily" compact />}
        <Records
          headers={['orders.headerPosted', 'orders.headerOrder', 'orders.headerKind', 'orders.headerAmount', 'orders.headerReasonActor']}
          empty={!q.data?.entries.data.length}>
          {q.data?.entries.data.map((e) => (
            <tr key={e.id}>
              <td>{formatDateTime(e.created_at)}</td>
              <td>
                <Button size="sm" variant="link" onClick={() => setId(e.order_id)}>
                  {e.order?.number ?? e.order_id}
                </Button>
              </td>
              <td>{tOr('orders.entryKind.' + e.kind, e.kind)}</td>
              <td>{amount(e.kind === 'reversal' ? -e.amount_minor : e.amount_minor, e.currency, e.price_decimals, formatNumber)}</td>
              <td>
                {e.actor?.name}
                <small className="d-block">{e.reason}</small>
              </td>
            </tr>
          ))}
        </Records>
        <Pager page={page} last={q.data?.entries.last_page} setPage={setPage} />
      </Panel>
      {id && (
        <OrderDetail
          key={id}
          id={id}
          close={() => {
            setId(null)
            void q.reload()
            if (dashboard) void dash.reload()
          }}
        />
      )}
    </>
  )
}
