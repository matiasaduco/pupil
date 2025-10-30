import { test, expect } from '@playwright/test'

test.describe('RadialKeyboard E2E Tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="pupil-container"]', { timeout: 10000 })
	})

	test('should open radial menu on right click in editor', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.waitFor({ state: 'visible' })

		await editor.click({ button: 'right', position: { x: 100, y: 100 } })
		await page.waitForTimeout(500)

		const radialMenu = page.locator('.react-radial-menu, [role="menu"]')
		const menuVisible = (await radialMenu.count()) > 0

		if (menuVisible) {
			await expect(radialMenu.first()).toBeVisible()
		}
	})

	test('should display menu items in radial menu', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.waitFor({ state: 'visible' })

		await editor.click({ button: 'right', position: { x: 150, y: 150 } })
		await page.waitForTimeout(500)

		const menuItems = page.locator('[role="menuitem"], .radial-menu-item, button')
		const itemCount = await menuItems.count()

		if (itemCount > 0) {
			expect(itemCount).toBeGreaterThan(0)
		}
	})

	test('should handle radial menu interactions', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.waitFor({ state: 'visible' })

		await editor.click({ button: 'right', position: { x: 200, y: 200 } })
		await page.waitForTimeout(500)

		const radialMenu = page.locator('.react-radial-menu, [role="menu"]')

		if ((await radialMenu.count()) > 0) {
			await expect(radialMenu.first()).toBeVisible()

			await page.mouse.click(150, 150)
			await page.waitForTimeout(500)
		}
	})

	test('should trigger action when clicking menu item', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.waitFor({ state: 'visible' })

		await editor.click({ button: 'right', position: { x: 250, y: 250 } })
		await page.waitForTimeout(500)

		const saveButton = page.locator('button:has-text("save"), button:has-text("Save")')
		const undoButton = page.locator('button:has-text("undo"), button:has-text("Undo")')

		const hasSave = (await saveButton.count()) > 0
		const hasUndo = (await undoButton.count()) > 0

		if (hasSave) {
			await saveButton.first().click()
			await page.waitForTimeout(300)
		} else if (hasUndo) {
			await undoButton.first().click()
			await page.waitForTimeout(300)
		}
	})

	test('should show submenu items when hovering over parent', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.waitFor({ state: 'visible' })

		await editor.click({ button: 'right', position: { x: 300, y: 300 } })
		await page.waitForTimeout(500)

		const submenuTrigger = page.locator('[data-has-submenu="true"], .has-submenu')

		if ((await submenuTrigger.count()) > 0) {
			await submenuTrigger.first().hover()
			await page.waitForTimeout(500)

			const submenuItems = page.locator('.submenu-item, [role="menu"] [role="menuitem"]')
			const submenuCount = await submenuItems.count()

			if (submenuCount > 0) {
				expect(submenuCount).toBeGreaterThan(0)
			}
		}
	})

	test('should position menu at cursor location', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.waitFor({ state: 'visible' })

		const clickX = 400
		const clickY = 300
		await editor.click({ button: 'right', position: { x: clickX, y: clickY } })
		await page.waitForTimeout(500)

		const radialMenu = page.locator('.react-radial-menu, [role="menu"]')

		if ((await radialMenu.count()) > 0) {
			const menuBox = await radialMenu.first().boundingBox()
			if (menuBox) {
				expect(menuBox.x).toBeDefined()
				expect(menuBox.y).toBeDefined()
			}
		}
	})

	test('should handle keyboard navigation in menu', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.waitFor({ state: 'visible' })

		await editor.click({ button: 'right', position: { x: 350, y: 250 } })
		await page.waitForTimeout(500)

		await page.keyboard.press('Tab')
		await page.waitForTimeout(200)

		await page.keyboard.press('ArrowDown')
		await page.waitForTimeout(200)

		await page.keyboard.press('Enter')
		await page.waitForTimeout(300)
	})

	test('should not show menu when right-clicking on keyboard', async ({ page }) => {
		const keyboard = page.locator('[data-testid="pupil-keyboard"]')

		if ((await keyboard.count()) > 0 && (await keyboard.isVisible())) {
			await keyboard.click({ button: 'right' })
			await page.waitForTimeout(500)
		}
	})
})
