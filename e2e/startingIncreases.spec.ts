import { expect, type Page, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

function cell(page: Page, name: string) {
  return page.getByRole('button', { name: new RegExp(`^${name}:`) })
}

test('clicking a characteristic cycles it through 0, 1 and 2 increases', async ({ page }) => {
  const strength = cell(page, 'Strength')
  await expect(strength).toHaveAccessibleName('Strength: 0 of 2')

  await strength.click()
  await expect(strength).toHaveAccessibleName('Strength: 1 of 2')
  await strength.click()
  await expect(strength).toHaveAccessibleName('Strength: 2 of 2')
  await strength.click()
  await expect(strength).toHaveAccessibleName('Strength: 0 of 2')
})

test('after 6 increases, untaken characteristics are disabled until one is removed', async ({ page }) => {
  const group = page.getByRole('group', { name: /Starting characteristic increases/ })
  for (const name of ['Weapon Skill', 'Weapon Skill', 'Strength', 'Strength', 'Agility', 'Intelligence']) {
    await cell(page, name).click()
  }
  await expect(group).toHaveAccessibleName('Starting characteristic increases, 6 of 6 used')
  await expect(cell(page, 'Fellowship')).toBeDisabled()

  // A characteristic taken once can't take a second increase now, so clicking it removes it.
  await cell(page, 'Agility').click()
  await expect(cell(page, 'Agility')).toHaveAccessibleName('Agility: 0 of 2')
  await expect(cell(page, 'Fellowship')).toBeEnabled()
  await expect(group).toHaveAccessibleName('Starting characteristic increases, 5 of 6 used')
})
