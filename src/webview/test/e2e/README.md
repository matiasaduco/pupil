# E2E Tests with Playwright

This directory contains end-to-end tests for the Pupil VS Code extension webview components using Playwright.

## Overview

Unlike the unit tests in the `components/` folder which use mocks extensively, these E2E tests run the actual application in a real browser environment. This provides:

- **Real browser interactions**: Testing with actual DOM events, rendering, and user interactions
- **Integration testing**: Components work together as they would in production
- **Less mocking**: Tests use the real Monaco editor, keyboard library, and other dependencies
- **Visual validation**: Can verify actual UI appearance and behavior

## Test Files

- **PupilContainer.e2e.test.ts**: Tests the main container component including keyboard toggling, focus switching, and overall layout
- **PupilEditor.e2e.test.ts**: Tests the Monaco editor integration including typing, selection, undo/redo, and syntax highlighting
- **PupilKeyboard.e2e.test.ts**: Tests the virtual keyboard including key clicks, layout switching, and special commands
- **RadialKeyboard.e2e.test.ts**: Tests the radial menu including opening, item selection, and submenu navigation

## Running the Tests

### Prerequisites

1. Install dependencies (including Playwright):
   \`\`\`bash
   npm install
   \`\`\`

2. Install Playwright browsers (first time only):
   \`\`\`bash
   npx playwright install
   \`\`\`

### Run All E2E Tests

\`\`\`bash
npm run test:e2e
\`\`\`

### Run with UI Mode (Interactive)

\`\`\`bash
npm run test:e2e:ui
\`\`\`

This opens Playwright's UI where you can:
- See tests run in real-time
- Debug failing tests
- View traces and screenshots
- Run individual tests

### Debug Mode

\`\`\`bash
npm run test:e2e:debug
\`\`\`

Runs tests with Playwright Inspector for step-by-step debugging.

### Run Specific Test File

\`\`\`bash
npx playwright test PupilContainer.e2e.test.ts
\`\`\`

### Run Specific Test

\`\`\`bash
npx playwright test -g "should toggle keyboard visibility"
\`\`\`

## How It Works

1. **Dev Server**: Playwright automatically starts the Vite dev server (`npm run dev`) before running tests
2. **Browser Automation**: Tests run in Chromium (can be configured for Firefox/Safari)
3. **Page Navigation**: Each test navigates to `http://localhost:5173` where the webview is served
4. **Component Interaction**: Tests locate elements and simulate real user interactions (clicks, typing, etc.)
5. **Assertions**: Tests verify the actual DOM state and behavior

## Configuration

The Playwright configuration is in `playwright.config.ts` at the project root. Key settings:

- **testDir**: Points to `src/webview/test/e2e`
- **webServer**: Automatically starts dev server on port 5173
- **baseURL**: `http://localhost:5173`
- **timeout**: 10 seconds for individual tests
- **retries**: 2 retries on CI

## Writing New E2E Tests

### Basic Structure

\`\`\`typescript
import { test, expect } from '@playwright/test'

test.describe('ComponentName E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="pupil-container"]', { timeout: 10000 })
  })

  test('should do something', async ({ page }) => {
    // Locate element
    const button = page.locator('button[aria-label="Save"]')
    
    // Interact
    await button.click()
    
    // Assert
    await expect(page.locator('.success-message')).toBeVisible()
  })
})
\`\`\`

### Best Practices

1. **Use data-testid attributes**: Add `data-testid` to components for reliable selection
2. **Wait for elements**: Use `waitFor()` or `await expect().toBeVisible()`
3. **Handle timing**: Use `waitForTimeout()` sparingly; prefer waiting for specific conditions
4. **Test real user flows**: Simulate actual user interactions, not implementation details
5. **Check conditional elements**: Use `count()` to verify element exists before interacting
6. **Use meaningful selectors**: Prefer text content and ARIA labels over CSS classes

### Selectors

\`\`\`typescript
// By test ID (best for E2E)
page.locator('[data-testid="pupil-keyboard"]')

// By text content
page.locator('button:has-text("Save")')

// By ARIA label
page.locator('button[aria-label="Toggle theme"]')

// By CSS class (less stable)
page.locator('.monaco-editor')

// Chaining
page.locator('[data-testid="keyboard"]').locator('button').first()
\`\`\`

## Debugging Failed Tests

### 1. Visual Traces

When a test fails, Playwright captures a trace:

\`\`\`bash
npx playwright show-report
\`\`\`

This opens an HTML report with:
- Screenshots at each step
- Network requests
- Console logs
- Timeline of actions

### 2. Screenshots

Tests automatically capture screenshots on failure. Find them in `test-results/` folder.

### 3. Headed Mode

See the browser while tests run:

\`\`\`bash
npx playwright test --headed
\`\`\`

### 4. Slow Motion

Slow down test execution to see what's happening:

\`\`\`bash
npx playwright test --headed --slow-mo=1000
\`\`\`

## CI/CD Integration

For GitHub Actions or other CI:

\`\`\`yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
\`\`\`

The tests will automatically:
- Retry failed tests 2 times
- Run in headless mode
- Generate HTML report
- Capture traces for failures

## Comparison with Unit Tests

| Aspect | Unit Tests (Vitest) | E2E Tests (Playwright) |
|--------|---------------------|------------------------|
| **Speed** | Fast (milliseconds) | Slower (seconds) |
| **Scope** | Single component | Full application |
| **Mocking** | Heavy mocking | Minimal mocking |
| **Environment** | jsdom | Real browser |
| **Dependencies** | Mocked | Real |
| **Purpose** | Logic verification | User flow validation |

Both types of tests are valuable:
- **Unit tests**: Verify component logic, edge cases, and state management
- **E2E tests**: Verify user experience, integration, and real-world usage

## Troubleshooting

### Port Already in Use

If port 5173 is busy:
1. Kill the existing process
2. Or change the port in `vite.config.ts` and `playwright.config.ts`

### Tests Timeout

If tests timeout waiting for elements:
1. Check that the dev server started successfully
2. Verify the component actually renders (check console errors)
3. Increase timeout: `{ timeout: 30000 }`

### Monaco Editor Not Loading

If Monaco editor tests fail:
1. Ensure Vite build is working: `npm run dev`
2. Check browser console for errors
3. Verify Monaco CDN is accessible

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Selectors Guide](https://playwright.dev/docs/selectors)
- [Debugging Guide](https://playwright.dev/docs/debug)
