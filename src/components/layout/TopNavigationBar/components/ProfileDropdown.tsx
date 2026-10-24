import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, DropdownHeader } from 'react-bootstrap'
import { useAuthContext } from '@/context/useAuthContext'
import { useTranslation } from '@/i18n'
const ProfileDropdown = () => {
  const { user, removeSession } = useAuthContext()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  return (
    <>
      <Dropdown className="topbar-item" align="end">
        <DropdownToggle variant="link" className="topbar-button topbar-text-button content-none">{user?.name}</DropdownToggle>
        <DropdownMenu>
          <DropdownHeader>{user?.email}</DropdownHeader>
          <DropdownItem as={Link} to="/account/security">
            {t('nav.accountSecurity')}
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              void removeSession()
                .then(() => navigate('/auth/sign-in'))
                .catch(() => setError('nav.signOutFailed'))
            }}>
            {t('nav.signOut')}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      {error && (
        <span role="alert">
          {t(error)}
        </span>
      )}
    </>
  )
}
export default ProfileDropdown
