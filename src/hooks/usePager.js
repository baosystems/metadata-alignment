import { useState, useEffect } from 'react'

const DEFAULT_PAGE_SIZE = 50

export default function usePager(data) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [pageData, setPageData] = useState(data.slice(0, DEFAULT_PAGE_SIZE))

  useEffect(() => {
    setPage(1)
    setPageData(data.slice(0, pageSize))
  }, [data])

  // Doing this rather than using a useEffect to prevent out of
  // sync parameters, for example the page goes up one and triggers
  // a re-render, but pageData is not updated till the next render
  // This causes errors in the component rendering the data.
  // Combining the state updates means react will batch update
  const updatePageData = (pageInternal, pageSizeInternal) => {
    const startIdx = (pageInternal - 1) * pageSizeInternal
    pageInternal !== page && setPage(pageInternal)
    pageSizeInternal !== pageSize && setPageSize(pageSizeInternal)
    setPageData(data.slice(startIdx, startIdx + pageSizeInternal))
  }

  const onPageChange = (page) => {
    updatePageData(page, pageSize)
  }

  const onPageSizeChange = (pageSize) => {
    updatePageData(1, pageSize)
  }

  return {
    page,
    pageSize,
    pageCount: Math.ceil(data.length / pageSize),
    total: data.length,
    onPageChange,
    onPageSizeChange,
    pageData,
  }
}
