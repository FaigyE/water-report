import * as XLSX from "xlsx"
import type { InstallationData } from "./types"

export function parseExcelFile(file: File): Promise<InstallationData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) {
          reject(new Error("No data found in Excel file"))
          return
        }

        // Get all column names from the first row
        const firstRow = jsonData[0] as Record<string, any>
        const columnNames = Object.keys(firstRow)

        console.log("All column names:", columnNames)

        // Auto-detect column mappings with flexible matching
        const columnMappings = detectColumnMappings(columnNames)
        console.log("Detected column mappings:", columnMappings)

        const installationData: InstallationData[] = jsonData.map((row: any) => {
          const apartment = getColumnValue(row, columnMappings.apartment) || ""

          // Handle kitchen data - could be existing/installed separate columns OR single installation column
          const kitchenData = extractInstallationData(row, columnMappings.kitchen)

          // Handle bathroom data - could be existing/installed separate columns OR single installation column
          const bathroomData = extractInstallationData(row, columnMappings.bathroom)

          // Handle shower data - could be existing/installed separate columns OR single installation column
          const showerData = extractInstallationData(row, columnMappings.shower)

          return {
            apartment,
            existingKitchenAerator: kitchenData.existing || "",
            installedKitchenAerator: kitchenData.installed || "",
            existingBathroomAerator: bathroomData.existing || "",
            installedBathroomAerator: bathroomData.installed || "",
            existingShower: showerData.existing || "",
            installedShower: showerData.installed || "",
            toiletInstalled: getColumnValue(row, columnMappings.toilet) || "",
            notes: getColumnValue(row, columnMappings.notes) || "",
          }
        })

        // Filter out empty rows
        const filteredData = installationData.filter((item) => item.apartment && item.apartment.trim() !== "")

        console.log("Parsed data sample:", filteredData.slice(0, 3))
        resolve(filteredData)
      } catch (error) {
        console.error("Excel parsing error:", error)
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}

function detectColumnMappings(columnNames: string[]): Record<string, string[]> {
  const mappings = {
    apartment: findMatchingColumns(columnNames, ["unit", "apt", "apartment", "apt#", "unit#", "room"]),
    kitchen: findMatchingColumns(columnNames, ["kitchen", "kitchen aerator", "kitchen faucet", "faucet kitchen"]),
    bathroom: findMatchingColumns(columnNames, [
      "bathroom",
      "bathroom aerator",
      "bath aerator",
      "bathroom faucet",
      "bath faucet",
    ]),
    shower: findMatchingColumns(columnNames, ["shower", "shower head", "showerhead", "shower aerator"]),
    toilet: findMatchingColumns(columnNames, ["toilet", "toilets installed", "toilet installed", "toilet install"]),
    notes: findMatchingColumns(columnNames, ["notes", "note", "comments", "comment", "remarks"]),
  }

  return mappings
}

function findMatchingColumns(columnNames: string[], searchTerms: string[]): string[] {
  const matches: string[] = []

  for (const searchTerm of searchTerms) {
    for (const columnName of columnNames) {
      const normalizedColumn = columnName.toLowerCase().trim()
      const normalizedSearch = searchTerm.toLowerCase().trim()

      if (normalizedColumn.includes(normalizedSearch) || normalizedSearch.includes(normalizedColumn)) {
        if (!matches.includes(columnName)) {
          matches.push(columnName)
        }
      }
    }
  }

  return matches
}

function extractInstallationData(
  row: Record<string, any>,
  possibleColumns: string[],
): {
  existing: string
  installed: string
} {
  // Try to find separate existing/installed columns first
  const existingColumns = possibleColumns.filter(
    (col) => col.toLowerCase().includes("existing") || col.toLowerCase().includes("current"),
  )
  const installedColumns = possibleColumns.filter(
    (col) =>
      col.toLowerCase().includes("installed") ||
      col.toLowerCase().includes("install") ||
      col.toLowerCase().includes("new"),
  )

  let existing = ""
  let installed = ""

  // If we have separate existing/installed columns
  if (existingColumns.length > 0) {
    existing = getColumnValue(row, existingColumns)
  }
  if (installedColumns.length > 0) {
    installed = getColumnValue(row, installedColumns)
  }

  // If no separate columns found, treat any matching column as installation data
  if (!existing && !installed && possibleColumns.length > 0) {
    const value = getColumnValue(row, possibleColumns)

    // For your Excel format, if there's a value, it represents an installation
    if (value && value.trim() !== "" && value !== "0") {
      installed = value // Use the actual value (Insert, Male, Female, etc.)
      existing = "" // No existing data in this format
    } else {
      installed = "No Touch"
      existing = ""
    }
  }

  // If we still don't have installation data, default to "No Touch"
  if (!installed) {
    installed = "No Touch"
  }

  return { existing, installed }
}

function isInstallationValue(value: string): boolean {
  if (!value || value.trim() === "") return false

  const normalizedValue = value.toLowerCase().trim()

  // Empty values or "0" mean no installation
  return normalizedValue !== "0" && normalizedValue !== "" && normalizedValue !== "null"
}

function getColumnValue(row: Record<string, any>, possibleColumns: string[]): string {
  for (const column of possibleColumns) {
    if (row[column] !== undefined && row[column] !== null) {
      const value = String(row[column]).trim()
      if (value !== "" && value !== "undefined" && value !== "null") {
        return value
      }
    }
  }
  return ""
}
