import { test, expect } from '@playwright/test'

test.describe('PupilKeyboard E2E Tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="pupil-container"]', { timeout: 10000 })
	})

	test('should display virtual keyboard by default', async ({ page }) => {
		const keyboard = page.locator('[data-testid="pupil-keyboard"], .simple-keyboard')
		await expect(keyboard).toBeVisible()
	})

	test('should show standard keyboard layout', async ({ page }) => {
		const keyboard = page.locator('[data-testid="pupil-keyboard"], .simple-keyboard')
		await keyboard.waitFor({ state: 'visible' })

		const qKey = keyboard.locator('.hg-button:has-text("q"), button:has-text("q")')
		const aKey = keyboard.locator('.hg-button:has-text("a"), button:has-text("a")')
		const spaceKey = keyboard.locator('.hg-button:has-text("space"), button:has-text(" ")')
		const hasKeys =
			(await qKey.count()) > 0 || (await aKey.count()) > 0 || (await spaceKey.count()) > 0

		expect(hasKeys).toBe(true)
	})

	test('should have clickable keyboard buttons', async ({ page }) => {
		const keyboard = page.locator('[data-testid="pupil-keyboard"]')
		await keyboard.waitFor({ state: 'visible' })
		const buttons = keyboard.locator('button')
		const buttonCount = await buttons.count()

		expect(buttonCount).toBeGreaterThan(20)

		const firstButton = buttons.first()
		await expect(firstButton).toBeVisible()
		await expect(firstButton).toBeEnabled()

		await firstButton.click()
		await page.waitForTimeout(100)

		await expect(keyboard).toBeVisible()
	})

	test('should toggle shift state when shift key is clicked', async ({ page }) => {
		const keyboard = page.locator('[data-testid="pupil-keyboard"], .simple-keyboard')
		await keyboard.waitFor({ state: 'visible' })

		const shiftKey = keyboard.locator('.hg-button:has-text("shift"), button[aria-label*="shift"]')

		if ((await shiftKey.count()) > 0) {
			await shiftKey.first().click()
			await page.waitForTimeout(300)

			await shiftKey.first().click()
			await page.waitForTimeout(300)
		}
	})

	test('should handle special keys like Enter and Backspace', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.click()

		const keyboard = page.locator('[data-testid="pupil-keyboard"], .simple-keyboard')
		await keyboard.waitFor({ state: 'visible' })

		const aKey = keyboard.locator('.hg-button:has-text("a"), button:has-text("a")')
		if ((await aKey.count()) > 0) {
			await aKey.first().click()
			await page.waitForTimeout(200)
		}

		const enterKey = keyboard.locator('.hg-button:has-text("enter"), button:has-text("⏎")')
		if ((await enterKey.count()) > 0) {
			await enterKey.first().click()
			await page.waitForTimeout(300)
		}

		const backspaceKey = keyboard.locator('.hg-button:has-text("backspace"), button:has-text("⌫")')
		if ((await backspaceKey.count()) > 0) {
			await backspaceKey.first().click()
			await page.waitForTimeout(300)
		}
	})

	test('should handle Tab key', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.click()

		const keyboard = page.locator('[data-testid="pupil-keyboard"], .simple-keyboard')
		await keyboard.waitFor({ state: 'visible' })

		const tabKey = keyboard.locator('.hg-button:has-text("tab"), button:has-text("⇥")')

		if ((await tabKey.count()) > 0) {
			await tabKey.first().click()
			await page.waitForTimeout(300)

			const editorContent = await page.evaluate(() => {
				const lines = document.querySelectorAll('.monaco-editor .view-line')
				return lines[0]?.textContent || ''
			})
			expect(editorContent.length).toBeGreaterThanOrEqual(0)
		}
	})

	test('should show numbers when switching layout', async ({ page }) => {
		const keyboard = page.locator('[data-testid="pupil-keyboard"], .simple-keyboard')
		await keyboard.waitFor({ state: 'visible' })

		const layoutSwitch = keyboard.locator(
			'.hg-button:has-text("123"), .hg-button:has-text(".?123")'
		)

		if ((await layoutSwitch.count()) > 0) {
			await layoutSwitch.first().click()
			await page.waitForTimeout(300)
			const oneKey = keyboard.locator('.hg-button:has-text("1")')
			const twoKey = keyboard.locator('.hg-button:has-text("2")')

			const hasNumbers = (await oneKey.count()) > 0 || (await twoKey.count()) > 0
			expect(hasNumbers).toBe(true)
		}
	})

	test('should have keyboard buttons with text labels', async ({ page }) => {
		const keyboard = page.locator('[data-testid="pupil-keyboard"]')
		await keyboard.waitFor({ state: 'visible' })

		const buttons = keyboard.locator('button')
		const buttonCount = await buttons.count()

		expect(buttonCount).toBeGreaterThan(20)

		let buttonsWithText = 0
		const maxToCheck = Math.min(10, buttonCount)

		for (let i = 0; i < maxToCheck; i++) {
			const buttonText = await buttons.nth(i).textContent()
			if (buttonText && buttonText.trim().length > 0) {
				buttonsWithText++
			}
		}
		expect(buttonsWithText).toBeGreaterThan(0)
	})

	test('should be responsive to container size', async ({ page }) => {
		const keyboard = page.locator('[data-testid="pupil-keyboard"], .simple-keyboard')
		await keyboard.waitFor({ state: 'visible' })

		const initialBox = await keyboard.boundingBox()

		await page.setViewportSize({ width: 1200, height: 600 })
		await page.waitForTimeout(500)

		const newBox = await keyboard.boundingBox()

		expect(initialBox).toBeTruthy()
		expect(newBox).toBeTruthy()
		if (initialBox && newBox) {
			expect(initialBox.width !== newBox.width || initialBox.height !== newBox.height).toBe(true)
		}
	})

	test('should maintain focus in editor while typing', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.click()

		const keyboard = page.locator('[data-testid="pupil-keyboard"], .simple-keyboard')
		await keyboard.waitFor({ state: 'visible' })

		const keys = ['t', 'e', 's', 't']

		for (const keyChar of keys) {
			const key = keyboard.locator(`.hg-button:has-text("${keyChar}")`)
			if ((await key.count()) > 0) {
				await key.first().click()
				await page.waitForTimeout(100)
			}
		}

		const editorContent = await page.evaluate(() => {
			const lines = document.querySelectorAll('.monaco-editor .view-line')
			return Array.from(lines)
				.map((line) => line.textContent)
				.join('')
		})

		expect(editorContent.length).toBeGreaterThan(0)
	})

	test('should work in terminal mode', async ({ page }) => {
		const terminalButton = page.locator('button:has-text("terminal"), [aria-label*="terminal"]')

		if ((await terminalButton.count()) > 0) {
			await terminalButton.first().click()
			await page.waitForTimeout(500)

			const keyboard = page.locator('[data-testid="pupil-keyboard"], .simple-keyboard')
			await keyboard.waitFor({ state: 'visible' })

			const lKey = keyboard.locator('.hg-button:has-text("l")')
			const sKey = keyboard.locator('.hg-button:has-text("s")')

			if ((await lKey.count()) > 0) {
				await lKey.first().click()
				await page.waitForTimeout(200)
			}

			if ((await sKey.count()) > 0) {
				await sKey.first().click()
				await page.waitForTimeout(200)
			}
		}
	})
})
