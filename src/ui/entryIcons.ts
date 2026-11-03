/** Every talent and ability icon is a 48 × 48 WebP image. */
export const ENTRY_ICON_SIZE = 48

/** The folders under `public/icons/` that talent and ability icons live in. */
export type EntryIconFolder = 'talents' | 'abilities'

/**
 * The URL of a talent's or ability's icon, from its `icon` file name. Files in `public/` are served
 * under the app's base path, so the URL starts with it.
 */
export function entryIconUrl(folder: EntryIconFolder, icon: string): string {
  return `${import.meta.env.BASE_URL}icons/${folder}/${icon}.webp`
}
