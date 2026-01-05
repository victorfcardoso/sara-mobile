# E2E Testing Guide

Sara Mobile uses **Maestro** for end-to-end (E2E) testing. Maestro is a mobile UI testing framework that uses YAML-based test flows, making tests easy to write and maintain.

## Why Maestro?

| Feature | Maestro | Detox |
|---------|---------|-------|
| Setup complexity | Low | High |
| Expo compatibility | Excellent | Requires eject |
| Test format | YAML | JavaScript |
| Learning curve | Gentle | Steep |
| CI integration | Simple | Complex |
| Record mode | Built-in | None |

Maestro is the recommended E2E framework for Expo apps due to its simplicity and native Expo support.

## Installation

Maestro CLI must be installed on your machine:

```bash
# macOS (Homebrew)
brew install maestro

# macOS/Linux (curl)
curl -Ls "https://get.maestro.mobile.dev" | bash

# Verify installation
maestro --version
```

For more details, see [Maestro Installation Docs](https://maestro.mobile.dev/getting-started/installing-maestro).

## Directory Structure

```
.maestro/
├── config.yaml           # Global configuration
└── flows/
    ├── init.yaml         # Initialization flow (runs before tests)
    ├── app-launch.yaml   # Basic app launch test
    └── login-smoke.yaml  # Login screen smoke test
```

## Running Tests

### Prerequisites

1. **Maestro CLI installed** (see above)
2. **Simulator/emulator running** with the app installed:
   ```bash
   # iOS Simulator
   pnpm run:ios

   # Android Emulator
   pnpm run:android
   ```

### Commands

```bash
# Run all E2E tests
pnpm e2e

# Run login smoke test only
pnpm e2e:smoke

# Run basic app launch test
pnpm e2e:launch

# Record mode - interactively create tests
pnpm e2e:record
```

### Running a Specific Flow

```bash
maestro test .maestro/flows/login-smoke.yaml
```

### Continuous Mode (Watch)

```bash
maestro test .maestro/flows/login-smoke.yaml --continuous
```

## Writing Tests

Maestro tests are YAML files that describe UI interactions. Here's an annotated example:

```yaml
# test-name.yaml
appId: com.chatwoot.app

---

# Launch app with clean state
- launchApp:
    clearState: true

# Wait for an element to be visible
- extendedWaitUntil:
    visible: "Email"
    timeout: 15000

# Assert an element exists
- assertVisible:
    text: "Login"

# Tap on an element
- tapOn:
    text: "Email"

# Type into an input field
- inputText: "user@example.com"

# Take a screenshot (saved to .maestro/screenshots/)
- takeScreenshot: screenshots/my_test
```

### Common Commands

| Command | Description |
|---------|-------------|
| `launchApp` | Launch or restart the app |
| `tapOn` | Tap on an element |
| `inputText` | Type text into focused field |
| `assertVisible` | Assert element is visible |
| `assertNotVisible` | Assert element is NOT visible |
| `extendedWaitUntil` | Wait for condition with timeout |
| `takeScreenshot` | Capture screenshot |
| `scroll` | Scroll in a direction |
| `back` | Press back button (Android) |
| `hideKeyboard` | Dismiss keyboard |

### Selectors

Maestro can find elements by:

```yaml
# By text (exact)
- tapOn:
    text: "Login"

# By text (regex)
- tapOn:
    text: ".*[Ll]ogin.*"

# By accessibility id (testID in React Native)
- tapOn:
    id: "login-button"

# By index (if multiple matches)
- tapOn:
    text: "Item"
    index: 0
```

## Best Practices

### 1. Use testID Props

For reliable element selection, add `testID` props to key elements:

```tsx
<Button
  testID="login-submit-button"
  text="Login"
  onPress={handleLogin}
/>
```

Then in Maestro:

```yaml
- tapOn:
    id: "login-submit-button"
```

### 2. Keep Tests Independent

Each test should start with a clean app state:

```yaml
- launchApp:
    clearState: true
    clearKeychain: true
```

### 3. Use Realistic Timeouts

Mobile apps can be slow. Use appropriate wait times:

```yaml
- extendedWaitUntil:
    visible: "Welcome"
    timeout: 20000  # 20 seconds for slow loads
```

### 4. Take Screenshots for Debugging

Screenshots help debug failing tests:

```yaml
- takeScreenshot: screenshots/before_login
- tapOn: "Login"
- takeScreenshot: screenshots/after_login
```

### 5. Test Naming Convention

Use descriptive flow names:

```
flows/
├── login-smoke.yaml         # Smoke test for login
├── login-error.yaml         # Login error handling
├── auth-forgot-password.yaml # Password reset flow
├── nav-bottom-tabs.yaml     # Tab navigation
└── settings-language.yaml   # Language settings
```

## CI Integration

### GitHub Actions Example

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  pull_request:
    branches: [main, develop]

jobs:
  e2e-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Maestro
        run: brew install maestro

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install

      - name: Build iOS app
        run: pnpm run:ios --simulator "iPhone 15"

      - name: Run E2E tests
        run: pnpm e2e

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-screenshots
          path: .maestro/screenshots/
```

## Troubleshooting

### App not launching

1. Ensure simulator/emulator is running
2. Check app bundle ID matches `appId` in YAML
3. Try `maestro test --debug <flow.yaml>`

### Element not found

1. Verify element exists with `maestro studio`
2. Check for typos in text/id
3. Increase timeout for slow-loading elements
4. Use regex for dynamic text: `text: ".*Welcome.*"`

### Maestro studio (interactive debugging)

```bash
maestro studio
```

Opens a web interface to explore the app's UI hierarchy.

## Future Improvements

- [ ] Add testID props to key UI elements for reliable selection
- [ ] Create flows for major user journeys (appointments, notifications)
- [ ] Set up CI pipeline for E2E tests
- [ ] Add authentication flow tests (with test credentials)

## Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Expo + Maestro Guide](https://docs.expo.dev/build-reference/e2e-tests/)
- [Maestro Examples](https://github.com/mobile-dev-inc/maestro/tree/main/examples)
