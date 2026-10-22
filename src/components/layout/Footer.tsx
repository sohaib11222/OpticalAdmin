import { currentYear, developedBy, developedByLink } from '@/context/constants'
import IconifyIcon from '../wrappers/IconifyIcon'
import { Col, Container, Row } from 'react-bootstrap'
import { useTranslation } from '@/i18n'

const Footer = () => {
  const { t } = useTranslation()
  return (
    <footer className="footer">
      <Container fluid>
        <Row>
          <Col xs={12} className="text-center">
            <span className="icons-center">
              {' '}
              {currentYear} © Reback. {t('footer.craftedWith')}&nbsp;
              <IconifyIcon icon="iconamoon:heart-duotone" className="fs-18 align-middle text-danger" />
              &nbsp;{t('footer.by')}&nbsp;
              <a href={developedByLink} className="fw-bold footer-text" target="_blank">
                {developedBy}
              </a>
            </span>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
