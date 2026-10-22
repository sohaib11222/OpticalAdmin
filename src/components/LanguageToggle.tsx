import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useTranslation } from '@/i18n'

/**
 * Language selector.
 *
 * `variant="topbar"` is the header button of the authenticated shell.
 * `variant="inline"` is the compact form placed inside modal headers: a modal
 * backdrop swallows clicks, so a dialog that is already open would otherwise
 * hide the only way to switch language.
 */
const LanguageToggle = ({ variant = 'topbar', className }: { variant?: 'topbar' | 'inline'; className?: string }) => {
  const { language, languages, setLanguage, t } = useTranslation()
  const inline = variant === 'inline'
  return (
    <Dropdown className={inline ? className : `topbar-item ${className ?? ''}`} align="end">
      <DropdownToggle
        id={inline ? 'language-toggle-modal' : 'language-toggle'}
        className={inline ? 'btn btn-sm btn-outline-secondary d-flex align-items-center gap-1' : 'topbar-button content-none d-flex align-items-center gap-1'}
        aria-label={t('nav.changeLanguage')}
        title={t('nav.changeLanguage')}>
        <IconifyIcon icon="bx:globe" className={inline ? 'fs-16 align-middle' : 'fs-20 align-middle'} />
        {!inline && <span className="d-none d-sm-inline">{languages.find((l) => l.code === language)?.label}</span>}
      </DropdownToggle>
      <DropdownMenu>
        {languages.map((option) => (
          <DropdownItem
            key={option.code}
            onClick={() => setLanguage(option.code)}
            aria-current={option.code === language}
            active={option.code === language}>
            {option.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}

export default LanguageToggle
