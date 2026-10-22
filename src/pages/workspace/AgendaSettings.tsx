import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import type { Appointment } from '../../../../contracts/agenda'
import type { Customer } from '../../../../contracts/customers'
import type { ShopSettings } from '../../../../contracts/commerce'
import { timeOptions, wallTime } from '../../../../contracts/timezone'
import { useTranslation } from '@/i18n'
import {
  Editor,
  LoadState,
  Panel,
  RecordHistory,
  RecordPicker,
  Records,
  Status,
  options,
  toValues,
  useLoad,
  useWorkspace,
  type Field,
} from './shared'

export function Agenda() {
  const { t, formatDateTime } = useTranslation()
  const { request, shop, can } = useWorkspace()
  const zone = shop.timezone || 'UTC'
  const today = wallTime(new Date().toISOString(), zone).slice(0, 10)
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(new Date(Date.parse(today) + 7 * 86400000).toISOString().slice(0, 10))
  const [edit, setEdit] = useState<Appointment | 'new' | null>(null)
  const [customer, setCustomer] = useState<number | null>(null)
  const [overlap, setOverlap] = useState(false)
  const [fold, setFold] = useState('')
  const [key, setKey] = useState(crypto.randomUUID())
  const [action, setAction] = useState<Appointment | null>(null)
  const [history, setHistory] = useState<number | null>(null)
  const [params] = useSearchParams()
  const requestedAppointment = params.get('appointment_id')
  const linked = useLoad<{ data: Appointment }>(requestedAppointment ? '/appointments/' + encodeURIComponent(requestedAppointment) : null)
  useEffect(() => {
    if (linked.data) {
      const day = wallTime(linked.data.data.starts_at, zone).slice(0, 10)
      setFrom(day)
      setTo(day)
      setHistory(linked.data.data.id)
    }
  }, [linked.data, zone])
  const q = useLoad<{ data: Appointment[] }>('/appointments?' + new URLSearchParams({ from, to }))
  const start = (a: Appointment | 'new') => {
    setKey(crypto.randomUUID())
    setOverlap(false)
    setFold('')
    setCustomer(a === 'new' ? null : a.customer_id)
    setEdit(a)
  }
  return (
    <>
      <Panel
        title="agenda.appointments"
        action={can('agenda.write') && can('agenda.create') && <Button onClick={() => start('new')}>{t('agenda.newAppointment')}</Button>}>
        <div className="row mb-3">
          <Form.Group controlId="agenda-from" className="col-md-6">
            <Form.Label>{t('agenda.from')}</Form.Label>
            <Form.Control type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Form.Group>
          <Form.Group controlId="agenda-to" className="col-md-6">
            <Form.Label>{t('agenda.until')}</Form.Label>
            <Form.Control type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Form.Group>
        </div>
        <LoadState {...q} />
        {requestedAppointment && <LoadState {...linked} />}
        <Records
          headers={['agenda.thAppointment', 'agenda.thLocalTime', 'agenda.thCustomer', 'agenda.thStatus', 'agenda.thActions']}
          empty={!q.data?.data.length}>
          {q.data?.data.map((a) => (
            <tr key={a.id}>
              <td>
                {a.title}
                <small className="d-block">{a.notes}</small>
              </td>
              <td>
                {formatDateTime(a.starts_at, zone)}
                <br />
                {formatDateTime(a.ends_at, zone)}
              </td>
              <td>
                {a.customer?.first_name} {a.customer?.last_name}
                {a.order_id ? ' · ' + t('agenda.orderRef', { id: a.order_id }) : ''}
                {a.optical_record_id ? ' · ' + t('agenda.opticalRef', { id: a.optical_record_id }) : ''}
              </td>
              <td>
                <Status value={a.status} />
              </td>
              <td>
                <Button size="sm" variant="link" onClick={() => setHistory(a.id)}>
                  {t('agenda.history')}
                </Button>
                {a.status === 'scheduled' && can('agenda.write') && (can('agenda.edit') || can('agenda.archive')) && (
                  <>
                    {can('agenda.edit') && (
                      <Button size="sm" variant="link" onClick={() => start(a)}>
                        {t('agenda.editReschedule')}
                      </Button>
                    )}
                    <Button size="sm" variant="link" onClick={() => setAction(a)}>
                      {t('agenda.completeCancel')}
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </Records>
      </Panel>
      {history && <RecordHistory key={history} path={'/appointments/' + history + '/history'} />}
      {edit && (
        <Editor
          title={edit === 'new' ? 'agenda.newAppointment' : 'agenda.editAppointment'}
          fields={[
            { key: 'title', label: 'agenda.fieldTitle', required: true, maxLength: 150 },
            { key: 'starts_at', label: 'agenda.fieldStarts', type: 'datetime-local', required: true },
            { key: 'ends_at', label: 'agenda.fieldEnds', type: 'datetime-local', required: true },
            { key: 'order_id', label: 'agenda.fieldOrderId', type: 'number', min: 1 },
            { key: 'optical_record_id', label: 'agenda.fieldOpticalRecordId', type: 'number', min: 1 },
            { key: 'notes', label: 'agenda.fieldNotes', type: 'textarea', maxLength: 5000 },
            ...(edit === 'new' ? [] : [{ key: 'reason', label: 'agenda.fieldChangeReason', required: true, type: 'textarea' }]),
          ]}
          initial={edit === 'new' ? {} : { ...toValues(edit), starts_at: wallTime(edit.starts_at, zone), ends_at: wallTime(edit.ends_at, zone) }}
          close={() => setEdit(null)}
          onSave={async (v) => {
            const instant = (s: string) => {
              const o = timeOptions(s, zone)
              if (!o.length) throw new Error('agenda.timeUnavailable')
              if (o.length > 1 && !fold) throw new Error('agenda.timeAmbiguous')
              return o[fold === 'later' ? o.length - 1 : 0].instant
            }
            await request('/appointments' + (edit === 'new' ? '' : '/' + edit.id), {
              method: edit === 'new' ? 'POST' : 'PATCH',
              body: JSON.stringify({
                title: v.title,
                notes: v.notes || null,
                starts_at: instant(v.starts_at),
                ends_at: instant(v.ends_at),
                customer_id: customer,
                order_id: v.order_id ? Number(v.order_id) : null,
                optical_record_id: v.optical_record_id ? Number(v.optical_record_id) : null,
                allow_overlap: overlap,
                ...(edit === 'new' ? { creation_key: key } : { version: edit.version, reason: v.reason }),
              }),
            })
            await q.reload()
          }}>
          <RecordPicker<Customer>
            path="/customers"
            label="agenda.customer"
            value={customer}
            onChange={setCustomer}
            describe={(c) => c.first_name + ' ' + c.last_name}
          />
          <Form.Check className="mb-3" label={t('agenda.overlapConfirm')} checked={overlap} onChange={(e) => setOverlap(e.target.checked)} />
          <Form.Label>{t('agenda.clockChangeLabel', { zone })}</Form.Label>
          <Form.Select aria-label={t('agenda.clockChangeOccurrence')} value={fold} onChange={(e) => setFold(e.target.value)}>
            <option value="">{t('agenda.foldAsk')}</option>
            <option value="earlier">{t('agenda.foldEarlier')}</option>
            <option value="later">{t('agenda.foldLater')}</option>
          </Form.Select>
        </Editor>
      )}
      {action && (
        <Editor
          title="agenda.updateStatusTitle"
          fields={[
            {
              key: 'status',
              label: 'agenda.fieldStatus',
              required: true,
              options: options([...(can('agenda.edit') ? ['completed', 'no_show'] : []), ...(can('agenda.archive') ? ['cancelled'] : [])], 'status'),
            },
            { key: 'reason', label: 'agenda.fieldReason', required: true, type: 'textarea' },
          ]}
          close={() => setAction(null)}
          onSave={async (v) => {
            await request('/appointments/' + action.id + '/status', { method: 'PATCH', body: JSON.stringify({ ...v, version: action.version }) })
            await q.reload()
          }}
        />
      )}
    </>
  )
}
export function Settings() {
  const { t } = useTranslation()
  const { request, can } = useWorkspace()
  const q = useLoad<ShopSettings>('/shop/settings')
  const members = useLoad<{ data: { id: number; name: string; email: string; role: string; status: string }[] }>(
    can('members.view') ? '/shop/members' : null,
  )
  const [edit, setEdit] = useState(false)
  const [prefs, setPrefs] = useState<Record<string, boolean>>({})
  const s = q.data?.data.shop
  const fields: Field[] = [
    { key: 'name', label: 'agenda.fieldShopName', required: true, maxLength: 150 },
    { key: 'phone', label: 'agenda.fieldPhone', required: true },
    { key: 'address_line1', label: 'agenda.fieldAddressLine1', required: true },
    { key: 'address_line2', label: 'agenda.fieldAddressLine2' },
    { key: 'city', label: 'agenda.fieldCity', required: true },
    { key: 'postal_code', label: 'agenda.fieldPostalCode', required: true },
    { key: 'country', label: 'agenda.fieldCountry', required: true },
    { key: 'timezone', label: 'agenda.fieldTimezone', required: true, help: 'agenda.helpTimezone' },
    {
      key: 'currency',
      label: 'agenda.fieldCurrency',
      required: true,
      readOnly: q.data?.data.currency_locked,
      options: q.data?.currencies.map((c) => ({ value: c.code, label: c.code + ' — ' + c.name })),
    },
    { key: 'stock_location', label: 'agenda.fieldStockLocation', required: true },
  ]
  const notificationPreferences: [string, string][] = [
    ['stock', 'agenda.prefStock'],
    ['orders', 'agenda.prefOrders'],
    ['imports', 'agenda.prefImports'],
    ['agenda', 'agenda.prefAgenda'],
  ]
  return (
    <>
      <Panel
        title="module.settings"
        action={
          can('shop.update') &&
          s && (
            <Button
              onClick={() => {
                setPrefs(s.notification_preferences ?? { stock: true, orders: true, imports: true, agenda: true })
                setEdit(true)
              }}>
              {t('agenda.editSettings')}
            </Button>
          )
        }>
        <LoadState {...q} />
        {s && (
          <>
            <dl className="row">
              {fields.map((f) => (
                <div key={f.key} className="col-md-4">
                  <dt>{t(f.label)}</dt>
                  <dd>
                    {String(
                      f.key === 'stock_location' ? q.data?.data.stock_location : (s as unknown as Record<string, unknown>)[f.key] ?? t('common.dash'),
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            {q.data?.data.currency_locked && <Alert variant="info">{t('agenda.currencyLocked')}</Alert>}
          </>
        )}
      </Panel>
      {can('members.view') && (
        <Panel title="agenda.membershipsTitle">
          <LoadState {...members} />
          <Records headers={['agenda.thName', 'agenda.thEmail', 'agenda.thRole', 'agenda.thStatus']} empty={!members.data?.data.length}>
            {members.data?.data.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.email}</td>
                <td>{m.role}</td>
                <td>
                  <Status value={m.status} />
                </td>
              </tr>
            ))}
          </Records>
        </Panel>
      )}
      {edit && s && (
        <Editor
          title="agenda.shopSettingsTitle"
          fields={fields}
          initial={{ ...toValues(s), stock_location: q.data?.data.stock_location ?? '' }}
          close={() => setEdit(false)}
          onSave={async (v) => {
            const payload = Object.fromEntries(fields.map((f) => [f.key, v[f.key] || null]))
            await request('/shop/settings', {
              method: 'PATCH',
              body: JSON.stringify({ ...payload, settings_version: s.settings_version, notification_preferences: prefs }),
            })
            await q.reload()
          }}>
          <h5>{t('agenda.notificationsTitle')}</h5>
          {notificationPreferences.map(([k, label]) => (
            <Form.Check key={k} label={t(label)} checked={prefs[k] ?? true} onChange={(e) => setPrefs({ ...prefs, [k]: e.target.checked })} />
          ))}
        </Editor>
      )}
    </>
  )
}
