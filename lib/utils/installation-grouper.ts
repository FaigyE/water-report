import type { InstallationData } from "../types"

export interface GroupedInstallationData
  extends Omit<InstallationData, "installedKitchenAerator" | "installedBathroomAerator" | "installedShower"> {
  installedKitchenAerator: string
  installedBathroomAerator: string
  installedShower: string
}

export function groupInstallationsByUnit(data: InstallationData[]): GroupedInstallationData[] {
  // Group data by apartment unit
  const groupedByApt = data.reduce(
    (acc, item) => {
      if (!acc[item.apartment]) {
        acc[item.apartment] = []
      }
      acc[item.apartment].push(item)
      return acc
    },
    {} as Record<string, InstallationData[]>,
  )

  // Process each apartment unit
  return Object.entries(groupedByApt).map(([apartment, items]) => {
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
}

function groupAndCount(items: InstallationData[], field: keyof InstallationData): Record<string, number> {
  const counts: Record<string, number> = {}

  items.forEach((item) => {
    const value = item[field] as string
    // Only count actual installation values, not "No Touch" or empty values
    if (value && value.trim() && value !== "No Touch" && value !== "Existing" && value !== "") {
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
  // Get unique notes and combine them
  const notes = items
    .map((item) => item.notes)
    .filter((note) => note && note.trim())
    .filter((note, index, arr) => arr.indexOf(note) === index) // Remove duplicates

  return notes.join(" ")
}

// Helper function to update toilet replacement text based on quantity
export function updateToiletReplacementText(notes: string, bathroomCount: number): string {
  if (!notes) return notes

  // Replace toilet replacement text based on bathroom count
  if (bathroomCount > 1) {
    return notes
      .replace(/We replaced toilet\./g, "We replaced both toilets.")
      .replace(/We replaced toilet /g, "We replaced both toilets ")
  }

  return notes
}
