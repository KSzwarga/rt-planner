import { expect, type Page, test } from '@playwright/test'

/** Opens the Soldier's level-up screen, after taking the given starting increases. */
async function openSoldier(page: Page, startingIncreases: string[] = []) {
  await page.goto('/')
  for (const characteristic of startingIncreases) {
    await page.getByRole('button', { name: new RegExp(`^${characteristic}:`) }).click()
  }
  await page.getByRole('group', { name: 'First archetype' }).getByRole('button', { name: 'Soldier' }).click()
}

function node(page: Page, level: number, title: string) {
  return page.getByRole('button', { name: new RegExp(`^Level ${level} ${title}: `) })
}

function options(page: Page) {
  return page.getByRole('region', { name: /./ }).filter({ has: page.getByRole('heading', { level: 2 }) }).first()
}

function option(page: Page, name: string) {
  return page.getByRole('button', { name, exact: true })
}

test('any level can be opened and filled first', async ({ page }) => {
  await openSoldier(page)
  await node(page, 15, 'Ultimate upgrade').click()
  await option(page, 'Upgrade 2').click()

  await expect(node(page, 15, 'Ultimate upgrade')).toHaveAccessibleName('Level 15 Ultimate upgrade: Upgrade 2')
  await expect(node(page, 5, 'Talents')).toHaveAccessibleName('Level 5 Talents: empty')
})

test('a requirement counts only the choices before the slot', async ({ page }) => {
  // STR 30 + 2 starting increases = 40. Heavy Armour Proficiency needs 45.
  await openSoldier(page, ['Strength', 'Strength'])

  await node(page, 5, 'Talents').click()
  await expect(option(page, 'Heavy Armour Proficiency')).toHaveAttribute('aria-disabled', 'true')

  // An increase at level 10 comes after level 5, so it doesn't help there.
  await node(page, 10, 'Characteristic increase').click()
  await option(page, 'Strength').click()
  await node(page, 5, 'Talents').click()
  await option(page, 'Heavy Armour Proficiency').hover()
  await expect(page.getByRole('note', { name: 'Requirements' })).toContainText('Requires STR 45')
  await expect(option(page, 'Heavy Armour Proficiency')).toHaveAttribute('aria-disabled', 'true')

  // The level 5 increase comes just before the level 5 talent, so it does.
  await node(page, 5, 'Characteristic increase').click()
  await option(page, 'Strength').click()
  await node(page, 5, 'Talents').click()
  await option(page, 'Heavy Armour Proficiency').click()
  await expect(node(page, 5, 'Talents')).toHaveAccessibleName('Level 5 Talents: Heavy Armour Proficiency')
})

test('changing an earlier choice nulls the later choices that depended on it', async ({ page }) => {
  await openSoldier(page)
  await node(page, 7, 'Common talents').click()
  await option(page, 'Base Skill: Athletics').click()
  await node(page, 12, 'Common talents').click()
  await option(page, 'Advanced Skill: Athletics').click()
  await expect(node(page, 12, 'Common talents')).toHaveAccessibleName('Level 12 Common talents: Advanced Skill: Athletics')

  await node(page, 7, 'Common talents').click()
  await option(page, 'Base Skill: Awareness').click()

  await expect(node(page, 12, 'Common talents')).toHaveAccessibleName('Level 12 Common talents: empty')
})

test('a characteristic at its cap is shown in red', async ({ page }) => {
  await openSoldier(page)
  await node(page, 5, 'Characteristic increase').click()
  await option(page, 'Agility').click()
  await node(page, 6, 'Characteristic increase').click()
  await option(page, 'Agility').click()

  await node(page, 7, 'Characteristic increase').click()
  await expect(option(page, 'Agility')).toHaveAttribute('aria-disabled', 'true')
  await expect(option(page, 'Strength')).toHaveAttribute('aria-disabled', 'false')
  // Weapon Skill isn't a Soldier characteristic, so it isn't offered at all.
  await expect(option(page, 'Weapon Skill')).toHaveCount(0)
})

test("talent options are grouped by list, the archetype's list first", async ({ page }) => {
  await openSoldier(page)
  await node(page, 4, 'Talents').click()

  const groups = page.getByRole('list')
  await expect(groups.first()).toHaveAccessibleName('Soldier')
  await expect(groups.nth(1)).toHaveAccessibleName('Common')
})

test('clicking the current option clears it', async ({ page }) => {
  await openSoldier(page)
  await node(page, 2, 'Skill increase').click()
  await option(page, 'Medicae').click()
  await expect(node(page, 2, 'Skill increase')).toHaveAccessibleName('Level 2 Skill increase: Medicae')

  await option(page, 'Medicae').click()
  await expect(node(page, 2, 'Skill increase')).toHaveAccessibleName('Level 2 Skill increase: empty')
})

test('keystone features show what they are, with nothing to pick', async ({ page }) => {
  await openSoldier(page)
  await page.getByRole('button', { name: 'Level 1 keystone feature: Run and Gun' }).click()

  await expect(page.getByText('Keystone features are fixed by the archetype and cannot be changed.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Run and Gun' })).toBeVisible()
})

test('level-up choices are saved in the link', async ({ page }) => {
  await openSoldier(page)
  await node(page, 2, 'Skill increase').click()
  await option(page, 'Medicae').click()

  await page.reload()
  await page.getByRole('group', { name: 'First archetype' }).getByRole('button', { name: 'Soldier' }).click()
  await expect(node(page, 2, 'Skill increase')).toHaveAccessibleName('Level 2 Skill increase: Medicae')
  void options
})
