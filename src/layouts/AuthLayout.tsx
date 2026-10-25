import { Suspense } from 'react'
import LanguageToggle from '@/components/LanguageToggle'
import Preloader from '@/components/Preloader'
import type { ChildrenType } from '@/types/component-props'
import { useTranslation } from '@/i18n'
import AuthExperience from '../../../contracts/AuthExperience'
const AuthLayout = ({ children }: ChildrenType) => {
  const { language } = useTranslation()
  return <AuthExperience admin language={language} languageControl={<LanguageToggle />} image={`${import.meta.env.BASE_URL}images/auth-editorial.webp`}>
    <Suspense fallback={<Preloader />}>{children}</Suspense>
  </AuthExperience>
}
export default AuthLayout
