"use client"

import { useReportContext } from "@/lib/report-context"
import { groupInstallationsByUnit, updateToiletReplacementText } from "@/lib/utils/installation-grouper"

export function ReportDetailPage() {
  const { reportData } = useReportContext()

  if (!reportData) {
    return <div>No report data available</div>
  }

  console.log("Raw installation data:", reportData.installationData.slice(0, 5))

  // Group the installation data by unit with proper quantity formatting
  const groupedData = groupInstallationsByUnit(reportData.installationData)

  console.log("Grouped installation data:", groupedData.slice(0, 5))

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-6">Detailed Apartment Information</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Unit</th>
                <th className="border border-gray-300 p-2 text-left">Existing Kitchen Aerator</th>
                <th className="border border-gray-300 p-2 text-left">Kitchen Installed</th>
                <th className="border border-gray-300 p-2 text-left">Existing Bathroom Aerator</th>
                <th className="border border-gray-300 p-2 text-left">Bathroom Installed</th>
                <th className="border border-gray-300 p-2 text-left">Existing Shower</th>
                <th className="border border-gray-300 p-2 text-left">Shower Installed</th>
                <th className="border border-gray-300 p-2 text-left">Toilet Installed</th>
                <th className="border border-gray-300 p-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {groupedData.map((item, index) => {
                // Count bathroom installations to determine toilet replacement text
                const bathroomCount = countBathroomInstallations(item.installedBathroomAerator)
                const updatedNotes = updateToiletReplacementText(item.notes || "", bathroomCount)

                return (
                  <tr key={`${item.apartment}-${index}`} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-medium">{item.apartment}</td>
                    <td className="border border-gray-300 p-2">{item.existingKitchenAerator || ""}</td>
                    <td className="border border-gray-300 p-2">{item.installedKitchenAerator || ""}</td>
                    <td className="border border-gray-300 p-2">{item.existingBathroomAerator || ""}</td>
                    <td className="border border-gray-300 p-2">{item.installedBathroomAerator || ""}</td>
                    <td className="border border-gray-300 p-2">{item.existingShower || ""}</td>
                    <td className="border border-gray-300 p-2">{item.installedShower || ""}</td>
                    <td className="border border-gray-300 p-2">{item.toiletInstalled || ""}</td>
                    <td className="border border-gray-300 p-2">{updatedNotes}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Helper function to count bathroom installations from the formatted string
function countBathroomInstallations(installedBathroom: string): number {
  if (!installedBathroom || installedBathroom === "No Touch") {
    return 0
  }

  // Check if there's a quantity in parentheses
  const match = installedBathroom.match(/$$(\d+)$$/)
  if (match) {
    return Number.parseInt(match[1], 10)
  }

  // If no parentheses, assume 1 installation
  return 1
}
