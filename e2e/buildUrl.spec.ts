import { expect, type Page, test } from '@playwright/test'

async function pickBuild(page: Page) {
  await page.getByRole('button', { name: /Homeworld/ }).click()
  await page.getByRole('menuitem', { name: 'Forge World' }).hover()
  await page.getByRole('menuitemradio', { name: 'Analytic System' }).click()
  await page.getByRole('button', { name: /Origin/ }).click()
  await page.getByRole('menuitemradio', { name: 'Noble' }).click()
  await page.getByRole('button', { name: /^Strength:/ }).click()
  await page.getByRole('button', { name: /^Strength:/ }).click()
}

async function expectBuild(page: Page) {
  await expect(page.getByRole('button', { name: /Homeworld/ })).toContainText('Forge World: Analytic System')
  await expect(page.getByRole('button', { name: /Origin/ })).toContainText('Noble')
  await expect(page.getByRole('button', { name: /^Strength:/ })).toHaveAccessibleName('Strength: 2 of 2')
}

test('an empty planner has no build in its URL', async ({ page }) => {
  await page.goto('/')
  await expect(page).not.toHaveURL(/#/)
})

test('every edit is saved in the URL fragment', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Origin/ }).click()
  await page.getByRole('menuitemradio', { name: 'Noble' }).click()

  await expect(page).toHaveURL(/#.+/)
})

test('a build survives a reload', async ({ page }) => {
  await page.goto('/')
  await pickBuild(page)
  await page.reload()
  await expectBuild(page)
})

test('a copied link opens the same build in a new page', async ({ page, context }) => {
  await page.goto('/')
  await pickBuild(page)

  const newPage = await context.newPage()
  await newPage.goto(page.url())
  await expectBuild(newPage)
})

test('a link pasted into an open page loads that build', async ({ page, context }) => {
  const source = await context.newPage()
  await source.goto('/')
  await pickBuild(source)
  const hash = new URL(source.url()).hash

  await page.goto('/')
  // Same page, new fragment: the browser doesn't reload, it fires `hashchange`.
  await page.goto(`/${hash}`)
  await expectBuild(page)
})

test('edits replace the URL, so Back leaves the planner', async ({ page }) => {
  await page.goto('about:blank')
  await page.goto('/')
  await pickBuild(page)
  await page.goBack()
  await expect(page).toHaveURL('about:blank')
})

test('an unreadable link opens an empty planner', async ({ page }) => {
  await page.goto('/#not*base64url')
  await expect(page.getByRole('button', { name: /Origin/ })).toContainText('Select')
  await expect(page).not.toHaveURL(/#/)
})
