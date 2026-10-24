import { Link } from 'react-router-dom'

import type { LogoBoxProps } from '@/types/component-props'


const LogoBox = ({ containerClassName, squareLogo, textLogo }: LogoBoxProps) => {
  return (
    <div className={containerClassName ?? ''}>
      <Link to="/" className="logo-dark">
        <span className={squareLogo?.className} style={{ fontWeight: 700 }}>360</span>
        <span className={textLogo?.className} style={{ fontSize: 14, fontWeight: 600 }}>Vista Express</span>
      </Link>
      <Link to="/" className="logo-light">
        <span className={squareLogo?.className} style={{ fontWeight: 700 }}>360</span>
        <span className={textLogo?.className} style={{ fontSize: 14, fontWeight: 600 }}>Vista Express</span>
      </Link>
    </div>
  )
}

export default LogoBox
