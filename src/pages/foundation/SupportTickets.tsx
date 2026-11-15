import { useCallback, useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, CardBody, Col, Form, FormControl, FormSelect, Modal, Row } from 'react-bootstrap'
import { toast } from 'react-toastify'
import PageTitle from '@/components/PageTitle'
import { adminApi, useAuthContext } from '@/context/useAuthContext'
import { errorMessage } from '../workspace/shared'
import { canAccessVerifiedAccount } from '../../../../contracts/session'

type Ticket = { id:number; public_id:string; shop_id:number; shop_name:string; creator_name:string; creator_email:string; assignee_name?:string|null; assigned_to?:number|null; subject:string; category:string; priority:string; status:string; version:number; created_at:string; updated_at:string }
type Detail = { data: Ticket; messages: { id:number; body:string; created_at:string; sender_name:string; sender_account_type:string }[]; attachments: { id:number; message_id:number|null; file_id:number; filename:string; title:string|null; mime:string; size:number; scan_status:string }[] }
type Admin = { id:number; name:string; email:string }
const statuses = ['open','in_progress','waiting_for_response','resolved','closed']
const priorities = ['low','normal','high','urgent']

export default function SupportTickets() {
  const { user } = useAuthContext()
  const permitted = canAccessVerifiedAccount(user) && !!user?.permissions.includes('shops.support.manage')
  const [rows, setRows] = useState<Ticket[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [filters, setFilters] = useState({ status:'', priority:'', category:'', search:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reply, setReply] = useState('')

  const load = useCallback(async () => {
    if (!permitted) return
    setLoading(true); setError('')
    try {
      const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value) as [string,string][])
      const response = await adminApi.request<{data:Ticket[]}>('/admin/support/tickets?' + query)
      setRows(response.data)
    } catch (e) { setError(errorMessage(e)) }
    finally { setLoading(false) }
  }, [filters, permitted])
  const loadDetail = useCallback(async (id:number) => {
    try { setDetail(await adminApi.request<Detail>('/admin/support/tickets/' + id)) }
    catch (e) { toast.error(errorMessage(e)) }
  }, [])
  useEffect(() => { void load(); const timer = setInterval(() => void load(), 20000); return () => clearInterval(timer) }, [load])
  useEffect(() => { if (!permitted) return; void adminApi.request<{data:Admin[]}>('/admin/support/administrators').then((r) => setAdmins(r.data)).catch(() => {}) }, [permitted])
  useEffect(() => { if (selected) void loadDetail(selected) }, [selected, loadDetail])
  const save = async (patch: Partial<Pick<Ticket,'status'|'priority'|'assigned_to'>>) => {
    if (!detail) return
    try {
      await adminApi.request('/admin/support/tickets/' + detail.data.id, { method:'PATCH', body:JSON.stringify({ ...patch, version:detail.data.version, assigned_to: patch.assigned_to === undefined ? detail.data.assigned_to ?? null : patch.assigned_to }) })
      toast.success('Ticket updated.'); await Promise.all([load(), loadDetail(detail.data.id)])
    } catch (e) { toast.error(errorMessage(e)) }
  }
  const sendReply = async () => {
    if (!detail || !reply.trim()) return
    try {
      await adminApi.request('/admin/support/tickets/' + detail.data.id + '/messages', { method:'POST', body:JSON.stringify({ body:reply }) })
      setReply(''); toast.success('Reply sent.'); await Promise.all([load(), loadDetail(detail.data.id)])
    } catch (e) { toast.error(errorMessage(e)) }
  }
  if (!permitted) return <Alert variant="danger">You do not have permission to manage support tickets.</Alert>
  return <>
    <PageTitle title="Support tickets" />
    <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3"><div><h2>Support tickets</h2><p className="text-muted mb-0">Requests from every shop, with conversations, ownership and resolution tracking.</p></div><Button variant="outline-primary" onClick={() => void load()} disabled={loading}>Refresh</Button></div>
    {error && <Alert variant="danger">{error}</Alert>}
    <Card><CardBody><Row className="g-2 mb-3"><Col md={3}><FormSelect value={filters.status} onChange={(event) => setFilters((v) => ({...v,status:event.target.value}))}><option value="">All statuses</option>{statuses.map((value) => <option key={value}>{value}</option>)}</FormSelect></Col><Col md={3}><FormSelect value={filters.priority} onChange={(event) => setFilters((v) => ({...v,priority:event.target.value}))}><option value="">All priorities</option>{priorities.map((value) => <option key={value}>{value}</option>)}</FormSelect></Col><Col md={3}><FormSelect value={filters.category} onChange={(event) => setFilters((v) => ({...v,category:event.target.value}))}><option value="">All categories</option>{['general','account','technical','billing','integration','data'].map((value) => <option key={value}>{value}</option>)}</FormSelect></Col><Col md={3}><FormControl placeholder="Search ticket, shop or requester" value={filters.search} onChange={(event) => setFilters((v) => ({...v,search:event.target.value}))} /></Col></Row>{loading && <p>Loading tickets…</p>}<div className="table-responsive"><table className="table align-middle"><thead><tr><th>Ticket</th><th>Shop / requester</th><th>Priority</th><th>Status</th><th>Assigned</th><th>Updated</th><th /></tr></thead><tbody>{rows.map((ticket) => <tr key={ticket.id}><td><strong>{ticket.subject}</strong><br/><small>{ticket.public_id} · {ticket.category}</small></td><td>{ticket.shop_name}<br/><small>{ticket.creator_name} · {ticket.creator_email}</small></td><td><Badge bg={ticket.priority === 'urgent' ? 'danger' : 'secondary'}>{ticket.priority}</Badge></td><td><Badge bg={ticket.status === 'resolved' ? 'success' : ticket.status === 'closed' ? 'secondary' : 'primary'}>{ticket.status.replaceAll('_',' ')}</Badge></td><td>{ticket.assignee_name || 'Unassigned'}</td><td>{new Date(ticket.updated_at).toLocaleString()}</td><td><Button size="sm" onClick={() => setSelected(ticket.id)}>Open</Button></td></tr>)}</tbody></table></div>{!loading && !rows.length && <p className="text-muted text-center py-4">No support tickets match these filters.</p>}</CardBody></Card>
    <Modal show={!!selected} onHide={() => setSelected(null)} size="xl" scrollable><Modal.Header closeButton><Modal.Title>{detail?.data.subject || 'Support ticket'}</Modal.Title></Modal.Header><Modal.Body>{!detail ? <p>Loading ticket…</p> : <div className="d-grid gap-4"><Alert variant="light"><strong>{detail.data.shop_name}</strong> · {detail.data.creator_name} · {detail.data.category}<br/>{detail.data.public_id}</Alert><Row className="g-3"><Col md={4}><Form.Label>Status</Form.Label><FormSelect value={detail.data.status} onChange={(event) => void save({ status:event.target.value })}>{statuses.map((value) => <option key={value}>{value}</option>)}</FormSelect></Col><Col md={4}><Form.Label>Priority</Form.Label><FormSelect value={detail.data.priority} onChange={(event) => void save({ priority:event.target.value })}>{priorities.map((value) => <option key={value}>{value}</option>)}</FormSelect></Col><Col md={4}><Form.Label>Assigned administrator</Form.Label><FormSelect value={detail.data.assigned_to || ''} onChange={(event) => void save({ assigned_to:event.target.value ? Number(event.target.value) : null })}><option value="">Unassigned</option>{admins.map((admin) => <option key={admin.id} value={admin.id}>{admin.name} · {admin.email}</option>)}</FormSelect></Col></Row><div className="border rounded p-3"><strong>Conversation</strong><div className="d-grid gap-3 mt-3">{detail.messages.map((message) => <div key={message.id} className={message.sender_account_type === 'admin' ? 'bg-primary-subtle rounded p-3 ms-md-5' : 'border rounded p-3 me-md-5'}><strong>{message.sender_name}</strong><p className="mb-1 mt-2" style={{whiteSpace:'pre-wrap'}}>{message.body}</p><small className="text-muted">{new Date(message.created_at).toLocaleString()}</small></div>)}</div></div>{!!detail.attachments.length && <div><strong>Attachments</strong><div className="d-flex flex-wrap gap-2 mt-2">{detail.attachments.map((attachment) => <Button key={attachment.id} variant="outline-secondary" size="sm" disabled={attachment.scan_status !== 'clean'} href={`/api/v1/admin/support/tickets/${detail.data.id}/attachments/${attachment.id}`}>{attachment.title || attachment.filename} · {attachment.scan_status}</Button>)}</div></div>}<Form.Group><Form.Label>Reply to shop</Form.Label><Form.Control as="textarea" rows={4} maxLength={8000} value={reply} onChange={(event) => setReply(event.target.value)} /><Button className="mt-2" disabled={!reply.trim() || detail.data.status === 'closed'} onClick={() => void sendReply()}>Send reply</Button></Form.Group></div>}</Modal.Body></Modal>
  </>
}
