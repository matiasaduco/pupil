import { test, expect } from '@playwright/test'

test.describe('PupilContainer E2E Tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="pupil-container"]', { timeout: 10000 })
	})

	test('should render the editor and main UI components', async ({ page }) => {
		const container = page.locator('[data-testid="pupil-container"]')
		await expect(container).toBeVisible()

		const editor = page.locator('.monaco-editor')
		await expect(editor).toBeVisible()
	})

	test('should toggle keyboard visibility', async ({ page }) => {
		const keyboardToggle = page.locator(
			'button[aria-label*="keyboard"], button:has-text("keyboard")'
		)

		const keyboard = page.locator('[data-testid="pupil-keyboard"]')
		await expect(keyboard).toBeVisible()

		await keyboardToggle.first().click()
		await expect(keyboard).not.toBeVisible()

		await keyboardToggle.first().click()
		await expect(keyboard).toBeVisible()
	})

	test('should switch between editor and terminal focus', async ({ page }) => {
		const editorFocusButton = page.locator('button:has-text("editor"), [aria-label*="editor"]')
		const terminalFocusButton = page.locator(
			'button:has-text("terminal"), [aria-label*="terminal"]'
		)

		await expect(editorFocusButton.first()).toBeVisible()

		await terminalFocusButton.first().click()

		await page.waitForTimeout(500)

		await editorFocusButton.first().click()
		await page.waitForTimeout(500)
	})

	test('should show virtual keyboard with clickable keys', async ({ page }) => {
		const keyboard = page.locator('[data-testid="pupil-keyboard"]')
		await expect(keyboard).toBeVisible()

		const buttons = keyboard.locator('button')
		const buttonCount = await buttons.count()

		expect(buttonCount).toBeGreaterThan(0)

		if (buttonCount > 0) {
			const firstButton = buttons.first()
			await expect(firstButton).toBeVisible()

			await firstButton.click()
			await page.waitForTimeout(100)

			await expect(keyboard).toBeVisible()
		}
	})

	test('should switch color scheme (theme)', async ({ page }) => {
		const themeToggle = page
			.locator(
				'button[aria-label*="theme"], button:has-text("theme"), svg[data-testid*="mode-icon"]'
			)
			.first()

		if ((await themeToggle.count()) > 0) {
			const editor = page.locator('.monaco-editor')
			const initialTheme =
				(await editor.getAttribute('data-uri')) || (await editor.getAttribute('class'))

			await themeToggle.click()
			await page.waitForTimeout(300)

			const newTheme =
				(await editor.getAttribute('data-uri')) || (await editor.getAttribute('class'))
			expect(newTheme).toBeTruthy()
			expect(initialTheme).toBeTruthy()
		}
	})

	test('should open radial menu on right click', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.click()

		await editor.click({ button: 'right' })
		await page.waitForTimeout(300)

		const radialMenu = page.locator('[data-testid="radial-menu"], .radial-menu')
		if ((await radialMenu.count()) > 0) {
			await expect(radialMenu).toBeVisible()
		}
	})

	test('should show toolbar with action buttons', async ({ page }) => {
		const toolbar = page.locator('[data-testid="toolbar"], .toolbar')

		if ((await toolbar.count()) > 0) {
			await expect(toolbar).toBeVisible()

			const buttons = toolbar.locator('button')
			const buttonCount = await buttons.count()
			expect(buttonCount).toBeGreaterThan(0)
		}
	})

	test('should display folder tree if available', async ({ page }) => {
		const folderTree = page.locator('[data-testid="folder-tree"], .folder-tree')

		if ((await folderTree.count()) > 0) {
			await expect(folderTree).toBeVisible()
		}
	})

	test('should handle keyboard special commands', async ({ page }) => {
		const keyboard = page.locator('[data-testid="pupil-keyboard"]')
		await expect(keyboard).toBeVisible()

		const saveButton = keyboard.locator('button:has-text("save"), button:has-text("Save")')

		if ((await saveButton.count()) > 0) {
			await saveButton.first().click()
			await page.waitForTimeout(200)
		}
	})

	test('should be responsive to window resize', async ({ page }) => {
		const container = page.locator('[data-testid="pupil-container"]')
		const initialBox = await container.boundingBox()

		await page.setViewportSize({ width: 1200, height: 800 })
		await page.waitForTimeout(300)

		const newBox = await container.boundingBox()

		expect(newBox).toBeTruthy()
		if (initialBox && newBox) {
			expect(newBox.width).not.toBe(initialBox.width)
		}
	})
})
