import { useEffect, useRef } from 'react'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from '@/context/useAuthContext'
import { LayoutProvider } from '@/context/useLayoutContext'
import { NotificationProvider } from '@/context/useNotificationContext'
import { TranslationProvider, useTranslation } from '@/i18n'
import type { ChildrenType } from '@/types/component-props'

const VisibilityTitle = () => {
  const { t } = useTranslation()
  // Remembered so the title is only restored when it is still the override we
  // wrote; a page that owns its title through `PageTitle` keeps it.
  const overridden = useRef<string | null>(null)
  useEffect(() => {
    const handleChangeTitle = () => {
      if (document.visibilityState === 'hidden') {
        overridden.current = t('app.pleaseComeBack')
        document.title = overridden.current
      } else if (document.title === overridden.current) {
        document.title = t('app.defaultTitle')
      }
    }
    handleChangeTitle()
    document.addEventListener('visibilitychange', handleChangeTitle)
    return () => {
      document.removeEventListener('visibilitychange', handleChangeTitle)
    }
  }, [t])
  return null
}

const AppProvidersWrapper = ({ children }: ChildrenType) => {
  return (
    <TranslationProvider>
      <AuthProvider>
        <LayoutProvider>
          <NotificationProvider>
            <VisibilityTitle />
            {children}
            <ToastContainer theme="colored" />
          </NotificationProvider>
        </LayoutProvider>
      </AuthProvider>
    </TranslationProvider>
  )
}

export default AppProvidersWrapper
