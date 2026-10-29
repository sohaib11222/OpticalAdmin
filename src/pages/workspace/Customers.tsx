import OperationsWorkspace, { workspaceUrl } from './OperationsWorkspace'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Alert, Button, Form, Nav } from 'react-bootstrap'
import { useTranslation } from '@/i18n'
import type { Customer, ResourcePage } from '../../../../contracts/customers'
import type { OpticalDefinition, OpticalRecord } from '../../../../contracts/optical'
import type { Page } from '../../../../contracts/customers'
import {
  Editor,
  LoadState,
  Pager,
  Panel,
  RecordHistory,
  Records,
  Status,
  errorMessage,
  nullable,
  options,
  toValues,
  useLoad,
  useWorkspace,
} from './shared'

import { customerFields } from './customer-fields'
import type { Field } from './shared'
export default function Customers({ optical = false }: { optical?: boolean }) {
  const { t, formatDate } = useTranslation()
  const { request, can, shop } = useWorkspace()
  const navigate = useNavigate()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const canMessage = can('communications.send') && can('communications.read')
  useEffect(() => setSelectedIds([]), [shop.id])
  const compose = (channel: string, ids: number[], bulk = false) => navigate(workspaceUrl('/communications?' + new URLSearchParams({compose: channel, [bulk ? 'customers' : 'customer']: ids.join(',')}), shop.id))
  const [params] = useSearchParams()
  const [deepError, setDeepError] = useState('')
  const deepRecord = params.get('record')
  useEffect(() => { if (!deepRecord) return; const c = new AbortController(); void request<{data: Customer}>('/customers/' + encodeURIComponent(deepRecord), {signal: c.signal}).then(r => setSelected(r.data)).catch(e => { if (!c.signal.aborted) setDeepError(errorMessage(e)); }); return () => c.abort() }, [deepRecord, request])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('active')
  const [edit, setEdit] = useState<Customer | 'new' | null>(null)
  const [selected, setSelected] = useState<Customer | null>(null)
  const [tab, setTab] = useState(optical ? 'optical' : 'history')
  const [action, setAction] = useState<Customer | null>(null)
  const list = useLoad<ResourcePage<Customer>>('/customers?' + new URLSearchParams({ page: String(page), search, status }))
  const [key, setKey] = useState(crypto.randomUUID())
  const [distinct, setDistinct] = useState(false)
  return (
    <>
      {deepError && <Alert variant="danger">{t(deepError)}</Alert>}
      <Panel
        title={optical ? 'customers.panelOptical' : 'customers.panelRegistry'}
        action={
          can('customers.write') && can('customers.create') && (
            <Button
              onClick={() => {
                setKey(crypto.randomUUID())
                setDistinct(false)
                setEdit('new')
              }}>
              {t('customers.add')}
            </Button>
          )
        }>
        <div className="d-flex gap-2 mb-3">
          <Form.Control
            aria-label={t('customers.searchAria')}
            placeholder={t('customers.searchPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <Form.Select
            aria-label={t('customers.statusFilterLabel')}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}>
            {options(['active', 'archived', 'all'], 'customers.statusFilter').map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.label)}
              </option>
            ))}
          </Form.Select>
          <Button variant="outline-primary" onClick={() => void list.reload()}>
            {t('customers.refresh')}
          </Button>
        </div>
        <LoadState {...list} />
        {canMessage && <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <span>{t('ops.selectedCustomers')}: {selectedIds.length} / 100</span>
          <Button variant="outline-primary" onClick={() => setSelectedIds([...new Set([...selectedIds, ...(list.data?.data.filter(c => c.status === 'active').map(c => c.id) ?? [])])].slice(0, 100))}>{t('ops.selectPage')}</Button>
          <Button variant="outline-secondary" onClick={() => setSelectedIds([])}>{t('ops.clearSelection')}</Button>
          {['sms', 'email'].map(channel => <Button key={channel} disabled={!selectedIds.length} onClick={() => compose(channel, selectedIds, true)}>{t(channel === 'sms' ? 'ops.bulkSms' : 'ops.bulkEmail')}</Button>)}
        </div>}
        <Records
          headers={[
            ...(canMessage ? ['ops.selectCustomer'] : []),
            'customers.headerCustomer',
            'customers.headerContact',
            'customers.headerCityCap',
            'customers.headerStatus',
            'customers.headerActions',
          ]}
          empty={!list.data?.data.length}>
          {list.data?.data.map((c) => (
            <tr key={c.id}>
              {canMessage && <td><Form.Check aria-label={t('ops.selectCustomer') + ' ' + c.first_name + ' ' + c.last_name} checked={selectedIds.includes(c.id)} disabled={c.status !== 'active' || (!selectedIds.includes(c.id) && selectedIds.length >= 100)} onChange={e => setSelectedIds(e.target.checked ? [...selectedIds, c.id] : selectedIds.filter(id => id !== c.id))} /></td>}
              <td>
                {c.first_name} {c.last_name}
                <small className="d-block text-muted">
                  {c.date_of_birth ? formatDate(c.date_of_birth) : t('customers.birthDateMissing')}
                </small>
              </td>
              <td>
                {c.email}
                <br />
                {c.phone}
              </td>
              <td>
                {c.city} {c.postal_code}
              </td>
              <td>
                <Status value={c.status} />
              </td>
              <td>
                <Button size="sm" variant="outline-primary" onClick={() => setSelected(c)}>
                  {t('customers.details')}
                </Button>
                {canMessage && c.status === 'active' && <div className="d-flex flex-wrap gap-1 mt-2">{['sms', 'whatsapp', 'email'].map(channel => <Button key={channel} size="sm" variant="outline-primary" disabled={channel === 'email' ? !c.email : !c.phone} onClick={() => compose(channel, [c.id])}>{t('ops.' + channel)}</Button>)}</div>}
                {can('customers.write') && (
                  <>
                    {can('customers.edit') && (<Button
                      size="sm"
                      variant="link"
                      onClick={() => {
                        setDistinct(false)
                        setEdit(c)
                      }}>
                      {t('customers.editAction')}
                    </Button>)}
                    {can('customers.archive') && (<Button size="sm" variant="link" onClick={() => setAction(c)}>
                      {c.status === 'active' ? t('customers.actionArchive') : t('customers.actionRestore')}
                    </Button>)}
                  </>
                )}
              </td>
            </tr>
          ))}
        </Records>
        <Pager page={page} last={list.data?.meta.last_page} setPage={setPage} />
      </Panel>
      {edit && (
        <Editor
          title={edit === 'new' ? 'customers.add' : 'customers.editTitle'}
          fields={customerFields}
          initial={edit === 'new' ? {} : toValues(edit)}
          close={() => setEdit(null)}
          help="customers.helpDuplicates"
          onSave={async (v) => {
            const payload = Object.fromEntries(customerFields.map((f) => [f.key, v[f.key] || null]))
            const r = await request<{ data: Customer }>('/customers' + (edit === 'new' ? '' : '/' + edit.id), {
              method: edit === 'new' ? 'POST' : 'PATCH',
              body: JSON.stringify({
                ...payload,
                ...(edit === 'new' ? { creation_key: key } : { version: edit.version }),
                confirm_distinct: distinct,
              }),
            })
            setSelected(r.data)
            await list.reload()
          }}>
          <Form.Check
            label={t('customers.confirmDistinct')}
            checked={distinct}
            onChange={(e) => setDistinct(e.target.checked)}
          />
        </Editor>
      )}
      {action && (
        <Editor
          title={action.status === 'active' ? 'customers.archiveTitle' : 'customers.restoreTitle'}
          fields={[{ key: 'reason', label: 'fields.reason', type: 'textarea', required: true }]}
          close={() => setAction(null)}
          onSave={async (v) => {
            await request('/customers/' + action.id + '/status', {
              method: 'PATCH',
              body: JSON.stringify({ version: action.version, status: action.status === 'active' ? 'archived' : 'active', reason: v.reason }),
            })
            setSelected(null)
            await list.reload()
          }}
        />
      )}
      {selected && (
        <Panel
          title={selected.first_name + ' ' + selected.last_name}
          action={
            <Button variant="link" onClick={() => setSelected(null)}>
              {t('customers.closeDetails')}
            </Button>
          }>
          {canMessage && selected.status === 'active' && <div className="d-flex flex-wrap gap-2 mb-3">{['sms', 'whatsapp', 'email'].map(channel => <Button key={channel} variant="outline-primary" onClick={() => compose(channel, [selected.id])}>{t('ops.' + channel)}</Button>)}</div>}
          <dl className="row">
            {customerFields.map((f) => {
              const raw = selected[f.key as keyof Customer]
              return (
                <div className="col-md-4" key={f.key}>
                  <dt>{t(f.label)}</dt>
                  <dd>{raw === null || raw === undefined || raw === '' ? t('common.dash') : f.type === 'date' ? formatDate(String(raw)) : String(raw)}</dd>
                </div>
              )
            })}
          </dl>
          <Nav variant="tabs" className="mb-3" activeKey={tab} onSelect={(k) => setTab(k || 'history')}>
            {[['communications', 'communications.read'], ['reminders', 'reminders.read'], ['payments', 'payments.read']].map(([module, permission]) => can(permission) && <Nav.Item key={module}><Nav.Link eventKey={module}>{t('ops.' + module)}</Nav.Link></Nav.Item>)}
            <Nav.Item>
              <Nav.Link eventKey="history">{t('customers.tabHistory')}</Nav.Link>
            </Nav.Item>
            {can('optical.read') && (
              <Nav.Item>
                <Nav.Link eventKey="optical">{t('customers.tabOptical')}</Nav.Link>
              </Nav.Item>
            )}
          </Nav>
          {['communications', 'reminders', 'payments'].includes(tab) ? <OperationsWorkspace module={tab} customerId={selected.id} /> : tab === 'history' ? (
            <RecordHistory key={selected.id} path={'/customers/' + selected.id + '/history'} />
          ) : (
            can('optical.read') && <OpticalCare key={selected.id} customer={selected} />
          )}
        </Panel>
      )}
    </>
  )
}

function OpticalCare({ customer }: { customer: Customer }) {
  const { t, tOr, humanize, formatDate, formatNumber, translateMessage } = useTranslation()
  const { request, can, shop } = useWorkspace()
  const [page, setPage] = useState(1)
  const [kind, setKind] = useState('prescription')
  const [editing, setEditing] = useState<OpticalRecord | 'new' | null>(null)
  const [action, setAction] = useState<{ record: OpticalRecord; kind: 'finalize' | 'amend' } | null>(null)
  const [view, setView] = useState<OpticalRecord | null>(null)
  const [error, setError] = useState('')
  const [key, setKey] = useState(crypto.randomUUID())
  const dictionary = useLoad<{ data: OpticalDefinition[] }>('/optical/dictionary')
  const base = '/customers/' + customer.id + '/optical'
  const list = useLoad<Page<OpticalRecord>>(base + '?page=' + page)
  const definition = dictionary.data?.data.find((d) => d.kind === (editing && editing !== 'new' ? editing.kind : kind))
  const fields: Field[] = [
    { key: 'recorded_on', label: 'fields.recorded_on', type: 'date', required: true },
    { key: 'practitioner', label: 'fields.practitioner', required: true, maxLength: 150 },
    { key: 'prescription_id', label: 'fields.prescription_id', type: 'number', min: 1, help: 'customers.helpLinkedPrescription' },
    { key: 'source_record_id', label: 'fields.source_record_id', type: 'number', min: 1 },
    ...Object.entries(definition?.fields || {}).map(([key, f]) => ({
      ...f,
      key: 'data.' + key,
      label: f.label + (f.unit ? ' (' + f.unit + ')' : ''),
      options: f.options ? options(f.options) : undefined,
    })),
  ]
  return (
    <>
      <LoadState {...dictionary} />
      {error && (
        <Alert variant="danger" role="alert">
          {translateMessage(error)}
        </Alert>
      )}
      <div className="d-flex gap-2 mb-3">
        <Form.Select aria-label={t('customers.recordTypeLabel')} value={kind} onChange={(e) => setKind(e.target.value)}>
          {dictionary.data?.data.map((d) => (
            <option key={d.kind} value={d.kind}>
              {d.label}
            </option>
          ))}
        </Form.Select>
        {can('optical.write') && can('optical.create') && customer.status === 'active' && (
          <Button
            onClick={() => {
              setKey(crypto.randomUUID())
              setEditing('new')
            }}>
            {t('customers.newRecord')}
          </Button>
        )}
      </div>
      <LoadState {...list} />
      <Records
        headers={[
          'customers.headerRecord',
          'customers.headerDatePractitioner',
          'customers.headerRevision',
          'customers.headerStatus',
          'customers.headerActions',
        ]}
        empty={!list.data?.data.length}>
        {list.data?.data.map((r) => (
          <tr key={r.id}>
            <td>
              #{r.id} {tOr('customers.recordKind.' + r.kind, humanize(r.kind))}
            </td>
            <td>
              {formatDate(r.recorded_on)}
              <br />
              {r.practitioner}
            </td>
            <td>
              {formatNumber(r.revision)}
              {r.amends_id ? ' · ' + t('customers.amends', { id: r.amends_id }) : ''}
            </td>
            <td>
              <Status value={r.status} />
            </td>
            <td>
              <Button
                size="sm"
                variant="link"
                onClick={() => {
                  setError('')
                  void request<{ data: OpticalRecord }>(base + '/' + r.id)
                    .then((x) => setView(x.data))
                    .catch((e) => setError(errorMessage(e)))
                }}>
                {t('customers.viewSheet')}
              </Button>
              {r.status === 'finalized' && !r.amendment && can('reminders.write') && can('optical.write') && ['optometry', 'examination', 'contact_lens'].includes(r.kind) && <Link className="btn btn-link btn-sm" to={'/workspace/reminders?shop=' + shop.id + '&customer=' + customer.id + '&kind=' + (r.kind === 'contact_lens' ? 'contact_lens' : 'checkup') + '&care=' + r.id + '&create=1'}>{t(r.kind === 'contact_lens' ? 'ops.contact_lens' : 'ops.nextCheckup')}</Link>}
              {r.status === 'draft' && can('optical.write') && can('optical.edit') && (
                <Button size="sm" variant="link" onClick={() => setEditing(r)}>
                  {t('customers.editDraft')}
                </Button>
              )}
              {r.status === 'draft' && can('optical.finalize') && (
                <Button size="sm" variant="link" onClick={() => setAction({ record: r, kind: 'finalize' })}>
                  {t('customers.finalize')}
                </Button>
              )}
              {r.status === 'finalized' && !r.amendment && can('optical.write') && can('optical.create') && (
                <Button
                  size="sm"
                  variant="link"
                  onClick={() => {
                    setKey(crypto.randomUUID())
                    setAction({ record: r, kind: 'amend' })
                  }}>
                  {t('customers.amend')}
                </Button>
              )}
            </td>
          </tr>
        ))}
      </Records>
      <Pager page={page} last={list.data?.last_page} setPage={setPage} />
      {editing && definition && (
        <Editor
          title={tOr('customers.recordKind.' + definition.kind, definition.label)}
          fields={fields}
          initial={
            editing === 'new'
              ? { recorded_on: new Date().toISOString().slice(0, 10) }
              : {
                  ...toValues(editing),
                  ...Object.fromEntries(Object.entries(editing.data).map(([k, v]) => ['data.' + k, v == null ? '' : String(v)])),
                }
          }
          close={() => setEditing(null)}
          onSave={async (v) => {
            const data = Object.fromEntries(
              Object.keys(definition.fields).map((k) => [
                k,
                v['data.' + k] === '' || v['data.' + k] === undefined
                  ? null
                  : definition.fields[k].type === 'number'
                    ? Number(v['data.' + k])
                    : v['data.' + k],
              ]),
            )
            await request(base + '/' + (editing === 'new' ? kind : editing.id), {
              method: editing === 'new' ? 'POST' : 'PATCH',
              body: JSON.stringify({
                ...nullable({
                  recorded_on: v.recorded_on,
                  practitioner: v.practitioner,
                  prescription_id: v.prescription_id,
                  source_record_id: v.source_record_id,
                }),
                data,
                ...(editing === 'new' ? { creation_key: key } : { version: editing.version }),
              }),
            })
            await list.reload()
          }}
        />
      )}
      {action && (
        <Editor
          title={action.kind === 'finalize' ? 'customers.finalizeTitle' : 'customers.amendTitle'}
          fields={action.kind === 'amend' ? [{ key: 'reason', label: 'customers.amendmentReason', type: 'textarea', required: true }] : []}
          help="customers.helpFinalized"
          close={() => setAction(null)}
          onSave={async (v) => {
            await request(base + '/' + action.record.id + '/' + action.kind, {
              method: 'POST',
              body: JSON.stringify({ version: action.record.version, ...(action.kind === 'amend' ? { reason: v.reason, creation_key: key } : {}) }),
            })
            await list.reload()
          }}
        />
      )}
      {view && (
        <Panel
          title={t('customers.clinicalSheet', { id: view.id })}
          action={
            <Button variant="link" onClick={() => setView(null)}>
              {t('customers.closeSheet')}
            </Button>
          }>
          <p>
            {tOr('customers.recordKind.' + view.kind, humanize(view.kind))} · {formatDate(view.recorded_on)} · {view.practitioner} ·{' '}
            {t('customers.revisionLine', { revision: formatNumber(view.revision) })} · {tOr('status.' + view.status, humanize(view.status))}
          </p>
          <Records headers={['customers.headerField', 'customers.headerValue']}>
            {Object.entries(view.data).map(([k, v]) => (
              <tr key={k}>
                <th>{dictionary.data?.data.find((d) => d.kind === view.kind)?.fields[k]?.label || k}</th>
                <td>{String(v ?? '—')}</td>
              </tr>
            ))}
          </Records>
        </Panel>
      )}
    </>
  )
}
