import { expect, type Page, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

function archetype(page: Page, row: string, name: string) {
  return page.getByRole('group', { name: row }).getByRole('button', { name })
}

test('picking a first archetype selects it, and clicking it again clears it', async ({ page }) => {
  const warrior = archetype(page, 'First archetype', 'Warrior')
  await warrior.click()
  await expect(warrior).toHaveAttribute('aria-pressed', 'true')

  await archetype(page, 'First archetype', 'Soldier').click()
  await expect(warrior).toHaveAttribute('aria-pressed', 'false')
  await expect(archetype(page, 'First archetype', 'Soldier')).toHaveAttribute('aria-pressed', 'true')

  await archetype(page, 'First archetype', 'Soldier').click()
  await expect(archetype(page, 'First archetype', 'Soldier')).toHaveAttribute('aria-pressed', 'false')
})

test('second archetypes unlock only when the first archetype allows them', async ({ page }) => {
  const executioner = archetype(page, 'Second archetype', 'Executioner')
  await expect(executioner).toBeDisabled()

  await archetype(page, 'First archetype', 'Officer').click()
  await expect(executioner).toBeDisabled()
  await expect(archetype(page, 'Second archetype', 'Vanguard')).toBeEnabled()

  await archetype(page, 'First archetype', 'Warrior').click()
  await expect(executioner).toBeEnabled()
})

test('every second archetype is listed, in table order', async ({ page }) => {
  const names = ['Assassin', 'Vanguard', 'Bounty Hunter', 'Master Tactician', 'Grand Strategist', 'Arch-Militant', 'Executioner']
  const buttons = page.getByRole('group', { name: 'Second archetype' }).getByRole('button')
  await expect(buttons).toHaveCount(names.length)
  for (const [index, name] of names.entries()) {
    await expect(buttons.nth(index)).toHaveAccessibleName(name)
  }
})

test('the Exemplar unlocks once a second archetype is selected', async ({ page }) => {
  const exemplar = archetype(page, 'Exemplar', 'Exemplar')
  await expect(exemplar).toBeDisabled()

  await archetype(page, 'First archetype', 'Soldier').click()
  await archetype(page, 'Second archetype', 'Bounty Hunter').click()
  await exemplar.click()
  await expect(exemplar).toHaveAttribute('aria-pressed', 'true')

  await exemplar.click()
  await expect(exemplar).toHaveAttribute('aria-pressed', 'false')
})

test("switching to a first archetype that doesn't allow the second clears it, but keeps the Exemplar", async ({ page }) => {
  await archetype(page, 'First archetype', 'Soldier').click()
  await archetype(page, 'Second archetype', 'Bounty Hunter').click()
  await archetype(page, 'Exemplar', 'Exemplar').click()

  // Warrior allows Assassin, Vanguard, Arch-Militant and Executioner, but not Bounty Hunter.
  await archetype(page, 'First archetype', 'Warrior').click()
  await page.getByRole('dialog').getByRole('button', { name: 'Proceed' }).click()

  await expect(archetype(page, 'Second archetype', 'Bounty Hunter')).toHaveAttribute('aria-pressed', 'false')
  // Still selected, though locked until a second archetype is picked again.
  await expect(archetype(page, 'Exemplar', 'Exemplar')).toHaveAttribute('aria-pressed', 'true')
  await expect(archetype(page, 'Exemplar', 'Exemplar')).toBeDisabled()
})

test('the selected archetypes survive a reload', async ({ page }) => {
  await archetype(page, 'First archetype', 'Bladedancer').click()
  await archetype(page, 'Second archetype', 'Executioner').click()
  await archetype(page, 'Exemplar', 'Exemplar').click()

  await page.reload()

  await expect(archetype(page, 'First archetype', 'Bladedancer')).toHaveAttribute('aria-pressed', 'true')
  await expect(archetype(page, 'Second archetype', 'Executioner')).toHaveAttribute('aria-pressed', 'true')
  await expect(archetype(page, 'Exemplar', 'Exemplar')).toHaveAttribute('aria-pressed', 'true')
})

test.describe('switching archetype when it would undo choices', () => {
  const MESSAGE = 'Switching archetype might undo some of your previous choices, do you want to proceed?'

  test.beforeEach(async ({ page }) => {
    await archetype(page, 'First archetype', 'Soldier').click()
    await archetype(page, 'Second archetype', 'Bounty Hunter').click()
  })

  test('asks first, and Cancel keeps both archetypes', async ({ page }) => {
    // Warrior doesn't allow Bounty Hunter, so switching would clear it.
    await archetype(page, 'First archetype', 'Warrior').click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText(MESSAGE)
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused()

    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog).toBeHidden()
    await expect(archetype(page, 'First archetype', 'Soldier')).toHaveAttribute('aria-pressed', 'true')
    await expect(archetype(page, 'Second archetype', 'Bounty Hunter')).toHaveAttribute('aria-pressed', 'true')
  })

  test('Escape cancels too', async ({ page }) => {
    await archetype(page, 'First archetype', 'Warrior').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(archetype(page, 'First archetype', 'Soldier')).toHaveAttribute('aria-pressed', 'true')
  })

  test('Proceed switches, and clears the second archetype', async ({ page }) => {
    await archetype(page, 'First archetype', 'Warrior').click()
    await page.getByRole('dialog').getByRole('button', { name: 'Proceed' }).click()

    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(archetype(page, 'First archetype', 'Warrior')).toHaveAttribute('aria-pressed', 'true')
    await expect(archetype(page, 'Second archetype', 'Bounty Hunter')).toHaveAttribute('aria-pressed', 'false')
  })

  test("doesn't ask when the new first archetype keeps the second", async ({ page }) => {
    // Operative allows Bounty Hunter too.
    await archetype(page, 'First archetype', 'Operative').click()

    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(archetype(page, 'First archetype', 'Operative')).toHaveAttribute('aria-pressed', 'true')
    await expect(archetype(page, 'Second archetype', 'Bounty Hunter')).toHaveAttribute('aria-pressed', 'true')
  })
})
