// Types for the water installation report app
export interface InstallationData {
  apartment: string
  existingKitchenAerator?: string
  installedKitchenAerator?: string
  existingBathroomAerator?: string
  installedBathroomAerator?: string
  existingShower?: string
  installedShower?: string
  toiletInstalled?: string
  notes?: string
}

export interface ReportData {
  propertyInfo: {
    address: string
    city: string
    state: string
    zipCode: string
    contactName: string
    propertyName: string
  }
  installationData: InstallationData[]
  totalToilets: number
  notesData: Array<{
    apartment: string
    note: string
  }>
}
