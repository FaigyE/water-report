"use client"

import { ReportDetailPage } from "../components/report-detail-page"
import { ReportProvider } from "../lib/report-context"

export default function Page() {
  try {
    return (
      <ReportProvider>
        <ReportDetailPage />
      </ReportProvider>
    )
  } catch (error) {
    console.error("Error in main page:", error)
    return <div>Error loading page: {String(error)}</div>
  }
}
