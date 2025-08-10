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

        // Auto-detect column mappings
        const columnMappings = detectColumnMappings(columnNames)
        console.log("Detected column mappings:", columnMappings)

        const installationData: InstallationData[] = jsonData.map((row: any) => ({
          apartment: getColumnValue(row, columnMappings.apartment) || "",
          existingKitchenAerator: getColumnValue(row, columnMappings.existingKitchen) || "",
          installedKitchenAerator: getColumnValue(row, columnMappings.installedKitchen) || "",
          existingBathroomAerator: getColumnValue(row, columnMappings.existingBathroom) || "",
          installedBathroomAerator: getColumnValue(row, columnMappings.installedBathroom) || "",
          existingShower: getColumnValue(row, columnMappings.existingShower) || "",
          installedShower: getColumnValue(row, columnMappings.installedShower) || "",
          toiletInstalled: getColumnValue(row, columnMappings.toiletInstalled) || "",
          notes: getColumnValue(row, columnMappings.notes) || "",
        }))

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
    apartment: findMatchingColumns(columnNames, ["apt", "apartment", "unit", "apt#", "unit#"]),
    existingKitchen: findMatchingColumns(columnNames, [
      "existing kitchen",
      "kitchen existing",
      "existing kitchen aerator",
      "kitchen aerator existing",
    ]),
    installedKitchen: findMatchingColumns(columnNames, [
      "kitchen installed",
      "installed kitchen",
      "kitchen aerator installed",
      "kitchen aerator",
      "kitchen install",
    ]),
    existingBathroom: findMatchingColumns(columnNames, [
      "existing bathroom",
      "bathroom existing",
      "existing bathroom aerator",
      "bathroom aerator existing",
    ]),
    installedBathroom: findMatchingColumns(columnNames, [
      "bathroom installed",
      "installed bathroom",
      "bathroom aerator installed",
      "bathroom aerator",
      "bathroom install",
    ]),
    existingShower: findMatchingColumns(columnNames, [
      "existing shower",
      "shower existing",
      "existing shower head",
      "shower head existing",
    ]),
    installedShower: findMatchingColumns(columnNames, [
      "shower installed",
      "installed shower",
      "shower head installed",
      "shower head",
      "shower install",
    ]),
    toiletInstalled: findMatchingColumns(columnNames, [
      "toilet installed",
      "installed toilet",
      "toilet install",
      "toilet",
    ]),
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
