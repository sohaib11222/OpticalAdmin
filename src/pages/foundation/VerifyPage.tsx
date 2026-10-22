import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card, CardBody, Button, Alert } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import { adminApi, useAuthContext } from '@/context/useAuthContext'
import { serverMessageKey, useTranslation } from '@/i18n'
export default function VerifyPage() {
  const [params] = useSearchParams()
  const { refresh } = useAuthContext()
  const { t, translateMessage } = useTranslation()
  const [message, setMessage] = useState('auth.verifyPrompt')
  const [busy, setBusy] = useState(false)
  const verify = async () => {
    const url = params.get('url') || ''
    if (!/^\/api\/v1\/auth\/verify-email\/\d+\/[a-f0-9]{40}\?/.test(url)) {
      setMessage('auth.invalidVerifyLink')
      return
    }
    setBusy(true)
    try {
      await adminApi.request(url.slice('/api/v1'.length))
      await refresh()
      setMessage('auth.emailVerified')
    } catch (e) {
      setMessage(e instanceof Error ? serverMessageKey(e.message) || e.message : 'auth.verificationFailed')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Card className="mx-auto" style={{ maxWidth: 500 }}>
      <PageTitle title={t('auth.verifyYourEmail')} />
      <CardBody>
        <h3>{t('auth.verifyYourEmail')}</h3>
        <Alert variant="info">{translateMessage(message)}</Alert>
        <Button onClick={() => void verify()} disabled={busy}>
          {t('auth.verifyEmail')}
        </Button>
        <Link className="d-block mt-3" to="/">
          {t('auth.continueToAccount')}
        </Link>
      </CardBody>
    </Card>
  )
}
