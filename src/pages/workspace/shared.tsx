/* eslint-disable react-refresh/only-export-components -- workspace hooks and retained Bootstrap components */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Alert, Badge, Button, Card, Form, Modal, Table } from 'react-bootstrap'
import { ApiError, type SessionUser } from '../../../../contracts/session'
import LanguageToggle from '@/components/LanguageToggle'
import { adminApi, useAuthContext } from '@/context/useAuthContext'
import { serverMessageKey, useTranslation } from '@/i18n'

export type ManagedShop = NonNullable<SessionUser['shop']>
export type Workspace = { shop: ManagedShop; prefix: string; request: typeof adminApi.request; can: (permission: string) => boolean }
export const WorkspaceContext = createContext<Workspace | null>(null)
export function useWorkspace() {
  const value = useContext(WorkspaceContext)
  if (!value) throw new Error('Select a shop first')
  return value
}
export function useWorkspaceValue(shop: ManagedShop): Workspace {
  const { user } = useAuthContext()
  const prefix = '/admin/shops/' + shop.id + '/workspace'
  const request = useCallback<typeof adminApi.request>((path, options) => adminApi.request(prefix + path, options), [prefix])
  return {
    shop,
    prefix,
    request,
    can: (p) =>
      !!user?.permissions.includes('shops.' + p) &&
      ((!['write', 'manage', 'send', 'reverse', 'create', 'edit', 'archive', 'fulfil', 'finalize', 'update', 'publish'].includes(p.split('.').pop() || '')) ||
        shop.status === 'active'),
  }
}
/**
 * Builds the text shown when a request fails.
 *
 * Nothing is translated here on purpose. The result is stored in state and
 * rendered later, possibly after the user switched language, so it carries
 * dictionary keys instead of wording. Known server messages are reduced to
 * their key, and validation field names become `fields.<name>` keys; anything
 * the map does not know about is kept verbatim as a last resort.
 */
export function errorMessage(e: unknown) {
  if (e instanceof ApiError)
    return [
      serverMessageKey(e.message) || e.message,
      ...Object.entries(e.errors).map(
        ([key, values]) => `fields.${fieldKey(key)}: ` + values.map((v) => serverMessageKey(v) || v).join(' '),
      ),
    ].join(' ')
  return e instanceof Error ? serverMessageKey(e.message) || e.message : 'common.operationFailed'
}

/**
 * Laravel addresses nested validation rules with a path (`items.0.product_id`,
 * `data.expiry_date`). The last segment names the field the user actually has
 * to fix, so it is the one worth looking up a label for.
 */
function fieldKey(key: string) {
  return key.split('.').pop() || key
}
export function useLoad<T>(path: string | null, interval = 0) {
  const { request } = useWorkspace()
  const [data, setData] = useState<T>()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const serial = useRef(0)
  const pending = useRef<{ path: string; id: number } | null>(null)
  const load = useCallback(async () => {
    if (!path || pending.current?.path === path) return
    const n = ++serial.current
    pending.current = { path, id: n }
    setBusy(true)
    try {
      const value = await request<T>(path)
      if (n === serial.current) {
        setData(value)
        setError('')
      }
    } catch (e) {
      if (n === serial.current) setError(errorMessage(e))
    } finally {
      if (pending.current?.id === n) pending.current = null
      if (n === serial.current) setBusy(false)
    }
  }, [path, request])
  useEffect(() => {
    setData(undefined)
    void load()
    const timer = interval ? setInterval(() => void load(), interval) : undefined
    const generation = serial
    const running = pending
    return () => {
      generation.current++
      running.current = null
      clearInterval(timer)
    }
  }, [load, interval])
  return { data, error, busy, reload: load }
}
export function LoadState({ error, busy }: { error: string; busy: boolean }) {
  const { t, translateMessage } = useTranslation()
  return (
    <>
      {error && (
        <Alert variant="danger" role="alert">
          {translateMessage(error)}
        </Alert>
      )}
      {busy && <p role="status">{t('common.loading')}</p>}
    </>
  )
}
export function Status({ value }: { value: string }) {
  const { tOr, humanize } = useTranslation()
  return (
    <Badge
      bg={
        ['active', 'clean', 'fulfilled', 'completed', 'finalized'].includes(value)
          ? 'success'
          : ['failed', 'rejected', 'suspended'].includes(value)
            ? 'danger'
            : 'secondary'
      }>
      {tOr('status.' + value, humanize(value))}
    </Badge>
  )
}
export function Pager({ page, last, setPage }: { page: number; last?: number; setPage: (n: number) => void }) {
  const { t } = useTranslation()
  return (
    <div className="d-flex align-items-center gap-3 mt-3">
      <Button size="sm" variant="outline-primary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
        {t('common.previous')}
      </Button>
      <span>{t('common.pageOf', { page, total: last ?? 1 })}</span>
      <Button size="sm" variant="outline-primary" disabled={page >= (last ?? 1)} onClick={() => setPage(page + 1)}>
        {t('common.next')}
      </Button>
    </div>
  )
}
export function Records({ headers, children, empty }: { headers: string[]; children: ReactNode; empty?: boolean }) {
  const { t, translateMessage } = useTranslation()
  return (
    <Table responsive hover className="align-middle">
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h}>{translateMessage(h)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {empty ? (
          <tr>
            <td colSpan={headers.length}>{t('common.noRecords')}</td>
          </tr>
        ) : (
          children
        )}
      </tbody>
    </Table>
  )
}
export type Field = {
  key: string
  /** Dictionary key rendered as the label, not literal text. */
  label: string
  type?: string
  required?: boolean
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  step?: string
  maxLength?: number
  readOnly?: boolean
  /** Dictionary key rendered as help text, not literal text. */
  help?: string
}
export type Values = Record<string, string>
export function FieldInputs({ fields, values, setValues }: { fields: Field[]; values: Values; setValues: (v: Values) => void }) {
  const { t } = useTranslation()
  return (
    <div className="row">
      {fields.map((f) => (
        <Form.Group className={f.type === 'textarea' ? 'col-12 mb-3' : 'col-md-6 mb-3'} controlId={'field-' + f.key} key={f.key}>
          <Form.Label>
            {t(f.label)}
            {f.required ? ' *' : ''}
          </Form.Label>
          {f.options ? (
            <Form.Select
              value={values[f.key] ?? ''}
              required={f.required}
              disabled={f.readOnly}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}>
              <option value="">{t('common.choose')}</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(o.label)}
                </option>
              ))}
            </Form.Select>
          ) : (
            <Form.Control
              as={f.type === 'textarea' ? 'textarea' : 'input'}
              type={f.type === 'textarea' ? undefined : f.type ?? 'text'}
              value={values[f.key] ?? ''}
              required={f.required}
              min={f.min}
              max={f.max}
              step={f.step}
              maxLength={f.maxLength}
              readOnly={f.readOnly}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            />
          )}
          {f.help && <Form.Text>{t(f.help)}</Form.Text>}
        </Form.Group>
      ))}
    </div>
  )
}
export function Editor({
  title,
  fields,
  initial = {},
  onSave,
  close,
  help,
  children,
}: {
  /** Dictionary key used as the dialog title, not literal text. */
  title: string
  fields: Field[]
  initial?: Values
  onSave: (v: Values) => Promise<void>
  close: () => void
  /** Dictionary key rendered as help text, not literal text. */
  help?: string
  children?: ReactNode
}) {
  const { t, translateMessage } = useTranslation()
  const [values, setValues] = useState(initial)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <Modal show size="lg" onHide={() => !busy && close()} backdrop="static" aria-labelledby="editor-title">
      <Form
        onSubmit={(e) => {
          e.preventDefault()
          if (busy) return
          setBusy(true)
          setError('')
          void onSave(values)
            .then(close)
            .catch((e) => setError(errorMessage(e)))
            .finally(() => setBusy(false))
        }}>
        <Modal.Header closeButton>
          <Modal.Title id="editor-title">{t(title)}</Modal.Title>
          <LanguageToggle variant="inline" className="ms-auto me-2" />
        </Modal.Header>
        <Modal.Body>
          {help && <p className="text-muted">{t(help)}</p>}
          {error && (
            <Alert variant="danger" role="alert">
              {translateMessage(error)}
            </Alert>
          )}
          <FieldInputs fields={fields} values={values} setValues={setValues} />
          {children}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" disabled={busy} onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? t('common.saving') : t('common.save')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
export function toValues(value: object): Values {
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, v == null ? '' : String(v)]))
}
export function nullable(v: Values) {
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x === '' ? null : x]))
}
/**
 * Turns raw API values into select options.
 *
 * With a `prefix` the label becomes the dictionary key `<prefix>.<value>`, which
 * `FieldInputs` resolves at render time; unknown values then fall back to the
 * humanized value instead of showing a key.
 */
export function options(values: string[], prefix?: string) {
  return values.map((value) => ({
    value,
    label: prefix ? prefix + '.' + value : value.replaceAll('_', ' '),
  }))
}
export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  const { t } = useTranslation()
  return (
    <Card>
      <Card.Header className="d-flex align-items-center justify-content-between gap-2">
        <h4 className="mb-0">{t(title)}</h4>
        {action}
      </Card.Header>
      <Card.Body>{children}</Card.Body>
    </Card>
  )
}
export function RecordHistory({ path }: { path: string }) {
  const { t, formatDateTime } = useTranslation()
  const [page, setPage] = useState(1)
  const q = useLoad<{ data: { id: number; action: string; reason?: string; created_at: string; actor?: { name: string } }[]; last_page: number }>(
    path + '?page=' + page,
  )
  return (
    <Panel title="audit.title">
      <LoadState {...q} />
      <Records headers={['audit.action', 'audit.reason', 'audit.who', 'audit.when']} empty={!q.data?.data.length}>
        {q.data?.data.map((r) => (
          <tr key={r.id}>
            <td>{r.action}</td>
            <td>{r.reason || '—'}</td>
            <td>{r.actor?.name || t('common.system')}</td>
            <td>{formatDateTime(r.created_at)}</td>
          </tr>
        ))}
      </Records>
      <Pager page={page} last={q.data?.last_page} setPage={setPage} />
    </Panel>
  )
}
export function RecordPicker<T extends { id: number }>({
  path,
  label,
  value,
  onChange,
  describe,
}: {
  path: string
  /** Dictionary key rendered as the label, not literal text. */
  label: string
  value: number | null
  onChange: (id: number | null) => void
  describe: (row: T) => string
}) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const q = useLoad<{ data: T[]; last_page?: number; meta?: { last_page: number } }>(
    path + (path.includes('?') ? '&' : '?') + new URLSearchParams({ search, page: String(page) }),
  )
  const searchLabel = t('picker.search', { label: t(label).toLowerCase() })
  return (
    <Form.Group className="mb-3">
      <Form.Label>
        {t(label)}
        {value ? ' · #' + value : ''}
      </Form.Label>
      <Form.Control
        aria-label={searchLabel}
        placeholder={searchLabel}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
      />
      <LoadState {...q} />
      <Form.Select aria-label={t(label)} value={value ?? ''} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}>
        <option value="">{t('common.choose')}</option>
        {value && !q.data?.data.some((r) => r.id === value) && <option value={value}>{t('picker.selected', { id: value })}</option>}
        {q.data?.data.map((r) => (
          <option key={r.id} value={r.id}>
            {describe(r)}
          </option>
        ))}
      </Form.Select>
      <Pager page={page} last={q.data?.meta?.last_page ?? q.data?.last_page} setPage={setPage} />
    </Form.Group>
  )
}
