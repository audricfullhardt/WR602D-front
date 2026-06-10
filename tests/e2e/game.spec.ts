import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('la page se charge et le canvas est visible', async ({ page }) => {
  await expect(page.locator('canvas#game')).toBeVisible()
})

test('le bouton "Jouer" est présent et cliquable', async ({ page }) => {
  const playButton = page.getByRole('button', { name: 'Jouer' })
  await expect(playButton).toBeVisible()
  await expect(playButton).toBeEnabled()
})

test('le HUD avec le score est visible après avoir cliqué sur "Jouer"', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Jouer' }).click()
  await expect(page.locator('#ui-score')).toBeVisible()
})

test('le titre de la page est correct', async ({ page }) => {
  await expect(page).toHaveTitle('wr602d-front')
})
