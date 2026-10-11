import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('picking a top-level homeworld shows it in the dropdown', async ({ page }) => {
  const homeworld = page.getByRole('button', { name: /Homeworld/ })
  await homeworld.click()
  await page.getByRole('menuitemradio', { name: 'Death World' }).click()

  await expect(page.getByRole('menu')).toBeHidden()
  await expect(homeworld).toContainText('Death World')
})

test('grouped homeworlds open as a nested menu', async ({ page }) => {
  const homeworld = page.getByRole('button', { name: /Homeworld/ })
  await homeworld.click()

  await expect(page.getByRole('menuitemradio', { name: 'Subskin Armor' })).toBeHidden()
  await page.getByRole('menuitem', { name: 'Forge World' }).hover()
  await page.getByRole('menuitemradio', { name: 'Locomotion System' }).click()

  await expect(homeworld).toContainText('Forge World: Locomotion System')
})

test('the Imperial World group lists every characteristic but WS and BS', async ({ page }) => {
  await page.getByRole('button', { name: /Homeworld/ }).click()
  await page.getByRole('menuitem', { name: 'Imperial World' }).click()

  const submenu = page.getByRole('menu', { name: 'Imperial World' })
  await expect(submenu.getByRole('menuitemradio')).toHaveText(['STR', 'TGH', 'AGI', 'INT', 'PER', 'WP', 'FEL'])
})

test('an origin can be picked from a nested menu with the keyboard', async ({ page }) => {
  const origin = page.getByRole('button', { name: /Origin/ })
  await origin.focus()
  await page.keyboard.press('Enter')

  // Arbitrator is the last item, and Sanctioned Psyker sits just above it.
  await page.keyboard.press('End')
  await page.keyboard.press('ArrowUp')
  await expect(page.getByRole('menuitem', { name: 'Sanctioned Psyker' })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')

  await expect(origin).toContainText('Sanctioned Psyker: Diviner')
  await expect(origin).toBeFocused()
})

test('Escape closes a nested menu, then the dropdown', async ({ page }) => {
  await page.getByRole('button', { name: /Origin/ }).click()
  await page.getByRole('menuitem', { name: 'Arbitrator' }).click()
  await expect(page.getByRole('menu', { name: 'Arbitrator' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('menu', { name: 'Arbitrator' })).toBeHidden()
  await expect(page.getByRole('menuitem', { name: 'Arbitrator' })).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('menu')).toBeHidden()
})

test('clicking outside closes the dropdown', async ({ page }) => {
  await page.getByRole('button', { name: /Origin/ }).click()
  await expect(page.getByRole('menu')).toBeVisible()

  await page.mouse.click(5, 500)
  await expect(page.getByRole('menu')).toBeHidden()
})

test('triumph and darkest hour can be picked without an origin', async ({ page }) => {
  const triumph = page.getByRole('button', { name: /Triumph/ })
  await triumph.click()
  await expect(page.getByRole('menuitemradio')).toHaveText(['Apex of Brilliance', 'Illustrious Glory', 'Feat of Greatness'])
  await page.getByRole('menuitemradio', { name: 'Illustrious Glory' }).click()
  await expect(triumph).toContainText('Illustrious Glory')

  const darkestHour = page.getByRole('button', { name: /Darkest hour/ })
  await darkestHour.click()
  await expect(page.getByRole('menuitemradio')).toHaveText(['Grim Portents', 'Brand of Shame', 'Shadow of Torment'])
  await page.getByRole('menuitemradio', { name: 'Shadow of Torment' }).click()
  await expect(darkestHour).toContainText('Shadow of Torment')
})
