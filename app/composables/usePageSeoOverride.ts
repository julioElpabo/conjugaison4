import type { PageSeoOverride } from '~~/shared/types/page-seo'

export function usePageSeoOverride() {
  const pageSeoOverride = useState<PageSeoOverride | null>('page-seo-override', () => null)

  function setPageSeoOverride(value: PageSeoOverride | null) {
    pageSeoOverride.value = value
  }

  return { pageSeoOverride, setPageSeoOverride }
}
