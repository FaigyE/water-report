import { ReportDetailPage } from "../components/report-detail-page"
import { ReportProvider } from "../lib/report-context"

export default function Page() {
  return (
    <ReportProvider>
      <ReportDetailPage />
    </ReportProvider>
  )
}
