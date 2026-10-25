import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardBody, Button, Alert, Col, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import TextFormInput from '@/components/form/TextFormInput'
import PasswordFormInput from '@/components/form/PasswordFormInput'
import PageTitle from '@/components/PageTitle'
import { adminApi, useAuthContext } from '@/context/useAuthContext'
import { serverMessageKey, useTranslation } from '@/i18n'
import { ApiError, safeReturn, type SessionUser, type ApiEnvelope } from '../../../../contracts/session'
type Values = {
  email: string
  password?: string
  password_confirmation?: string
}
export default function AuthPage({ mode }: { mode: 'login' | 'forgot' | 'reset' }) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { saveSession, user, loading } = useAuthContext()
  const { t, translateMessage } = useTranslation()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const headingKey = mode === 'login' ? 'auth.signIn' : mode === 'forgot' ? 'auth.forgotPassword' : 'auth.resetHeading'
  const schema = yup.object({
    email: yup.string().email().required(),
    password:
      mode === 'forgot'
        ? yup.string().optional()
        : mode === 'login'
          ? yup.string().required()
          : yup.string().min(12).matches(/[a-z]/i).matches(/\d/).required(),
    password_confirmation:
      mode === 'reset'
        ? yup
            .string()
            .oneOf([yup.ref('password')], translateMessage('Passwords do not match'))
            .required()
        : yup.string().optional(),
  })
  const {
    control,
    handleSubmit,
    setError: fieldError,
    formState: { isSubmitting },
  } = useForm<Values>({
    resolver: yupResolver(schema),
    defaultValues: { email: params.get('email') || '' },
  })
  const submit = handleSubmit(async (values) => {
    setError('')
    setMessage('')
    try {
      if (mode === 'login') {
        const result = await adminApi.auth<ApiEnvelope<SessionUser>>('/login', values)
        saveSession(result.data)
        navigate(safeReturn(params.get('redirectTo')), { replace: true })
      } else {
        const result = await adminApi.auth<{ message: string }>(
          mode === 'forgot' ? '/forgot-password' : '/reset-password',
          mode === 'forgot' ? { email: values.email } : { ...values, token: params.get('token') || '' },
        )
        setMessage(serverMessageKey(result.message) || result.message)
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setError(serverMessageKey(e.message) || e.message)
        for (const [key, messages] of Object.entries(e.errors)) fieldError(key as keyof Values, { message: translateMessage(messages[0]) })
      } else setError('auth.connectionFailed')
    }
  })
  if (mode === 'login' && loading) return <p role="status">{t('auth.loadingSession')}</p>
  if (mode === 'login' && user) return <Navigate to={safeReturn(params.get('redirectTo'))} replace />
  return (
    <Row className="justify-content-center">
      <PageTitle title={t(headingKey)} />
      <Col xs={12}>
        <Card>
          <CardBody className="p-4">
            <div className="mb-4">

              <h4>{t(headingKey)}</h4>
              <p className="text-muted">{t('app.tagline')}</p>
            </div>
            <form onSubmit={submit} noValidate>
              <TextFormInput control={control} name="email" label={t('auth.email')} type="email" containerClassName="mb-3" />
              {mode !== 'forgot' && <PasswordFormInput control={control} name="password" label={t('auth.password')} containerClassName="mb-3" />}
              {mode === 'reset' && (
                <PasswordFormInput control={control} name="password_confirmation" label={t('auth.confirmPassword')} containerClassName="mb-3" />
              )}
              {error && <Alert variant="danger">{translateMessage(error)}</Alert>}
              {message && <Alert variant="success">{translateMessage(message)}</Alert>}
              <Button type="submit" className="w-100" disabled={isSubmitting}>
                {isSubmitting
                  ? t('common.pleaseWait')
                  : mode === 'login'
                    ? t('auth.signIn')
                    : mode === 'forgot'
                      ? t('auth.sendResetLink')
                      : t('auth.resetSubmit')}
              </Button>
              <div className="d-flex justify-content-between mt-3">
                <Link to="/auth/sign-in">{t('auth.signIn')}</Link>
                <Link to="/auth/forgot-password">{t('auth.forgotPassword')}</Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}
