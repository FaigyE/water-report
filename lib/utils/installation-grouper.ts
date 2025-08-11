import type { InstallationData } from "../types"

export interface GroupedInstallationData
  extends Omit<InstallationData, "installedKitchenAerator" | "installedBathroomAerator" | "installedShower"> {
  installedKitchenAerator: string
  installedBathroomAerator: string
  installedShower: string
}

export function groupInstallationsByUnit(data: InstallationData[]): GroupedInstallationData[] {
  console.log("groupInstallationsByUnit called with data length:", data?.length)

  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log("No data provided to groupInstallationsByUnit")
    return []
  }

  try {
    // Group data by apartment unit
    const groupedByApt = data.reduce(
      (acc, item) => {
        if (!item || !item.apartment || typeof item.apartment !== "string") {
          console.log("Skipping invalid item:", item)
          return acc
        }

        if (!acc[item.apartment]) {
          acc[item.apartment] = []
        }
        acc[item.apartment].push(item)
        return acc
      },
      {} as Record<string, InstallationData[]>,
    )

    console.log("Grouped by apartment:", Object.keys(groupedByApt).length, "units")

    // Process each apartment unit
    const result = Object.entries(groupedByApt)
      .map(([apartment, items]) => {
        if (!items || items.length === 0) {
          return null
        }

        // Group and count each installation type
        const kitchenAerators = groupAndCount(items, "installedKitchenAerator")
        const bathroomAerators = groupAndCount(items, "installedBathroomAerator")
        const showers = groupAndCount(items, "installedShower")

        // Take the first item as base and override with grouped data
        const baseItem = items[0]

        return {
          ...baseItem,
          installedKitchenAerator: formatInstallationDisplay(kitchenAerators),
          installedBathroomAerator: formatInstallationDisplay(bathroomAerators),
          installedShower: formatInstallationDisplay(showers),
          // Combine notes from all items for this apartment
          notes: combineNotes(items),
        }
      })
      .filter(Boolean) as GroupedInstallationData[]

    console.log("Final grouped result length:", result.length)
    return result
  } catch (error) {
    console.error("Error in groupInstallationsByUnit:", error)
    return []
  }
}

function groupAndCount(items: InstallationData[], field: keyof InstallationData): Record<string, number> {
  const counts: Record<string, number> = {}

  if (!items || !Array.isArray(items)) {
    return counts
  }

  items.forEach((item) => {
    if (!item) return

    const value = item[field] as string
    // Only count actual installation values, not "No Touch" or empty values
    if (
      value &&
      typeof value === "string" &&
      value.trim() &&
      value !== "No Touch" &&
      value !== "Existing" &&
      value !== ""
    ) {
      counts[value] = (counts[value] || 0) + 1
    }
  })

  return counts
}

function formatInstallationDisplay(itemCounts: Record<string, number>): string {
  const entries = Object.entries(itemCounts)

  if (entries.length === 0) {
    return "No Touch"
  }

  // Format each unique item with quantity only if > 1
  const formatted = entries.map(([item, count]) => {
    if (count > 1) {
      return `${item} (${count})`
    }
    return item // No quantity shown for single items
  })

  return formatted.join(", ")
}

function combineNotes(items: InstallationData[]): string {
  if (!items || !Array.isArray(items)) {
    return ""
  }

  // Get unique notes and combine them
  const notes = items
    .map((item) => item?.notes)
    .filter((note) => note && typeof note === "string" && note.trim())
    .filter((note, index, arr) => arr.indexOf(note) === index) // Remove duplicates

  return notes.join(" ")
}

// Helper function to update toilet replacement text based on quantity
export function updateToiletReplacementText(notes: string, bathroomCount: number): string {
  if (!notes || typeof notes !== "string") return ""

  // Replace toilet replacement text based on bathroom count
  if (bathroomCount > 1) {
    return notes
      .replace(/We replaced toilet\./g, "We replaced both toilets.")
      .replace(/We replaced toilet /g, "We replaced both toilets ")
  }

  return notes
}
