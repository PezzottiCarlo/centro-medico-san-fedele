import { adminDb } from './admin'
import { HERO_DEFAULTS, HeroPageSlug } from '@/lib/heroDefaults'
import type { HeroConfig } from '@/types'

const COLLECTION = 'hero_config'

export async function getHeroConfig(slug: HeroPageSlug): Promise<HeroConfig> {
  const fallback = HERO_DEFAULTS[slug]
  try {
    const snap = await adminDb.collection(COLLECTION).doc(slug).get()
    if (!snap.exists) return fallback

    const data = snap.data() as Partial<HeroConfig> | undefined
    if (!data || data.pubblicato === false) return fallback

    return {
      ...fallback,
      ...data,
      variant: fallback.variant,
      pageSlug: slug,
    }
  } catch (err) {
    console.error(`[hero] getHeroConfig(${slug}) failed`, err)
    return fallback
  }
}

export async function getAllHeroConfigs(): Promise<Record<HeroPageSlug, HeroConfig>> {
  try {
    const snap = await adminDb.collection(COLLECTION).get()
    const result = { ...HERO_DEFAULTS }
    snap.docs.forEach((doc) => {
      const slug = doc.id as HeroPageSlug
      if (!(slug in HERO_DEFAULTS)) return
      const data = doc.data() as Partial<HeroConfig>
      result[slug] = {
        ...HERO_DEFAULTS[slug],
        ...data,
        variant: HERO_DEFAULTS[slug].variant,
        pageSlug: slug,
      }
    })
    return result
  } catch (err) {
    console.error('[hero] getAllHeroConfigs failed', err)
    return { ...HERO_DEFAULTS }
  }
}
