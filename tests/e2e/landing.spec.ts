import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('displays title and navigates to phase select on button click', async ({ page }) => {
    await page.goto('/')

    // Landing page shows the title
    await expect(page.locator('h1')).toHaveText('四渡赤水·全景沙盘')

    // Click the enter button
    const enterBtn = page.locator('.landing-btn')
    await expect(enterBtn).toBeVisible()
    await enterBtn.click()

    // Should navigate to phase select
    await expect(page).toHaveURL(/phase-select/)
  })
})

test.describe('Phase select page', () => {
  test('displays 5 phase cards', async ({ page }) => {
    await page.goto('/phase-select')

    // Page title
    await expect(page.locator('h2')).toHaveText('选择战役阶段')

    // 5 phase cards
    const cards = page.locator('.phase-card')
    await expect(cards).toHaveCount(5)

    // Each card should have name, date, and two buttons
    const firstCard = cards.first()
    await expect(firstCard.locator('.card-name')).toBeVisible()
    await expect(firstCard.locator('.card-date')).toBeVisible()
    await expect(firstCard.locator('.narrative-btn')).toBeVisible()
    await expect(firstCard.locator('.explore-btn')).toBeVisible()
  })
})
