import ProductVariations from "../../../../contracts/operations/ProductVariations";
import type { Product } from "../../../../contracts/commerce";
import Output from '../../../../contracts/operations/Output'
import { useId, useMemo, type ReactNode } from 'react'
import { Alert, Button, Card, Form, Modal, Table } from 'react-bootstrap'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuthContext } from '@/context/useAuthContext'
import { useTranslation } from '@/i18n'
import LanguageToggle from '@/components/LanguageToggle'
import { useWorkspace } from './shared'
import { Context, type UI } from '../../../../contracts/operations/shared'
import Employees, { ActivityLog } from '../../../../contracts/operations/Employees'
import Reminders, { Followups } from '../../../../contracts/operations/Reminders'
import Communications from '../../../../contracts/operations/Communications'
import Payments from '../../../../contracts/operations/Payments'
import Daily from '../../../../contracts/operations/Daily'

export function workspaceUrl(path: string, shop: number): string {
  const [pathname, search] = path.split('?')
  const params = new URLSearchParams(search)
  params.set('shop', String(shop))
  const parts = pathname.split('/').filter(Boolean)
  if (parts[1]) params.set('record', parts[1])
  return '/workspace/' + (parts[0] === 'operations' ? 'daily' : parts[0]) + '?' + params
}
const baseUI: Omit<UI, 'Link'> = {
  Panel: ({ title, actions, children }) => (
    <Card className="mb-3">
      <Card.Body>
        {(title || actions) && (
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
            <h4 className="mb-0">{title}</h4>
            {actions}
          </div>
        )}
        {children}
      </Card.Body>
    </Card>
  ),
  Stack: ({ children, inline }) => <div className={inline ? 'd-flex flex-wrap align-items-end gap-2' : 'd-flex flex-column gap-3'}>{children}</div>,
  Button: ({ children, secondary, ...props }) => (
    <Button variant={secondary ? 'outline-primary' : 'primary'} type="button" {...props}>
      {children}
    </Button>
  ),
  Field: function Field({ label, value, onChange, type = 'text', options, required, disabled, min, max, hint }) {
    const id = useId()
    return (
      <Form.Group className="flex-grow-1">
        <Form.Label htmlFor={id}>{label}</Form.Label>
        {type === 'select' ? (
          <Form.Select id={id} value={value} onChange={(e) => onChange(e.target.value)} required={required} disabled={disabled}>
            {options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Form.Select>
        ) : type === 'textarea' ? (
          <Form.Control
            id={id}
            as="textarea"
            rows={4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            disabled={disabled}
          />
        ) : (
          <Form.Control
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            disabled={disabled}
            min={min}
            max={type === 'number' ? max : undefined}
            maxLength={type === 'text' ? max : undefined}
          />
        )}
        {hint && <Form.Text>{hint}</Form.Text>}
      </Form.Group>
    )
  },
  Table: function Records({ headers, rows }) {
    const { t } = useTranslation()
    return (
      <Table responsive hover className="align-middle">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, n) => (
              <tr key={n}>
                {row.map((cell, i) => (
                  <td key={i}>{cell}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length}>{t('ops.noRecords')}</td>
            </tr>
          )}
        </tbody>
      </Table>
    )
  },
  Dialog: ({ title, children, onClose }) => (
    <Modal show onHide={onClose} size="lg" scrollable backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
        <LanguageToggle />
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  ),
  Alert: ({ children, error }) => (
    <Alert variant={error ? 'danger' : 'info'} role={error ? 'alert' : 'status'}>
      {children}
    </Alert>
  ),
}
export default function OperationsWorkspace({ module, customerId, compact = false, product }: { module: string; customerId?: number; compact?: boolean; product?: Product }) {
  const { request, can, shop, prefix } = useWorkspace()
  const { user } = useAuthContext()
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const value = useMemo(
    () => ({
      ui: { ...baseUI, Link: ({ to, children }: { to: string; children: ReactNode }) => <Link to={workspaceUrl(to, shop.id)}>{children}</Link> },
      request,
      can,
      t,
      params,
      actorId: user?.id ?? 0,
      timezone: shop.timezone ?? 'UTC',
      invitationUrl: (token: string) =>
        (import.meta.env.VITE_SHOP_URL || 'http://localhost:5173/pulse-ui').replace(/\/$/, '') + '/auth/invitation#' + token,
    }),
    [request, can, shop, t, params, user?.id],
  )
  return (
    <Context.Provider value={value}>
      {module === 'variations' && product ? <ProductVariations product={product} imageBase={'/api/v1' + prefix} /> : module.startsWith('output-') ? (
        <Output module={module.slice(7)} customerId={customerId} />
      ) : module === 'employees' ? (
        <Employees />
      ) : module === 'activity' ? (
        <ActivityLog />
      ) : module === 'reminders' ? (
        <Reminders customerId={customerId} />
      ) : module === 'followups' ? (
        <Followups />
      ) : module === 'communications' ? (
        <Communications customerId={customerId} />
      ) : module === 'payments' ? (
        <Payments customerId={customerId} />
      ) : (
        <Daily compact={compact} />
      )}
    </Context.Provider>
  )
}
