import { canAccessVerifiedAccount } from '../../../../contracts/session'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, CardBody, Row, Col, FormControl, FormLabel, Badge } from 'react-bootstrap'
import type { ColumnDef } from '@tanstack/react-table'
import ReactTable from '@/components/Table'
import PageTitle from '@/components/PageTitle'
import { adminApi, useAuthContext } from '@/context/useAuthContext'
import { useTranslation } from '@/i18n'
import { errorMessage } from '../workspace/shared'
type AuditRow = {
  id: number
  shop_id: number | null
  actor_id: number | null
  action: string
  subject_type: string | null
  subject_id: number | null
  request_id: string | null
  created_at: string
}
type Health = {
  communications?: {processing:{worker_active:boolean;scheduler_active:boolean;last_run_at:string|null};providers:Record<string,boolean>;messages:{status:string;count:number}[]}
  generated_at: string
  database: string
  queue_driver: string
  queue: { pending: number; oldest_age_seconds: number | null } | null
  failed_jobs: number
  scanner_configured: boolean
  scanner_verification: string
  worker_verification: string
  files: { scan_status: string; count: number }[]
  product_photos: { scan_status: string; count: number }[]
  imports: { status: string; count: number }[]
}
function useAdminData<T>(path: string | null, revision: number) {
  const [result, setResult] = useState<{ path: string; data: T } | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!path) return
    const controller = new AbortController()
    const currentPath = path
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await adminApi.request<T>(currentPath, { signal: controller.signal })
        if (!controller.signal.aborted) setResult({ path: currentPath, data })
      } catch (e) {
        if (!controller.signal.aborted) setError(errorMessage(e))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [path, revision])
  return { data: result?.path === path ? result.data : null, error, loading }
}
export default function Operations() {
  const { user } = useAuthContext()
  const { t, tOr, translateMessage, humanize, formatDateTime, formatNumber } = useTranslation()
  const [revision, setRevision] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ action: '', shop_id: '', from: '', to: '', request_id: '' })
  const [draft, setDraft] = useState(filters)
  const canAudit = canAccessVerifiedAccount(user) && user.permissions.includes('platform.audit')
  const canHealth = canAccessVerifiedAccount(user) && user.permissions.includes('platform.health')
  const query = new URLSearchParams({ page: String(page) })
  for (const [k, v] of Object.entries(filters)) if (v) query.set(k, v)
  const audit = useAdminData<{ data: AuditRow[]; last_page: number; total: number }>(canAudit ? '/admin/audit?' + query : null, revision)
  const health = useAdminData<{ data: Health }>(canHealth ? '/admin/operations' : null, revision)
  const h = health.data?.data
  const columns: ColumnDef<AuditRow>[] = [
    {
      accessorKey: 'created_at',
      header: () => t('platform.table.timeUtc'),
      cell: ({ row }) => formatDateTime(row.original.created_at, 'UTC'),
    },
    { accessorKey: 'action', header: () => t('audit.action') },
    {
      accessorKey: 'shop_id',
      header: () => t('platform.table.shopId'),
      cell: ({ row }) => (row.original.shop_id ?? t('platform.platformLevel')),
    },
    { accessorKey: 'actor_id', header: () => t('platform.table.actorId') },
    {
      id: 'subject',
      header: () => t('platform.table.subject'),
      cell: ({ row }) =>
        [row.original.subject_type, row.original.subject_id].filter((v) => v !== null).join(' #') || t('common.dash'),
    },
    {
      accessorKey: 'request_id',
      header: () => t('platform.table.requestReference'),
      cell: ({ row }) => (
        <span className="small text-break">{row.original.request_id ?? t('platform.backgroundAction')}</span>
      ),
    },
  ]
  if (!canAccessVerifiedAccount(user))
    return (
      <Alert variant="warning">
        {t('platform.verifyForOperationsBefore')} <Link to="/">{t('platform.shopsTitle')}</Link>{' '}
        {t('platform.verifyForOperationsAfter')}
      </Alert>
    )
  if (!canAudit && !canHealth) return <Alert variant="danger">{t('platform.noPermission')}</Alert>
  return (
    <>
      <PageTitle title={t('platform.operationsTitle')} />
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
        <div>
          <h2>{t('platform.operationsTitle')}</h2>
          <p className="text-muted">{t('platform.operationsSubtitle')}</p>
        </div>
        <Button variant="outline-primary" disabled={audit.loading || health.loading} onClick={() => setRevision((v) => v + 1)}>
          {t('platform.refreshOperations')}
        </Button>
      </div>
      {(audit.error || health.error) && <Alert variant="danger">{translateMessage(audit.error || health.error)}</Alert>}
      {canHealth && (
        <>
          {health.loading && !h && <p role="status">{t('platform.loadingStatus')}</p>}
          {h && (
            <>
              <Row>
                <Col md={6} xl={3}>
                  <Card>
                    <CardBody>
                      <p className="text-muted">{t('platform.database')}</p>
                      <h4>{h.database}</h4>
                      <small>{t('platform.checkedAt', { date: formatDateTime(h.generated_at) })}</small>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={6} xl={3}>
                  <Card>
                    <CardBody>
                      <p className="text-muted">{t('platform.queuedJobs', { driver: h.queue_driver })}</p>
                      <h4>{h.queue ? formatNumber(h.queue.pending) : t('platform.notAvailable')}</h4>
                      <small>
                        {h.queue?.oldest_age_seconds !== null && h.queue?.oldest_age_seconds !== undefined
                          ? t('platform.oldestSeconds', { seconds: formatNumber(h.queue.oldest_age_seconds) })
                          : t('platform.noQueueAge')}
                      </small>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={6} xl={3}>
                  <Card>
                    <CardBody>
                      <p className="text-muted">{t('platform.failedJobs')}</p>
                      <h4>{formatNumber(h.failed_jobs)}</h4>
                      <small>{t('platform.failedJobsHelp')}</small>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={6} xl={3}>
                  <Card>
                    <CardBody>
                      <p className="text-muted">{t('platform.fileScanner')}</p>
                      <h4>{h.scanner_configured ? t('platform.configured') : t('platform.notConfigured')}</h4>
                      <small>{t('platform.scannerHelp')}</small>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              <Row>
                {(
                  [
                    ['platform.documentsProcessing', h.files.map((v) => ({ state: v.scan_status, count: v.count }))],
                    ['platform.productPhotos', h.product_photos.map((v) => ({ state: v.scan_status, count: v.count }))],
                    ['platform.customerImports', h.imports.map((v) => ({ state: v.status, count: v.count }))],
                  ] as [string, { state: string; count: number }[]][]
                ).map(([label, rows]) => (
                  <Col xl={4} key={label}>
                    <Card>
                      <CardBody>
                        <h4 className="card-title mb-3">{t(label)}</h4>
                        {rows.length ? (
                          rows.map((v) => (
                            <div className="d-flex justify-content-between border-bottom py-2" key={v.state}>
                              <span>{tOr('status.' + v.state, humanize(v.state))}</span>
                              <Badge bg={['failed', 'rejected', 'completed_with_errors'].includes(v.state) ? 'warning' : 'secondary'}>
                                {formatNumber(v.count)}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted">{t('platform.noRecordsYet')}</p>
                        )}
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
              {h.communications && <Card><CardBody><h4>{t('ops.communications')}</h4><p>{t('ops.providerHelp')}</p>{Object.entries(h.communications.providers).map(([channel,ready]) => <p key={channel}>{t('ops.'+channel)}: {t(ready?'ops.ready':'ops.notConfigured')}</p>)}{(!h.communications.processing.worker_active || !h.communications.processing.scheduler_active) && <Alert variant="warning">{t('ops.processingStopped')}</Alert>}<p>{t('ops.lastRun')}: {h.communications.processing.last_run_at ? formatDateTime(h.communications.processing.last_run_at) : t('platform.notAvailable')}</p>{h.communications.messages.map(row => <p key={row.status}>{t('ops.'+row.status)}: {formatNumber(row.count)}</p>)}</CardBody></Card>}
              <Alert variant="info">{t('platform.queueNotice')}</Alert>
            </>
          )}
        </>
      )}
      {canAudit && (
        <Card>
          <CardBody>
            <h3 className="card-title">{t('platform.activityAudit')}</h3>
            <p className="text-muted">{t('platform.auditHelp')}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setFilters(draft)
                setPage(1)
              }}>
              <Row className="g-3 mb-3">
                {(
                  [
                    ['action', 'platform.filter.action', 'text'],
                    ['shop_id', 'platform.filter.shopId', 'number'],
                    ['from', 'platform.filter.from', 'date'],
                    ['to', 'platform.filter.to', 'date'],
                    ['request_id', 'platform.filter.requestId', 'text'],
                  ] as const
                ).map(([key, label, type]) => (
                  <Col md={key === 'request_id' ? 4 : 2} key={key}>
                    <FormLabel htmlFor={'audit-' + key}>{t(label)}</FormLabel>
                    <FormControl
                      id={'audit-' + key}
                      type={type}
                      min={type === 'number' ? 1 : undefined}
                      value={draft[key]}
                      onChange={(e) => setDraft((v) => ({ ...v, [key]: e.target.value }))}
                    />
                  </Col>
                ))}
              </Row>
              <div className="d-flex gap-2 mb-3">
                <Button type="submit">{t('platform.applyFilters')}</Button>
                <Button
                  variant="outline-secondary"
                  type="button"
                  onClick={() => {
                    const empty = { action: '', shop_id: '', from: '', to: '', request_id: '' }
                    setDraft(empty)
                    setFilters(empty)
                    setPage(1)
                  }}>
                  {t('platform.clearFilters')}
                </Button>
              </div>
            </form>
            {audit.loading && <p role="status">{t('platform.loadingAudit')}</p>}
            <ReactTable columns={columns} data={audit.data?.data ?? []} />
            {!audit.loading && !audit.data?.data.length && <p>{t('platform.noAuditEvents')}</p>}
            <div className="d-flex align-items-center flex-wrap gap-3">
              <Button disabled={page <= 1 || audit.loading} onClick={() => setPage((p) => p - 1)}>
                {t('common.previous')}
              </Button>
              <span>
                {t('platform.auditSummary', {
                  events: formatNumber(audit.data?.total ?? 0),
                  page,
                  total: audit.data?.last_page ?? 1,
                })}
              </span>
              <Button disabled={page >= (audit.data?.last_page ?? 1) || audit.loading} onClick={() => setPage((p) => p + 1)}>
                {t('common.next')}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </>
  )
}
