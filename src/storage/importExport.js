import { validateSaveData } from './saveGame.js'

/** Triggers a browser download of a save as a portable JSON file. */
export function exportSaveData(data) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const stamp = new Date(data.savedAt ?? Date.now()).toISOString().replace(/[:.]/g, '-')
  const link = document.createElement('a')
  link.href = url
  link.download = `factoryforge-save-${stamp}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** Parses and validates an imported save file's text before anything loads it. */
export function parseImportedSave(jsonText) {
  let data
  try {
    data = JSON.parse(jsonText)
  } catch {
    throw new Error('File is not valid JSON')
  }
  validateSaveData(data)
  return data
}

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
