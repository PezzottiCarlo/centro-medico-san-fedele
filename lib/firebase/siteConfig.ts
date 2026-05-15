import { adminDb } from './admin'
import { SITE_CONFIG_DEFAULT } from '@/lib/siteConfig'
import type { SiteConfig } from '@/types'

const COLLECTION = 'site_config'
const DOC_ID = 'main'

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const snap = await adminDb.collection(COLLECTION).doc(DOC_ID).get()
    if (!snap.exists) return SITE_CONFIG_DEFAULT
    const data = snap.data() as Partial<SiteConfig> | undefined
    if (!data) return SITE_CONFIG_DEFAULT
    return { ...SITE_CONFIG_DEFAULT, ...data }
  } catch (err) {
    console.error('[siteConfig] getSiteConfig failed', err)
    return SITE_CONFIG_DEFAULT
  }
}
