import { Helmet } from 'react-helmet'

import { useTranslation } from '@/i18n'

const PageMetaData = ({ title }: { title: string }) => {
  const { t } = useTranslation()
  const defaultTitle = t('app.defaultTitle')
  return (
    <Helmet>
      <title>{title ? title + ' | ' + defaultTitle : defaultTitle}</title>
    </Helmet>
  )
}
export default PageMetaData
