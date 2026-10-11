import { expect, type Page, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

function archetype(page: Page, row: string, name: string) {
  return page.getByRole('group', { name: row }).getByRole('button', { name })
}

/** Picks an archetype, which opens its level-up screen, then returns to the archetype pick screen. */
async function pick(page: Page, row: string, name: string) {
  await archetype(page, row, name).click()
  await page.getByRole('button', { name: 'Return' }).click()
}

test('picking an archetype selects it and opens its level-up screen', async ({ page }) => {
  await archetype(page, 'First archetype', 'Warrior').click()

  await expect(page.getByRole('heading', { name: 'Loadout // Archetype 01' })).toBeVisible()
  await expect(page.getByText('Warrior', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Return' }).click()
  await expect(archetype(page, 'First archetype', 'Warrior')).toHaveAttribute('aria-pressed', 'true')
})

test('clicking the selected archetype opens it again, and keeps it selected', async ({ page }) => {
  await pick(page, 'First archetype', 'Soldier')
  await archetype(page, 'First archetype', 'Soldier').click()

  await expect(page.getByRole('heading', { name: 'Loadout // Archetype 01' })).toBeVisible()
  await page.getByRole('button', { name: 'Return' }).click()
  await expect(archetype(page, 'First archetype', 'Soldier')).toHaveAttribute('aria-pressed', 'true')
})

test('second archetypes unlock only when the first archetype allows them', async ({ page }) => {
  const executioner = archetype(page, 'Second archetype', 'Executioner')
  await expect(executioner).toBeDisabled()

  await pick(page, 'First archetype', 'Officer')
  await expect(executioner).toBeDisabled()
  await expect(archetype(page, 'Second archetype', 'Vanguard')).toBeEnabled()

  await pick(page, 'First archetype', 'Warrior')
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

test('the Exemplar unlocks once a second archetype is selected, and opens its level-up screen', async ({ page }) => {
  const exemplar = archetype(page, 'Exemplar', 'Exemplar')
  await expect(exemplar).toBeDisabled()

  await pick(page, 'First archetype', 'Soldier')
  await pick(page, 'Second archetype', 'Bounty Hunter')
  await exemplar.click()

  await expect(page.getByRole('heading', { name: 'Loadout // Exemplar' })).toBeVisible()
  await page.getByRole('button', { name: 'Return' }).click()
  await expect(exemplar).toHaveAttribute('aria-pressed', 'true')
})

test("switching to a first archetype that doesn't allow the second clears it, but keeps the Exemplar", async ({ page }) => {
  await pick(page, 'First archetype', 'Soldier')
  await pick(page, 'Second archetype', 'Bounty Hunter')
  await pick(page, 'Exemplar', 'Exemplar')

  // Warrior allows Assassin, Vanguard, Arch-Militant and Executioner, but not Bounty Hunter.
  await archetype(page, 'First archetype', 'Warrior').click()
  await page.getByRole('dialog').getByRole('button', { name: 'Proceed' }).click()
  await page.getByRole('button', { name: 'Return' }).click()

  await expect(archetype(page, 'Second archetype', 'Bounty Hunter')).toHaveAttribute('aria-pressed', 'false')
  // Still selected, though locked until a second archetype is picked again.
  await expect(archetype(page, 'Exemplar', 'Exemplar')).toHaveAttribute('aria-pressed', 'true')
  await expect(archetype(page, 'Exemplar', 'Exemplar')).toBeDisabled()
})

test('the selected archetypes survive a reload', async ({ page }) => {
  await pick(page, 'First archetype', 'Bladedancer')
  await pick(page, 'Second archetype', 'Executioner')
  await pick(page, 'Exemplar', 'Exemplar')

  await page.reload()

  await expect(archetype(page, 'First archetype', 'Bladedancer')).toHaveAttribute('aria-pressed', 'true')
  await expect(archetype(page, 'Second archetype', 'Executioner')).toHaveAttribute('aria-pressed', 'true')
  await expect(archetype(page, 'Exemplar', 'Exemplar')).toHaveAttribute('aria-pressed', 'true')
})

test.describe('switching archetype when it would undo choices', () => {
  const MESSAGE = 'Switching archetype might undo some of your previous choices, do you want to proceed?'

  test.beforeEach(async ({ page }) => {
    await pick(page, 'First archetype', 'Soldier')
    await pick(page, 'Second archetype', 'Bounty Hunter')
  })

  test('asks before switching, and Cancel keeps both archetypes on the pick screen', async ({ page }) => {
    // Warrior doesn't allow Bounty Hunter, so switching would clear it.
    await archetype(page, 'First archetype', 'Warrior').click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText(MESSAGE)
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused()

    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog).toBeHidden()
    await expect(page.getByRole('heading', { name: 'Loadout // Archetype select' })).toBeVisible()
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

  test('Proceed switches, opens the new archetype, and clears the second archetype', async ({ page }) => {
    await archetype(page, 'First archetype', 'Warrior').click()
    await page.getByRole('dialog').getByRole('button', { name: 'Proceed' }).click()

    await expect(page.getByText('Warrior', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Return' }).click()
    await expect(archetype(page, 'First archetype', 'Warrior')).toHaveAttribute('aria-pressed', 'true')
    await expect(archetype(page, 'Second archetype', 'Bounty Hunter')).toHaveAttribute('aria-pressed', 'false')
  })

  test("doesn't ask when the new first archetype keeps the second", async ({ page }) => {
    // Operative allows Bounty Hunter too.
    await archetype(page, 'First archetype', 'Operative').click()

    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.getByText('Operative', { exact: true })).toBeVisible()
  })
})
