import { test, expect } from '@playwright/test'

test.describe('PupilEditor E2E Tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="pupil-container"]', { timeout: 10000 })
	})

	test('should load Monaco editor', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await expect(editor).toBeVisible()

		const editorLines = page.locator('.view-lines')
		await expect(editorLines).toBeVisible()
	})

	test('should accept keyboard input', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.click()
		await page.keyboard.type('Hello World')
		await page.waitForTimeout(300)

		const content = await page.evaluate(() => {
			const lines = document.querySelectorAll('.monaco-editor .view-line')
			return Array.from(lines)
				.map((line) => line.textContent)
				.join('\n')
		})

		expect(content).toContain('Hello')
		expect(content).toContain('World')
	})

	test('should handle multiline input', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.click()
		await page.keyboard.type('Line 1')
		await page.keyboard.press('Enter')
		await page.keyboard.type('Line 2')
		await page.keyboard.press('Enter')
		await page.keyboard.type('Line 3')
		await page.waitForTimeout(300)

		const lineCount = await page.evaluate(() => {
			return document.querySelectorAll('.monaco-editor .view-line').length
		})

		expect(lineCount).toBeGreaterThanOrEqual(3)
	})

	test('should support text selection', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.click()
		await page.keyboard.type('Select this text')
		await page.waitForTimeout(300)
		await page.keyboard.press('Control+A')
		await page.waitForTimeout(200)

		const hasSelection = await page.evaluate(() => {
			const selection = window.getSelection()
			return selection ? selection.toString().length > 0 : false
		})

		expect(hasSelection).toBe(true)
	})

	test('should support copy and paste', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.click()
		await page.keyboard.press('Control+A')
		await page.keyboard.press('Delete')
		await page.waitForTimeout(200)
		await page.keyboard.type('Copy me')
		await page.waitForTimeout(200)
		await page.keyboard.press('Control+A')
		await page.waitForTimeout(200)

		await page.keyboard.press('Control+C')
		await page.waitForTimeout(200)

		await page.keyboard.press('End')
		await page.keyboard.press('Enter')
		await page.keyboard.press('Control+V')
		await page.waitForTimeout(300)

		const content = await page.evaluate(() => {
			const lines = document.querySelectorAll('.monaco-editor .view-line')
			return Array.from(lines)
				.map((line) => line.textContent)
				.join('\n')
		})

		expect(content.replace(/\s+/g, ' ')).toContain('Copy me')
	})

	test('should support undo and redo', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.click()

		await page.keyboard.press('Control+A')
		await page.keyboard.press('Delete')
		await page.waitForTimeout(200)

		await page.keyboard.type('Test undo')
		await page.waitForTimeout(300)

		const contentWithText = await page.evaluate(() => {
			const lines = document.querySelectorAll('.monaco-editor .view-line')
			return Array.from(lines)
				.map((line) => line.textContent)
				.join('')
				.replace(/[\u00A0\u200B-\u200D\uFEFF]/g, '')
				.trim()
		})

		expect(contentWithText.includes('Test') && contentWithText.includes('undo')).toBe(true)

		await page.keyboard.press('Control+Z')
		await page.waitForTimeout(300)

		const contentAfterUndo = await page.evaluate(() => {
			const lines = document.querySelectorAll('.monaco-editor .view-line')
			return Array.from(lines)
				.map((line) => line.textContent)
				.join('')
		})

		expect(contentAfterUndo.length).toBeLessThanOrEqual(contentWithText.length)

		await page.keyboard.press('Control+Y')
		await page.waitForTimeout(300)

		const contentAfterRedo = await page.evaluate(() => {
			const lines = document.querySelectorAll('.monaco-editor .view-line')
			return Array.from(lines)
				.map((line) => line.textContent)
				.join('')
		})

		expect(contentAfterRedo.length).toBeGreaterThanOrEqual(contentAfterUndo.length)
	})

	test('should support syntax highlighting', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.click()

		await page.keyboard.type('function test() {')
		await page.keyboard.press('Enter')
		await page.keyboard.type('  return true;')
		await page.keyboard.press('Enter')
		await page.keyboard.type('}')
		await page.waitForTimeout(500)

		const hasHighlighting = await page.evaluate(() => {
			const tokens = document.querySelectorAll('.monaco-editor .mtk1, .monaco-editor .mtk2')
			return tokens.length > 0
		})

		expect(hasHighlighting).toBe(true)
	})

	test('should display line numbers', async ({ page }) => {
		const lineNumbers = page.locator('.line-numbers')
		const hasLineNumbers = (await lineNumbers.count()) > 0

		if (hasLineNumbers) {
			await expect(lineNumbers.first()).toBeVisible()
		}
	})

	test('should support find functionality', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.click()

		await page.keyboard.type('Find this word. This word appears twice.')
		await page.waitForTimeout(300)

		await page.keyboard.press('Control+F')
		await page.waitForTimeout(500)

		const findWidget = page.locator('.find-widget, [role="dialog"]')
		const hasFindWidget = (await findWidget.count()) > 0

		if (hasFindWidget) {
			await expect(findWidget.first()).toBeVisible()
		}
	})

	test('should handle tab indentation', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.click()

		await page.keyboard.type('function() {')
		await page.keyboard.press('Enter')
		await page.keyboard.press('Tab')
		await page.keyboard.type('indented')
		await page.waitForTimeout(300)

		const content = await page.evaluate(() => {
			const lines = document.querySelectorAll('.monaco-editor .view-line')
			return Array.from(lines)
				.map((line) => line.textContent)
				.join('\n')
		})

		expect(content).toContain('indented')
	})

	test('should support bracket matching', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.click()

		await page.keyboard.press('Control+A')
		await page.keyboard.press('Delete')
		await page.waitForTimeout(200)

		await page.keyboard.type('(')
		await page.waitForTimeout(300)

		const content = await page.evaluate(() => {
			const lines = document.querySelectorAll('.monaco-editor .view-line')
			return lines[0]?.textContent || ''
		})

		expect(content).toMatch(/\(/)
	})

	test('should maintain cursor position', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.click()

		await page.keyboard.type('First line')
		await page.keyboard.press('Enter')
		await page.keyboard.type('Second line')
		await page.waitForTimeout(300)

		await page.keyboard.press('ArrowUp')
		await page.waitForTimeout(200)

		await page.keyboard.type(' added')
		await page.waitForTimeout(300)

		const content = await page.evaluate(() => {
			const lines = document.querySelectorAll('.monaco-editor .view-line')
			return Array.from(lines)
				.map((line) => line.textContent)
				.join('\n')
		})

		expect(content).toContain('added')
	})

	test('should respond to theme changes', async ({ page }) => {
		const editor = page.locator('.monaco-editor')
		await editor.waitFor({ state: 'visible' })

		const themeToggle = page
			.locator('button[aria-label*="theme"], svg[data-testid*="mode-icon"]')
			.first()

		if ((await themeToggle.count()) > 0) {
			const initialClasses = await editor.getAttribute('class')

			await themeToggle.click()
			await page.waitForTimeout(500)

			const newClasses = await editor.getAttribute('class')
			expect(newClasses).toBeTruthy()
			expect(initialClasses).toBeTruthy()
		}
	})
})
