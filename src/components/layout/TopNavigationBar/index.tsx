import LanguageToggle from '@/components/LanguageToggle'
import { useTranslation } from '@/i18n'
import LeftSideBarToggle from './components/LeftSideBarToggle'
import ProfileDropdown from './components/ProfileDropdown'
import ThemeCustomizerToggle from './components/ThemeCustomizerToggle'
import ThemeModeToggle from './components/ThemeModeToggle'
export default function TopNavigationBar() {
  const { t } = useTranslation()
  return (
    <header className="topbar">
      <div className="container-xxl">
        <div className="navbar-header">
          <div className="d-flex align-items-center gap-2">
            <LeftSideBarToggle />
            <span>{t('app.name')}</span>
          </div>
          <div className="d-flex align-items-center gap-1">
            <LanguageToggle />
            <ThemeModeToggle />
            <ThemeCustomizerToggle />
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  )
}
