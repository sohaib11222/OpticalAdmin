import { Link } from 'react-router-dom'
import { canAccessVerifiedAccount } from '../../../../contracts/session'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Button, Card, CardBody, FormControl, FormSelect, Row, Col, Modal, Badge } from 'react-bootstrap'
import type { SessionUser } from '../../../../contracts/session'
import type { ColumnDef } from '@tanstack/react-table'
import ReactTable from '@/components/Table'
import PageTitle from '@/components/PageTitle'
import LanguageToggle from '@/components/LanguageToggle'
import { adminApi, useAuthContext } from '@/context/useAuthContext'
import { useTranslation } from '@/i18n'
import { errorMessage } from '../workspace/shared'
type Shop = NonNullable<SessionUser['shop']> & {
  created_at: string
  memberships: { user: { name: string; email: string; email_verified_at: string | null } }[]
}
export default function Home() {
  const { user, refresh } = useAuthContext()
  const { t, tOr, translateMessage, humanize, formatDateTime } = useTranslation()
  const verificationAllowed = canAccessVerifiedAccount(user)
  const requestVersion = useRef(0)
  const [rows, setRows] = useState<Shop[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [message, setMessage] = useState('')
  const [page, setPage] = useState(1)
  const [last, setLast] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [selected, setSelected] = useState<Shop | null>(null)
  const load = useCallback(async () => {
    if (!verificationAllowed) return
    const version = ++requestVersion.current
    setBusy(true)
    try {
      const query = new URLSearchParams({ page: String(page), per_page: '10', search, status })
      const [list, overview] = await Promise.all([
        adminApi.request<{ data: Shop[]; last_page: number }>('/admin/shops?' + query),
        adminApi.request<{ data: Record<string, number> }>('/admin/overview'),
      ])
      if (version !== requestVersion.current) return
      setRows(list.data)
      setLast(list.last_page)
      setStats(overview.data)
    } catch (e) {
      if (version === requestVersion.current) setMessage(errorMessage(e))
    } finally {
      if (version === requestVersion.current) setBusy(false)
    }
  }, [verificationAllowed, page, search, status])
  useEffect(() => {
    void load()
  }, [load])
  const update = async (shop: Shop, next: string) => {
    const question = t(next === 'active' ? 'platform.confirmActivate' : 'platform.confirmSuspend', { name: shop.name })
    if (!window.confirm(question)) return
    setBusy(true)
    try {
      await adminApi.request('/admin/shops/' + shop.id + '/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: next, expected_status: shop.status }),
      })
      setMessage('platform.statusUpdated')
      await load()
    } catch (e) {
      setMessage(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  const columns: ColumnDef<Shop>[] = [
    {
      id: 'manage',
      header: () => t('platform.table.shopData'),
      cell: ({ row }) =>
        user?.permissions.includes('shops.workspace') ? (
          <Link className="btn btn-sm btn-primary" to={'/workspace/dashboard?shop=' + row.original.id}>
            {t('platform.manageShop')}
          </Link>
        ) : null,
    },
    { accessorKey: 'name', header: () => t('platform.table.shop') },
    {
      accessorKey: 'status',
      header: () => t('platform.table.shopStatus'),
      cell: ({ row }) => tOr('status.' + row.original.status, humanize(row.original.status)),
    },
    {
      id: 'verification',
      header: () => t('platform.table.ownerEmail'),
      cell: ({ row }) =>
        row.original.memberships.map(({ user }) => (
          <div key={user.email}>
            <span>{user.email}</span>{' '}
            <Badge bg={user.email_verified_at ? 'success' : 'warning'}>
              {user.email_verified_at ? t('platform.verifiedBadge') : t('platform.awaitingVerification')}
            </Badge>
          </div>
        )),
    },
    {
      id: 'details',
      header: () => t('platform.table.businessDetails'),
      cell: ({ row }) => (
        <Button size="sm" variant="outline-primary" onClick={() => setSelected(row.original)}>
          {t('platform.reviewRegistration')}
        </Button>
      ),
    },
    {
      accessorKey: 'created_at',
      header: () => t('platform.table.created'),
      cell: ({ row }) => formatDateTime(row.original.created_at, 'UTC'),
    },
    {
      id: 'actions',
      header: () => t('platform.table.accountAccess'),
      cell: ({ row }) => (
        <Button
          size="sm"
          variant={row.original.status === 'active' ? 'outline-danger' : 'outline-success'}
          disabled={busy}
          onClick={() => void update(row.original, row.original.status === 'active' ? 'suspended' : 'active')}>
          {row.original.status === 'active' ? t('platform.suspend') : t('platform.activate')}
        </Button>
      ),
    },
  ]
  return (
    <>
      <Modal show={!!selected} onHide={() => setSelected(null)} centered aria-labelledby="shop-review-title">
        <Modal.Header closeButton>
          <Modal.Title id="shop-review-title">{t('platform.registrationDetails')}</Modal.Title>
          <LanguageToggle variant="inline" className="ms-auto me-2" />
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <>
              <h4>{selected.name}</h4>
              <dl>
                {(
                  [
                    ['platform.detail.phone', selected.phone],
                    ['platform.detail.address', [selected.address_line1, selected.address_line2].filter(Boolean).join(', ')],
                    ['platform.detail.city', selected.city],
                    ['platform.detail.postalCode', selected.postal_code],
                    ['platform.detail.country', selected.country],
                    ['platform.detail.timezone', selected.timezone],
                  ] as [string, string | null | undefined][]
                ).map(([label, value]) => (
                  <div className="mb-2" key={label}>
                    <dt>{t(label)}</dt>
                    <dd className="mb-0">{value || t('platform.notSuppliedExisting')}</dd>
                  </div>
                ))}
              </dl>
              <h5>{t('platform.shopOwner')}</h5>
              {selected.memberships.map(({ user }) => (
                <p key={user.email}>
                  {user.name} · {user.email}
                  <br />
                  {user.email_verified_at ? t('platform.emailVerified') : t('platform.emailVerificationPending')}
                </p>
              ))}
              <p className="text-muted mb-0">{t('platform.approvalNote')}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelected(null)}>
            {t('common.close')}
          </Button>
        </Modal.Footer>
      </Modal>
      <PageTitle title={t('platform.shopsTitle')} />
      <h2 className="mb-3">{t('platform.shopsTitle')}</h2>
      {message && <Alert variant="info">{translateMessage(message)}</Alert>}
      {!canAccessVerifiedAccount(user) ? (
        <Card>
          <CardBody>
            <h3>{t('platform.verifyYourEmail')}</h3>
            <Button
              onClick={() => {
                void adminApi
                  .auth<{ message: string }>('/verification-notification', {})
                  .then((r) => setMessage(r.message))
                  .catch((e) => setMessage(errorMessage(e)))
              }}>
              {t('platform.resendVerificationEmail')}
            </Button>
            <Button variant="link" onClick={() => void refresh()}>
              {t('platform.refreshAccountStatus')}
            </Button>
          </CardBody>
        </Card>
      ) : (
        <>
          <Row>
            {Object.entries(stats).map(([key, value]) => (
              <Col md={3} key={key}>
                <Card>
                  <CardBody>
                    <p className="text-muted text-capitalize">{tOr('platform.stat.' + key, humanize(key))}</p>
                    <h3>{value}</h3>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
          <Card>
            <CardBody>
              <div className="d-flex flex-column flex-md-row gap-2 mb-3">
                <FormControl
                  aria-label={t('common.searchPlaceholder')}
                  placeholder={t('common.searchPlaceholder')}
                  value={search}
                  onChange={(e) => {
                    setPage(1)
                    setSearch(e.target.value)
                  }}
                />
                <FormSelect
                  aria-label={t('platform.filterStatus')}
                  value={status}
                  onChange={(e) => {
                    setPage(1)
                    setStatus(e.target.value)
                  }}>
                  <option value="">{t('platform.allStatuses')}</option>
                  {['pending', 'active', 'suspended'].map((value) => (
                    <option key={value} value={value}>
                      {tOr('status.' + value, humanize(value))}
                    </option>
                  ))}
                </FormSelect>
                <Button onClick={() => void load()} disabled={busy}>
                  {t('platform.refresh')}
                </Button>
              </div>
              {busy && <p role="status">{t('common.loading')}</p>}
              <ReactTable columns={columns} data={rows} />
              {!busy && !rows.length && <p>{t('platform.noShops')}</p>}
              <div className="d-flex align-items-center gap-3">
                <Button disabled={page <= 1 || busy} onClick={() => setPage(page - 1)}>
                  {t('common.previous')}
                </Button>
                <span>{t('common.pageOf', { page, total: last })}</span>
                <Button disabled={page >= last || busy} onClick={() => setPage(page + 1)}>
                  {t('common.next')}
                </Button>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </>
  )
}
