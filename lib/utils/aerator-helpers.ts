// Aerator helper functions for the water report app

export function getAeratorDescription(value: string | number): string {
  if (!value || value === "" || value === "0" || value === 0) {
    return "No Touch"
  }

  // Convert to string and clean up
  const stringValue = String(value).trim()

  // If it's just a number (like "1"), return a generic description
  if (/^\d+$/.test(stringValue)) {
    return `Aerator (${stringValue})`
  }

  return stringValue
}

export function formatNote(note: string): string {
  if (!note || note.trim() === "") {
    return ""
  }

  return note.trim()
}

// Helper function to determine if a value indicates an installation
export function hasInstallation(value: string | number): boolean {
  if (!value || value === "" || value === "0" || value === 0) {
    return false
  }

  const stringValue = String(value).trim().toLowerCase()
  return stringValue !== "no touch" && stringValue !== "none" && stringValue !== ""
}

// Helper function to format installation quantities
export function formatInstallationQuantity(item: string, count: number): string {
  if (count <= 1) {
    return item
  }
  return `${item} (${count})`
}
