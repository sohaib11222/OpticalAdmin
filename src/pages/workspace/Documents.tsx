import { useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { useTranslation } from '@/i18n'
import type { Customer, Page } from '../../../../contracts/customers'
import type { PrivateDocument } from '../../../../contracts/documents'
import type { CustomerImport, ImportRow } from '../../../../contracts/imports'
import { customerFields } from './customer-fields'
import { Editor, LoadState, Pager, Panel, RecordPicker, Records, Status, errorMessage, options, useLoad, useWorkspace } from './shared'

export default function Documents({ importMode = false }: { importMode?: boolean }) {
  const { t, tOr, humanize, formatNumber, translateMessage, translateError } = useTranslation()
  const { request, prefix, can } = useWorkspace()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [scan, setScan] = useState('')
  const [archived, setArchived] = useState(false)
  const [upload, setUpload] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [customer, setCustomer] = useState<number | null>(null)
  const [key, setKey] = useState(crypto.randomUUID())
  const [selected, setSelected] = useState<{ doc: PrivateDocument; action: 'edit' | 'archive' | 'import' } | null>(null)
  const [error, setError] = useState('')
  const [batch, setBatch] = useState<number | null>(null)
  const list = useLoad<Page<PrivateDocument>>(
    '/documents?' + new URLSearchParams({ page: String(page), search, scan_status: scan, archived: archived ? '1' : '0' }),
    5000,
  )
  const health = useLoad<{ data: { message: string; worker_active: boolean } }>('/uploads/processing', 15000)
  return (
    <>
      <Panel
        title={importMode ? 'documents.panelImports' : 'documents.panelDocuments'}
        action={
          can('files.write') &&
          can('files.create') && (
            <Button
              onClick={() => {
                setKey(crypto.randomUUID())
                setCustomer(null)
                setFile(null)
                setUpload(true)
              }}>
              {t(importMode ? 'documents.uploadSheet' : 'documents.uploadDocument')}
            </Button>
          )
        }>
        <Alert variant={health.data?.data.worker_active ? 'info' : 'warning'}>
          {health.data?.data.message ? translateError(health.data?.data.message) : t('documents.pipelineNote')}
        </Alert>
        {importMode && <p>{t('documents.importIntro')}</p>}
        {error && <Alert variant="danger">{translateMessage(error)}</Alert>}
        <div className="d-flex gap-2 mb-3">
          <Form.Control
            aria-label={t('documents.searchAria')}
            value={search}
            placeholder={t('documents.searchPlaceholder')}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <Form.Select
            aria-label={t('documents.scanFilterLabel')}
            value={scan}
            onChange={(e) => {
              setScan(e.target.value)
              setPage(1)
            }}>
            <option value="">{t('documents.scanAll')}</option>
            {options(['pending', 'clean', 'failed', 'rejected'], 'documents.scanState').map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.label)}
              </option>
            ))}
          </Form.Select>
          <Form.Check
            label={t('documents.archivedOnly')}
            checked={archived}
            onChange={(e) => {
              setArchived(e.target.checked)
              setPage(1)
            }}
          />
        </div>
        <LoadState {...list} />
        <Records
          headers={['documents.headerFile', 'documents.headerLinks', 'documents.headerState', 'documents.headerActions']}
          empty={!list.data?.data.length}>
          {list.data?.data.map((d) => (
            <tr key={d.id}>
              <td>
                {d.title}
                <small className="d-block">
                  {d.filename} · {formatNumber(d.size / 1024, 1)} KB
                </small>
              </td>
              <td>
                {tOr('documents.category.' + d.category, humanize(d.category))}
                {d.customer_id ? ' ' + t('documents.customerRef', { id: d.customer_id }) : ''}
                {d.optical_record_id ? ' ' + t('documents.recordRef', { id: d.optical_record_id }) : ''}
              </td>
              <td>
                <Status value={d.archived_at ? 'archived' : d.scan_status} />
                {d.scan_error && <small className="d-block text-danger">{translateError(d.scan_error)}</small>}
              </td>
              <td>
                <div className="d-flex gap-2 flex-wrap">
                  {d.scan_status === 'clean' && !d.archived_at && (
                    <>
                      <a className="btn btn-sm btn-outline-primary" href={'/api/v1' + prefix + '/private-files/' + d.id}>
                        {t('documents.download')}
                      </a>
                      {['application/pdf', 'image/png', 'image/jpeg'].includes(d.mime) && (
                        <a
                          className="btn btn-sm btn-outline-primary"
                          href={'/api/v1' + prefix + '/documents/' + d.id + '/preview'}
                          target="_blank"
                          rel="noreferrer">
                          {t('documents.preview')}
                        </a>
                      )}
                      {can('imports.write') && can('customers.write') && /\.(csv|xlsx)$/i.test(d.filename) && (
                        <Button size="sm" onClick={() => setSelected({ doc: d, action: 'import' })}>
                          {t('documents.importCustomers')}
                        </Button>
                      )}
                    </>
                  )}
                  {can('files.write') && (
                    <>
                      {can('files.edit') && (
                        <Button size="sm" variant="link" onClick={() => setSelected({ doc: d, action: 'edit' })}>
                          {t('documents.editDetails')}
                        </Button>
                      )}
                      {can('files.archive') && (
                        <Button size="sm" variant="link" onClick={() => setSelected({ doc: d, action: 'archive' })}>
                          {d.archived_at ? t('documents.restore') : t('documents.archive')}
                        </Button>
                      )}
                      {can('files.edit') && ['pending', 'failed'].includes(d.scan_status) && !d.archived_at && (
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => {
                            setError('')
                            void request('/documents/' + d.id + '/rescan', { method: 'POST', body: '{}' })
                              .then(() => list.reload())
                              .catch((e) => setError(errorMessage(e)))
                          }}>
                          {t('documents.retryScan')}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Records>
        <Pager page={page} last={list.data?.last_page} setPage={setPage} />
      </Panel>
      {upload && (
        <Editor
          title={importMode ? 'documents.uploadTitleImports' : 'documents.uploadTitleDocument'}
          fields={[
            { key: 'title', label: 'fields.title', required: true, maxLength: 255 },
            {
              key: 'category',
              label: 'fields.category',
              required: true,
              options: options(['document', 'customer_image', 'glasses_image'], 'documents.category'),
            },
            {
              key: 'optical_record_id',
              label: 'fields.optical_record_id',
              type: 'number',
              min: 1,
              help: 'documents.helpOpticalRecord',
            },
            { key: 'description', label: 'fields.description', type: 'textarea', maxLength: 2000 },
          ]}
          initial={{ category: 'document' }}
          close={() => setUpload(false)}
          onSave={async (v) => {
            if (!file) throw new Error('documents.chooseFile')
            const d = new FormData()
            d.set('file', file)
            d.set('upload_key', key)
            for (const [k, x] of Object.entries(v)) if (x) d.set(k, x)
            if (customer) d.set('customer_id', String(customer))
            await request('/documents', { method: 'POST', body: d })
            await list.reload()
          }}>
          <Form.Group controlId="document-file" className="mb-3">
            <Form.Label>{t('documents.fileLabel')}</Form.Label>
            <Form.Control
              required
              type="file"
              accept={importMode ? '.csv,.xlsx' : '.pdf,.png,.jpg,.jpeg,.txt,.csv,.docx,.xlsx'}
              onChange={(e) => {
                setFile((e.target as HTMLInputElement).files?.[0] ?? null)
                setKey(crypto.randomUUID())
              }}
            />
          </Form.Group>
          <RecordPicker<Customer>
            path="/customers"
            label="documents.pickerCustomer"
            value={customer}
            onChange={setCustomer}
            describe={(c) => c.first_name + ' ' + c.last_name}
          />
        </Editor>
      )}
      {selected && (
        <Editor
          title={
            selected.action === 'import'
              ? 'documents.startImport'
              : selected.action === 'archive'
                ? selected.doc.archived_at
                  ? 'documents.restoreTitle'
                  : 'documents.archiveTitle'
                : 'documents.editDetailsTitle'
          }
          fields={
            selected.action === 'import'
              ? [
                  {
                    key: 'delimiter',
                    label: 'fields.delimiter',
                    required: true,
                    options: [
                      { value: ',', label: 'documents.delimiter.comma' },
                      { value: ';', label: 'documents.delimiter.semicolon' },
                      { value: 'tab', label: 'documents.delimiter.tab' },
                      { value: '|', label: 'documents.delimiter.pipe' },
                    ],
                  },
                ]
              : selected.action === 'archive'
                ? [{ key: 'reason', label: 'fields.reason', required: true, type: 'textarea' }]
                : [
                    { key: 'title', label: 'fields.title', required: true },
                    { key: 'description', label: 'fields.description', type: 'textarea' },
                  ]
          }
          initial={
            selected.action === 'import'
              ? { delimiter: ',' }
              : { title: selected.doc.title ?? selected.doc.filename, description: selected.doc.description ?? '' }
          }
          close={() => setSelected(null)}
          onSave={async (v) => {
            const d = selected.doc
            if (selected.action === 'import') {
              const r = await request<{ data: CustomerImport }>('/customer-imports', {
                method: 'POST',
                body: JSON.stringify({ file_id: d.id, delimiter: v.delimiter }),
              })
              setBatch(r.data.id)
            } else {
              await request('/documents/' + d.id + (selected.action === 'archive' ? '/archive' : ''), {
                method: 'PATCH',
                body: JSON.stringify({ version: d.version, ...(selected.action === 'archive' ? { reason: v.reason, archived: !d.archived_at } : v) }),
              })
              await list.reload()
            }
          }}
        />
      )}
      {(importMode || batch) && can('imports.read') && <Imports selected={batch} setSelected={setBatch} />}
    </>
  )
}
function Imports({ selected, setSelected }: { selected: number | null; setSelected: (id: number | null) => void }) {
  const { t, formatNumber } = useTranslation()
  const [page, setPage] = useState(1)
  const q = useLoad<Page<CustomerImport>>('/customer-imports?page=' + page, 5000)
  return (
    <>
      <Panel title="documents.batchesPanel">
        <LoadState {...q} />
        <Records
          headers={['documents.headerBatch', 'documents.headerStage', 'documents.headerProgress', 'documents.headerActions']}
          empty={!q.data?.data.length}>
          {q.data?.data.map((b) => (
            <tr key={b.id}>
              <td>
                #{b.id} {b.source_kind === 'vista_express' ? t('documents.vistaContacts') : b.file?.filename}
              </td>
              <td>
                <Status value={b.status} />
              </td>
              <td>
                {formatNumber(b.processed_rows)} / {formatNumber(b.total_rows)}
              </td>
              <td>
                <Button size="sm" variant="outline-primary" onClick={() => setSelected(b.id)}>
                  {t('documents.reviewImport')}
                </Button>
              </td>
            </tr>
          ))}
        </Records>
        <Pager page={page} last={q.data?.last_page} setPage={setPage} />
      </Panel>
      {selected && <ImportDetail key={selected} id={selected} close={() => setSelected(null)} />}
    </>
  )
}
function ImportDetail({ id, close }: { id: number; close: () => void }) {
  const { t, tOr, humanize, formatNumber, translateMessage, translateError } = useTranslation()
  const { request, can } = useWorkspace()
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [mapping, setMapping] = useState(false)
  const [config, setConfig] = useState(false)
  const [choice, setChoice] = useState<ImportRow | null>(null)
  const [overwrite, setOverwrite] = useState(false)
  const base = '/customer-imports/' + id
  const q = useLoad<{ data: CustomerImport; undecided: number; counts: Record<string, number> }>(base, 5000)
  const b = q.data?.data
  const rows = useLoad<Page<ImportRow>>(base + '/rows?' + new URLSearchParams({ page: String(page), status: filter }), 5000)
  async function operation(action: string) {
    if (!b || busy) return
    setBusy(true)
    setError('')
    try {
      await request(base + '/' + action, { method: 'POST', body: JSON.stringify({ version: b.version }) })
      await q.reload()
      await rows.reload()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <Panel
      title={t('documents.importTitle', { id })}
      action={
        <Button variant="link" onClick={close}>
          {t('documents.closeImport')}
        </Button>
      }>
      <LoadState {...q} />
      {error && <Alert variant="danger">{translateMessage(error)}</Alert>}
      {b && (
        <>
          <p>
            <Status value={b.status} /> · {tOr('documents.stage.' + b.stage, humanize(b.stage))} ·{' '}
            {t('documents.processedOf', { processed: formatNumber(b.processed_rows), total: formatNumber(b.total_rows) })} ·{' '}
            {t('documents.rowsUndecided', { count: formatNumber(q.data?.undecided ?? 0) })}
          </p>
          {b.last_error && <Alert variant="danger">{translateError(b.last_error)}</Alert>}
          <div className="d-flex gap-2 mb-3">
            {can('imports.write') && can('customers.write') && (
              <>
                {b.source_kind !== 'vista_express' && ['mapping', 'ready'].includes(b.status) && b.processed_rows === 0 && (
                  <>
                    <Button onClick={() => setMapping(true)}>{t('documents.mapColumns')}</Button>
                    <Button variant="outline-primary" onClick={() => setConfig(true)}>
                      {t('documents.sheetDelimiter')}
                    </Button>
                  </>
                )}
                {b.status === 'ready' && (
                  <Button disabled={busy || !!q.data?.undecided} onClick={() => void operation('commit')}>
                    {t('documents.commitImport')}
                  </Button>
                )}
                {['failed', 'parsing', 'previewing', 'committing'].includes(b.status) && (
                  <Button disabled={busy} onClick={() => void operation('retry')}>
                    {t('documents.retryProcessing')}
                  </Button>
                )}
              </>
            )}
          </div>
          <Form.Select
            className="mb-3"
            aria-label={t('documents.rowStatusLabel')}
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value)
              setPage(1)
            }}>
            <option value="">{t('documents.allRows')}</option>
            {options(['pending', 'error', 'created', 'updated', 'skipped'], 'documents.rowState').map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.label)}
              </option>
            ))}
          </Form.Select>
          <LoadState {...rows} />
          <Records
            headers={[
              'documents.headerRow',
              'documents.headerRowValues',
              'documents.headerValidation',
              'documents.headerDecision',
              'documents.headerActions',
            ]}
            empty={!rows.data?.data.length}>
            {rows.data?.data.map((r) => (
              <tr key={r.id}>
                <td>{formatNumber(r.row_number)}</td>
                <td>
                  {r.payload ? (
                    <>
                      {r.payload.first_name} {r.payload.last_name}
                      <small className="d-block">
                        {r.payload.email} · {r.payload.phone} · {r.payload.postal_code}
                      </small>
                    </>
                  ) : (
                    r.raw_values.join(' | ')
                  )}
                </td>
                <td>
                  {r.errors?.length ? translateError(r.errors.join(' ')) : null}
                  {r.file_duplicate && <p>{t('documents.duplicateInFile')}</p>}
                  {r.matches?.map((c) => (
                    <p key={c.id}>
                      {t('documents.matchLabel', { id: c.id })}: {c.first_name} {c.last_name} · {c.email} · {c.phone} ·{' '}
                      {tOr('status.' + c.status, humanize(c.status))}
                    </p>
                  ))}
                </td>
                <td>
                  {tOr('documents.decision.' + r.decision, humanize(r.decision))} · <Status value={r.status} />
                  {r.result_customer_id ? ' ' + t('documents.resultCustomer', { id: r.result_customer_id }) : ''}
                  {r.result_error && <p className="text-danger">{translateError(r.result_error)}</p>}
                </td>
                <td>
                  {can('imports.write') &&
                    can('customers.write') &&
                    ['ready', 'completed_with_errors'].includes(b.status) &&
                    !['created', 'updated', 'skipped'].includes(r.status) && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => {
                          setOverwrite(false)
                          setChoice(r)
                        }}>
                        {t('documents.reviewDecision')}
                      </Button>
                    )}
                </td>
              </tr>
            ))}
          </Records>
          <Pager page={page} last={rows.data?.last_page} setPage={setPage} />
          {mapping && (
            <Editor
              title="documents.columnMapping"
              fields={[
                ...customerFields.map((f) => ({
                  key: f.key,
                  label: f.label,
                  required: ['first_name', 'last_name'].includes(f.key),
                  options: (b.headers ?? []).map((h, n) => ({ value: String(n), label: n + 1 + '. ' + h })),
                })),
                {
                  key: 'date_format',
                  label: 'fields.date_format',
                  required: true,
                  options: options(['Y-m-d', 'd/m/Y', 'm/d/Y', 'excel'], 'documents.dateFormat'),
                },
              ]}
              initial={{
                ...Object.fromEntries(Object.entries(b.mapping ?? {}).map(([k, v]) => [k, String(v)])),
                date_format: b.date_format || 'Y-m-d',
              }}
              close={() => setMapping(false)}
              help="documents.helpColumnMapping"
              onSave={async (v) => {
                const mapping = Object.fromEntries(
                  customerFields.filter((f) => v[f.key] !== undefined && v[f.key] !== '').map((f) => [f.key, Number(v[f.key])]),
                )
                await request(base + '/mapping', {
                  method: 'PATCH',
                  body: JSON.stringify({ version: b.version, mapping, date_format: v.date_format }),
                })
                await q.reload()
                await rows.reload()
              }}
            />
          )}
          {config && (
            <Editor
              title="documents.sourceSheetTitle"
              fields={[
                { key: 'sheet_name', label: 'fields.sheet_name', options: (b.sheets ?? []).map((s) => ({ value: s, label: s })) },
                {
                  key: 'delimiter',
                  label: 'fields.delimiter',
                  required: true,
                  options: [
                    { value: ',', label: 'documents.delimiter.comma' },
                    { value: ';', label: 'documents.delimiter.semicolon' },
                    { value: 'tab', label: 'documents.delimiter.tab' },
                    { value: '|', label: 'documents.delimiter.pipe' },
                  ],
                },
              ]}
              initial={{ sheet_name: b.sheet_name ?? '', delimiter: b.delimiter === '\t' ? 'tab' : b.delimiter }}
              close={() => setConfig(false)}
              onSave={async (v) => {
                await request(base + '/configure', {
                  method: 'PATCH',
                  body: JSON.stringify({ ...v, sheet_name: v.sheet_name || null, version: b.version }),
                })
                await q.reload()
                await rows.reload()
              }}
            />
          )}
          {choice && (
            <Editor
              title={t('documents.reviewRow', { row: choice.row_number })}
              fields={[
                {
                  key: 'decision',
                  label: 'fields.decision',
                  required: true,
                  options: options(choice.errors?.length ? ['skip'] : ['create', 'create_distinct', 'update', 'skip'], 'documents.action'),
                },
                {
                  key: 'target',
                  label: 'fields.target_customer_id',
                  options: (choice.matches ?? [])
                    .filter((c) => c.status === 'active')
                    .map((c) => ({ value: String(c.id), label: '#' + c.id + ' ' + c.first_name + ' ' + c.last_name + ' · ' + c.email })),
                },
                { key: 'reason', label: 'fields.reason', type: 'textarea' },
              ]}
              initial={{ decision: choice.decision === 'pending' ? '' : choice.decision }}
              close={() => setChoice(null)}
              onSave={async (v) => {
                const target = choice.matches?.find((c) => c.id === Number(v.target))
                await request(base + '/decisions', {
                  method: 'PATCH',
                  body: JSON.stringify({
                    version: b.version,
                    rows: [
                      {
                        id: choice.id,
                        decision: v.decision,
                        target_customer_id: target?.id,
                        target_version: target?.version,
                        reason: v.reason,
                        overwrite_blanks: overwrite,
                      },
                    ],
                  }),
                })
                await q.reload()
                await rows.reload()
              }}>
              <Form.Check label={t('documents.overwriteBlanks')} checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} />
            </Editor>
          )}
        </>
      )}
    </Panel>
  )
}
