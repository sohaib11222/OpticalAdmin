import { useEffect, useRef } from 'react'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useLayoutContext } from '@/context/useLayoutContext'
import { useLocation } from 'react-router-dom'

const LeftSideBarToggle = () => {
  const {
    menu: { size },
    changeMenu: { size: changeMenuSize },
    toggleBackdrop,
  } = useLayoutContext()

  const { pathname } = useLocation()
  const previousPath = useRef(pathname)

  const handleMenuSize = () => {
    if (size === 'hidden') toggleBackdrop()
    if (size === 'condensed') changeMenuSize('default')
    else if (size === 'default') changeMenuSize('condensed')
  }

  useEffect(() => {
    const navigated = previousPath.current !== pathname
    previousPath.current = pathname
    if (navigated && size === 'hidden' && document.documentElement.classList.contains('sidebar-enable')) {
      toggleBackdrop()
    }
  }, [pathname, size, toggleBackdrop])

  return (
    <div className="topbar-item">
      <button onClick={handleMenuSize} type="button" className="button-toggle-menu">
        <IconifyIcon icon="iconamoon:menu-burger-horizontal" className="fs-22" />
      </button>
    </div>
  )
}

export default LeftSideBarToggle
