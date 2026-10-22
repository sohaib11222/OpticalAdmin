import { yupResolver } from '@hookform/resolvers/yup'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as yup from 'yup'

import { useAuthContext } from '@/context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'

import type { SessionUser as UserType, ApiEnvelope } from '../../../../../../contracts/session'
import { adminApi } from '@/context/useAuthContext'

const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { saveSession } = useAuthContext()
  const [searchParams] = useSearchParams()

  const { showNotification } = useNotificationContext()

  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password'),
  })

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  type LoginFormFields = yup.InferType<typeof loginFormSchema>

  const redirectUser = () => {
    const redirectLink = searchParams.get('redirectTo')
    if (redirectLink) navigate(redirectLink)
    else navigate('/')
  }

  const login = handleSubmit(async (values: LoginFormFields) => {
    try {
      const data = await adminApi.auth<ApiEnvelope<UserType>>('/login', values)
      const res = { data: data.data }
      if (res.data.id) {
        saveSession(res.data)
        redirectUser()
        showNotification({ message: 'Successfully logged in. Redirecting....', variant: 'success' })
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e.response?.data?.error) {
        showNotification({ message: e.response?.data?.error, variant: 'danger' })
      }
    } finally {
      setLoading(false)
    }
  })

  return { loading, login, control }
}

export default useSignIn
