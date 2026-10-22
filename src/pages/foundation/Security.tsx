import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody, FormLabel, FormControl, Button, Alert } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import { adminApi, useAuthContext } from '@/context/useAuthContext'
import { serverMessageKey, useTranslation } from '@/i18n'
const ACTIONS = [
  { action: 'password', label: 'auth.changePassword' },
  { action: 'email', label: 'auth.changeEmail' },
]
export default function Security() {
  const { refresh, user } = useAuthContext()
  const navigate = useNavigate()
  const { t, translateMessage } = useTranslation()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent<HTMLFormElement>, action: string) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await adminApi.auth('/' + action, Object.fromEntries(new FormData(e.currentTarget)))
      await refresh()
      navigate('/auth/sign-in')
    } catch (ex) {
      setError(ex instanceof Error ? serverMessageKey(ex.message) || ex.message : 'common.requestFailed')
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <PageTitle title={t('auth.accountSecurity')} />
      <h2>{t('auth.accountSecurity')}</h2>
      <p>{user?.email}</p>
      {error && <Alert variant="danger">{translateMessage(error)}</Alert>}
      {ACTIONS.map(({ action, label }) => (
        <Card key={action}>
          <CardBody>
            <h4>{t(label)}</h4>
            <form onSubmit={(e) => void submit(e, action)} style={{ maxWidth: 500 }}>
              <FormLabel htmlFor={action + '-current'}>{t('auth.currentPassword')}</FormLabel>
              <FormControl
                id={action + '-current'}
                name="current_password"
                type="password"
                autoComplete="current-password"
                required
                className="mb-3"
              />
              {action === 'password' ? (
                <>
                  <FormLabel htmlFor="new-password">{t('auth.newPassword')}</FormLabel>
                  <FormControl id="new-password" name="password" type="password" autoComplete="new-password" minLength={12} required />
                  <FormLabel htmlFor="confirm-password">{t('auth.confirmNewPassword')}</FormLabel>
                  <FormControl id="confirm-password" name="password_confirmation" type="password" autoComplete="new-password" required />
                </>
              ) : (
                <>
                  <FormLabel htmlFor="new-email">{t('auth.newEmail')}</FormLabel>
                  <FormControl id="new-email" name="email" type="email" required />
                </>
              )}
              <p className="mt-3 text-muted">
                {t('auth.signsOutAllSessions')}
                {user?.email_verification_required !== false && ' ' + t('auth.emailChangesRequireVerification')}
              </p>
              <Button type="submit" disabled={busy}>
                {t(label)}
              </Button>
            </form>
          </CardBody>
        </Card>
      ))}
    </>
  )
}
