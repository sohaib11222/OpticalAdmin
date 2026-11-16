import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody, FormLabel, FormControl, Button, Alert } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import { adminApi, useAuthContext } from '@/context/useAuthContext'
import { useTranslation } from '@/i18n'

type Stage = 'start' | 'code' | 'verified'

export default function Security() {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const { t, translateError } = useTranslation()
  const [stage, setStage] = useState<Stage>('start')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    if (resendIn <= 0) return
    const timer = window.setInterval(() => setResendIn((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [resendIn])

  async function sendCode() {
    setBusy(true)
    setError('')
    try {
      const result = await adminApi.auth<{ data: { resend_after_seconds: number } }>('/password/change-code', {})
      setStage('code')
      setCode('')
      setResendIn(result.data.resend_after_seconds)
    } catch (cause) {
      setError(cause instanceof Error ? translateError(cause.message) : t('common.requestFailed'))
    } finally {
      setBusy(false)
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await adminApi.auth('/password/verify-code', { code })
      setStage('verified')
      setCode('')
    } catch (cause) {
      setError(cause instanceof Error ? translateError(cause.message) : t('common.requestFailed'))
    } finally {
      setBusy(false)
    }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await adminApi.auth('/password', Object.fromEntries(new FormData(event.currentTarget)))
      navigate('/auth/sign-in', { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? translateError(cause.message) : t('common.requestFailed'))
    } finally {
      setBusy(false)
    }
  }

  return <>
    <PageTitle title={t('auth.accountSecurity')} />
    <h2>{t('auth.accountSecurity')}</h2>
    <Card><CardBody style={{ maxWidth: 500 }}>
      <p className="text-muted mb-1">{t('auth.registeredEmail')}</p>
      <p className="fw-semibold">{user?.email}</p>
      {error && <Alert variant="danger">{error}</Alert>}
      {stage === 'start' && <><p className="text-muted">{t('auth.passwordCodeHelp')}</p><Button disabled={busy} onClick={() => void sendCode()}>{busy ? t('common.pleaseWait') : t('auth.sendCode')}</Button></>}
      {stage === 'code' && <form onSubmit={(event) => void verifyCode(event)}><p className="text-muted">{t('auth.enterCodeHelp')}</p><FormLabel htmlFor="admin-password-code">{t('auth.verificationCode')}</FormLabel><FormControl id="admin-password-code" inputMode="numeric" autoComplete="one-time-code" maxLength={8} pattern="[0-9]{8}" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 8))} required className="mb-3" /><div className="d-flex flex-wrap gap-2"><Button type="submit" disabled={busy || code.length !== 8}>{busy ? t('common.pleaseWait') : t('auth.verifyCode')}</Button><Button type="button" variant="outline-secondary" disabled={busy || resendIn > 0} onClick={() => void sendCode()}>{resendIn > 0 ? t('auth.resendIn', { seconds: resendIn }) : t('auth.resendCode')}</Button></div></form>}
      {stage === 'verified' && <form onSubmit={(event) => void savePassword(event)}><p className="text-success">{t('auth.codeVerified')}</p><FormLabel htmlFor="admin-new-password">{t('auth.newPassword')}</FormLabel><FormControl id="admin-new-password" name="password" type="password" autoComplete="new-password" minLength={12} required className="mb-3" /><FormLabel htmlFor="admin-confirm-password">{t('auth.confirmNewPassword')}</FormLabel><FormControl id="admin-confirm-password" name="password_confirmation" type="password" autoComplete="new-password" minLength={12} required className="mb-3" /><p className="text-muted">{t('auth.signsOutAllSessions')}</p><Button type="submit" disabled={busy}>{busy ? t('common.pleaseWait') : t('auth.saveNewPassword')}</Button></form>}
    </CardBody></Card>
  </>
}
