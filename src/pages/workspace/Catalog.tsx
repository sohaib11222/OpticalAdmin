import OperationsWorkspace from "./OperationsWorkspace"
import { useSearchParams } from 'react-router-dom'
import { VistaProduct } from './Vista'
import { useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import type { Category, Product, ProductImage, StockBalance, StockMovement } from '../../../../contracts/commerce'
import { decimal } from '../../../../contracts/commerce'
import type { Page } from '../../../../contracts/customers'
import { useTranslation } from '@/i18n'
import {
  Editor,
  LoadState,
  Pager,
  Panel,
  Records,
  RecordPicker,
  Status,
  errorMessage,
  nullable,
  options,
  toValues,
  useLoad,
  useWorkspace,
  type Field,
} from './shared'

/** Field definitions carry dictionary keys, never literal text: `FieldInputs` translates them. */
const productFields: Field[] = [
  { key: 'name', label: 'catalog.fieldProductName', required: true, maxLength: 200 },
  { key: 'sku', label: 'catalog.fieldSku', help: 'ops.variant.skuHelp', maxLength: 80 },
  { key: 'brand', label: 'catalog.fieldBrand', required: true, maxLength: 100 },
  { key: 'model', label: 'catalog.fieldModel', required: true, maxLength: 100 },
  { key: 'color', label: 'catalog.fieldColor', required: true, maxLength: 80 },
  { key: 'price', label: 'catalog.fieldPrice', required: true, help: 'catalog.fieldPriceHelp' },
  { key: 'low_stock_threshold', label: 'catalog.fieldLowStockThreshold', type: 'number', required: true, min: 0, max: 1000000 },
  { key: 'description', label: 'catalog.fieldDescription', type: 'textarea', maxLength: 10000 },
]
/**
 * Formats a price the way the active language expects it. The currency code is
 * server data and stays verbatim, only the amount is localized.
 */
function price(p: { price_minor: number; currency: string; price_decimals: number }, format: (value: number, digits?: number) => string) {
  return p.currency + ' ' + format(p.price_minor / 10 ** p.price_decimals, p.price_decimals)
}
export default function Catalog({ inventory = false }: { inventory?: boolean }) {
  const { t, formatNumber } = useTranslation()
  const { request, can } = useWorkspace()
  const [params] = useSearchParams()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [edit, setEdit] = useState<Product | 'new' | null>(null)
  const [category, setCategory] = useState<number | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  useEffect(() => {
    const record = params.get('record')
    setSelected(record && /^\d+$/.test(record) ? Number(record) : null)
  }, [params])
  const [key, setKey] = useState(crypto.randomUUID())
  const [categories, setCategories] = useState(false)
  const list = useLoad<Page<Product>>(inventory ? null : '/products?' + new URLSearchParams({ page: String(page), search, status }))
  const stock = useLoad<Page<StockBalance>>(
    inventory ? '/inventory?' + new URLSearchParams({ page: String(page), search, low: params.get('low') ?? '' }) : null,
  )
  return (
    <>
      <Panel
        title={inventory ? 'catalog.inventoryTitle' : 'catalog.productsTitle'}
        action={
          can('products.write') && (
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={() => setCategories(!categories)}>
                {t('catalog.categories')}
              </Button>
              {can('products.create') && (
                <Button
                  onClick={() => {
                    setCategory(null)
                    setKey(crypto.randomUUID())
                    setEdit('new')
                  }}>
                  {t('catalog.addProduct')}
                </Button>
              )}
            </div>
          )
        }>
        <div className="d-flex gap-2 mb-3">
          <Form.Control
            placeholder={t('catalog.searchPlaceholder')}
            aria-label={t('catalog.searchProducts')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          {!inventory && (
            <Form.Select
              aria-label={t('catalog.productStatus')}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}>
              <option value="">{t('catalog.allStatuses')}</option>
              {options(['draft', 'active', 'archived'], 'status').map((o) => (
                <option key={o.value} value={o.value}>
                  {t(o.label)}
                </option>
              ))}
            </Form.Select>
          )}
          <Button variant="outline-primary" onClick={() => void (inventory ? stock : list).reload()}>
            {t('catalog.refresh')}
          </Button>
        </div>
        <LoadState {...(inventory ? stock : list)} />
        <Records
          headers={['catalog.thProduct', 'catalog.thCategory', 'catalog.thPrice', 'catalog.thStock', 'catalog.thStatus', 'catalog.thActions']}
          empty={inventory ? !stock.data?.data.length : !list.data?.data.length}>
          {(inventory ? stock.data?.data.map((s) => ({ ...s.product!, balance: s })) : list.data?.data)?.map((p) => (
            <tr key={p.id}>
              <td>
                {p.name}
                <small className="d-block">{p.sku}</small>
              </td>
              <td>
                {p.category?.name}
                <small className="d-block">
                  {p.brand} · {p.model} · {p.color}
                  {p.parent_product_id && <> · {t("ops.variant.variation")} · {Object.values(p.variation_attributes ?? {}).join(" / ")}</>}
                </small>
              </td>
              <td>{price(p, formatNumber)}</td>
              <td>
                {formatNumber(p.balance?.on_hand ?? 0)} / {formatNumber(p.balance?.reserved ?? 0)} / {formatNumber(p.balance?.available ?? 0)}
              </td>
              <td>
                <Status value={p.status} />
              </td>
              <td>
                <Button variant="outline-primary" size="sm" onClick={() => setSelected(p.id)}>
                  {t('catalog.details')}
                </Button>
                {can('products.write') && can('products.edit') && (
                  <Button
                    size="sm"
                    variant="link"
                    onClick={() => {
                      setCategory(p.category_id)
                      setEdit(p)
                    }}>
                    {t('catalog.edit')}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </Records>
        <Pager page={page} last={(inventory ? stock : list).data?.last_page} setPage={setPage} />
      </Panel>
      {edit && (
        <Editor
          title={edit === 'new' ? 'catalog.createProduct' : 'catalog.editProduct'}
          fields={[
            ...productFields,
            ...(edit === 'new'
              ? [{ key: 'initial_quantity', label: 'catalog.fieldInitialQuantity', type: 'number', required: true, min: 0, max: 1000000 }]
              : []),
          ]}
          initial={
            edit === 'new'
              ? { low_stock_threshold: '0', initial_quantity: '0' }
              : { ...toValues(edit), price: decimal(edit.price_minor, edit.price_decimals) }
          }
          close={() => setEdit(null)}
          onSave={async (v) => {
            const payload = Object.fromEntries(productFields.map((f) => [f.key, v[f.key] || null]))
            const r = await request<{ data: Product }>('/products' + (edit === 'new' ? '' : '/' + edit.id), {
              method: edit === 'new' ? 'POST' : 'PATCH',
              body: JSON.stringify({
                ...payload,
                category_id: category,
                low_stock_threshold: Number(v.low_stock_threshold),
                ...(edit === 'new' ? { initial_quantity: Number(v.initial_quantity), creation_key: key } : { version: edit.version }),
              }),
            })
            setSelected(r.data.id)
            await list.reload()
            if (inventory) await stock.reload()
          }}>
          <RecordPicker<Category>
            path="/product-categories?status=active"
            label="catalog.pickerCategory"
            value={category}
            onChange={setCategory}
            describe={(c) => c.name}
          />
        </Editor>
      )}
      {categories && <Categories />}
      {selected && (
        <ProductDetail
          key={selected}
          id={selected}
          close={() => {
            setSelected(null)
            void list.reload()
            if (inventory) void stock.reload()
          }}
        />
      )}
    </>
  )
}
function Categories() {
  const { t } = useTranslation()
  const { request, can } = useWorkspace()
  const [page, setPage] = useState(1)
  const [edit, setEdit] = useState<Category | 'new' | null>(null)
  const q = useLoad<Page<Category>>('/product-categories?page=' + page)
  return (
    <Panel title="catalog.categoriesTitle">
      <LoadState {...q} />
      {can('products.write') && can('products.create') && (
        <Button className="mb-3" onClick={() => setEdit('new')}>
          {t('catalog.newCategory')}
        </Button>
      )}
      <Records headers={['catalog.thName', 'catalog.thDescription', 'catalog.thStatus', 'catalog.thActions']} empty={!q.data?.data.length}>
        {q.data?.data.map((c) => (
          <tr key={c.id}>
            <td>{c.name}</td>
            <td>{c.description}</td>
            <td>
              <Status value={c.status} />
            </td>
            <td>
              {can('products.write') && can('products.edit') && (
                <Button size="sm" variant="link" onClick={() => setEdit(c)}>
                  {t('catalog.edit')}
                </Button>
              )}
            </td>
          </tr>
        ))}
      </Records>
      <Pager page={page} last={q.data?.last_page} setPage={setPage} />
      {edit && (
        <Editor
          title="catalog.categoryTitle"
          initial={edit === 'new' ? { status: 'active' } : toValues(edit)}
          fields={[
            { key: 'name', label: 'catalog.fieldName', required: true, maxLength: 100 },
            {
              key: 'status',
              label: 'catalog.fieldStatus',
              required: true,
              options: options(can('products.archive') ? ['active', 'archived'] : ['active'], 'status'),
            },
            { key: 'description', label: 'catalog.fieldDescription', type: 'textarea', maxLength: 2000 },
          ]}
          close={() => setEdit(null)}
          onSave={async (v) => {
            await request('/product-categories' + (edit === 'new' ? '' : '/' + edit.id), {
              method: edit === 'new' ? 'POST' : 'PATCH',
              body: JSON.stringify({ ...nullable(v), ...(edit === 'new' ? {} : { version: edit.version }) }),
            })
            await q.reload()
          }}
        />
      )}
    </Panel>
  )
}

function ProductDetail({ id, close }: { id: number; close: () => void }) {
  const { t, translateMessage, formatNumber } = useTranslation()
  const { request, prefix, can } = useWorkspace()
  const q = useLoad<{ data: Product }>('/products/' + id, 5000)
  const p = q.data?.data
  const [action, setAction] = useState<'status' | 'stock' | null>(null)
  const [key, setKey] = useState(crypto.randomUUID())
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const processing = useLoad<{ data: { message: string; worker_active: boolean } }>('/uploads/processing', 15000)
  async function imageAction(i: ProductImage, action: 'retry' | 'archive' | 'primary') {
    setBusy(true)
    setError('')
    try {
      await request('/catalog-images/' + i.id + (action === 'retry' ? '/retry' : ''), {
        method: action === 'retry' ? 'POST' : 'PATCH',
        body: JSON.stringify(action === 'retry' ? {} : { action, version: p?.version }),
      })
      await q.reload()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <Panel
      title={p ? p.name + ' · ' + p.sku : 'catalog.productDetails'}
      action={
        <Button variant="link" onClick={close}>
          {t('catalog.closeDetails')}
        </Button>
      }>
      <LoadState {...q} />
      {error && <Alert variant="danger">{translateMessage(error)}</Alert>}
      {p && (
        <>
          <OperationsWorkspace module="variations" product={p} />
          <p>{p.description}</p>
          <p>
            {price(p, formatNumber)} · {p.brand} / {p.model} / {p.color} · <Status value={p.status} />
          </p>
          <p>
            {t('catalog.stockSummary', {
              onHand: formatNumber(p.balance.on_hand),
              reserved: formatNumber(p.balance.reserved),
              available: formatNumber(p.balance.available),
            })}
          </p>
          <div className="d-flex gap-2 mb-3">
            {can('products.write') && can('products.archive') && (
              <Button variant="outline-primary" onClick={() => setAction('status')}>
                {t('catalog.changeStatus')}
              </Button>
            )}
            {can('stock.write') && can('stock.create') && (
              <Button
                onClick={() => {
                  setKey(crypto.randomUUID())
                  setAction('stock')
                }}>
                {t('catalog.receiveStock')}
              </Button>
            )}
          </div>
          <Alert variant={processing.data?.data.worker_active ? 'info' : 'warning'}>
            {processing.data?.data.message || t('catalog.uploadsNotice')}
          </Alert>
          <div className="row">
            {p.images?.map((i) => (
              <div key={i.id} className="col-md-4 mb-3 border rounded p-3">
                {i.scan_status === 'clean' && !i.archived_at && (
                  <img src={'/api/v1' + prefix + '/catalog-images/' + i.id} alt={i.filename} className="img-fluid mb-2" style={{ maxHeight: 180 }} />
                )}
                <p>
                  {i.filename} · <Status value={i.archived_at ? 'archived' : i.scan_status} />
                  {p.primary_image_id === i.id ? ' · ' + t('catalog.primaryImage') : ''}
                </p>
                {can('products.write') && !i.archived_at && (
                  <div className="d-flex gap-2 flex-wrap">
                    {can('products.edit') && ['pending', 'failed'].includes(i.scan_status) && (
                      <Button size="sm" disabled={busy} onClick={() => void imageAction(i, 'retry')}>
                        {t('catalog.retryProcessing')}
                      </Button>
                    )}
                    {can('products.edit') && i.scan_status === 'clean' && p.primary_image_id !== i.id && (
                      <Button size="sm" disabled={busy} onClick={() => void imageAction(i, 'primary')}>
                        {t('catalog.setPrimary')}
                      </Button>
                    )}
                    {can('products.archive') && (
                      <Button size="sm" variant="outline-danger" disabled={busy} onClick={() => void imageAction(i, 'archive')}>
                        {t('catalog.archivePhoto')}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {can('products.write') && can('products.edit') && (
            <Form
              onSubmit={(e) => {
                e.preventDefault()
                if (!file || busy) return
                setBusy(true)
                setError('')
                const data = new FormData()
                data.set('file', file)
                data.set('upload_key', key)
                void request('/products/' + id + '/images', { method: 'POST', body: data })
                  .then(async () => {
                    setFile(null)
                    setKey(crypto.randomUUID())
                    await q.reload()
                  })
                  .catch((e) => setError(errorMessage(e)))
                  .finally(() => setBusy(false))
              }}>
              <Form.Group controlId="product-image">
                <Form.Label>{t('catalog.imageField')}</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => {
                    setFile((e.target as HTMLInputElement).files?.[0] ?? null)
                    setKey(crypto.randomUUID())
                  }}
                />
              </Form.Group>
              <Button type="submit" className="my-3" disabled={!file || busy}>
                {busy ? t('catalog.uploading') : t('catalog.uploadPhoto')}
              </Button>
            </Form>
          )}
          <StockHistory product={p} refresh={q.reload} />
          {can('integrations.read') && <VistaProduct product={p} refresh={q.reload} />}
          {action && (
            <Editor
              title={action === 'status' ? 'catalog.changeStatus' : 'catalog.stockMovement'}
              fields={
                action === 'status'
                  ? [{ key: 'status', label: 'catalog.fieldStatus', required: true, options: options(['draft', 'active', 'archived'], 'status') }]
                  : [
                      {
                        key: 'kind',
                        label: 'catalog.fieldMovement',
                        required: true,
                        options: options(['receipt', 'adjustment'], 'catalog.movementKind'),
                      },
                      {
                        key: 'quantity',
                        label: 'catalog.fieldQuantityChange',
                        type: 'number',
                        required: true,
                        min: -1000000,
                        max: 1000000,
                        help: 'catalog.fieldQuantityHelp',
                      },
                      { key: 'reason', label: 'catalog.fieldReason', type: 'textarea', required: true, maxLength: 2000 },
                    ]
              }
              initial={action === 'status' ? { status: p.status } : { kind: 'receipt' }}
              close={() => setAction(null)}
              onSave={async (v) => {
                await request('/products/' + id + (action === 'status' ? '/status' : '/movements'), {
                  method: action === 'status' ? 'PATCH' : 'POST',
                  body: JSON.stringify(
                    action === 'status'
                      ? { status: v.status, version: p.version }
                      : { ...v, quantity: Number(v.quantity), version: p.balance.version, creation_key: key },
                  ),
                })
                await q.reload()
              }}
            />
          )}
        </>
      )}
    </Panel>
  )
}
function StockHistory({ product, refresh }: { product: Product; refresh: () => Promise<void> }) {
  const { t, tOr, humanize, formatNumber, formatDateTime } = useTranslation()
  const { request, can } = useWorkspace()
  const [page, setPage] = useState(1)
  const [reverse, setReverse] = useState<StockMovement | null>(null)
  const [key, setKey] = useState(crypto.randomUUID())
  const q = useLoad<Page<StockMovement>>('/products/' + product.id + '/movements?page=' + page, 5000)
  return (
    <>
      <h5>{t('catalog.stockLedger')}</h5>
      <LoadState {...q} />
      <Records
        headers={['catalog.thMovement', 'catalog.thChange', 'catalog.thBalanceAfter', 'catalog.thReasonActor', 'catalog.thActions']}
        empty={!q.data?.data.length}>
        {q.data?.data.map((m) => (
          <tr key={m.id}>
            <td>
              {tOr('catalog.movementKind.' + m.kind, humanize(m.kind))}
              <small className="d-block">{formatDateTime(m.created_at)}</small>
            </td>
            <td>
              {formatNumber(m.quantity_delta)} / {formatNumber(m.reserved_delta)}
            </td>
            <td>
              {formatNumber(m.on_hand_after)} / {formatNumber(m.reserved_after)}
            </td>
            <td>
              {m.reason}
              <small className="d-block">{m.actor?.name}</small>
            </td>
            <td>
              {can('stock.write') && can('stock.edit') && ['receipt', 'adjustment'].includes(m.kind) && !m.reversal && (
                <Button
                  size="sm"
                  variant="link"
                  onClick={() => {
                    setKey(crypto.randomUUID())
                    setReverse(m)
                  }}>
                  {t('catalog.reverse')}
                </Button>
              )}
            </td>
          </tr>
        ))}
      </Records>
      <Pager page={page} last={q.data?.last_page} setPage={setPage} />
      {reverse && (
        <Editor
          title="catalog.reverseMovement"
          fields={[{ key: 'reason', label: 'catalog.fieldReason', required: true, type: 'textarea' }]}
          close={() => setReverse(null)}
          onSave={async (v) => {
            await request('/stock-movements/' + reverse.id + '/reverse', {
              method: 'POST',
              body: JSON.stringify({ reason: v.reason, version: product.balance.version, creation_key: key }),
            })
            await refresh()
            await q.reload()
          }}
        />
      )}
    </>
  )
}
