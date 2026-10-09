import { getBrowseCars } from '@/lib/database/browse'
import {
  getBrowseFiltersFromParams,
  getBrowsePageFromParam,
  getBrowseSortFromParam,
} from '@/lib/browse-url-state'
import BrowsePageClient from './browse-page-client'

type BrowsePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams
  const page = getBrowsePageFromParam(params.page)
  const sortBy = getBrowseSortFromParam(params.sortBy)
  const filters = getBrowseFiltersFromParams(params)

  let initialResult
  try {
    initialResult = await getBrowseCars({
      page,
      pageSize: 24,
      sortBy,
      filters,
    })
  } catch {
    initialResult = {
      cars: [],
      total: 0,
      page,
      pageSize: 24,
      hasMore: false,
    }
  }

  return (
    <BrowsePageClient
      initialResult={initialResult}
      initialSortBy={sortBy}
      initialPage={page}
      initialFilters={filters}
    />
  )
}
