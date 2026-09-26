# 07 — Technical Stack

## Runtime (shipped to the browser)

| Concern       | Choice                                      | Version    | Notes                                                                                                                                                                  |
| ------------- | ------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Language      | JavaScript (ES modules, JSX), no TypeScript | ES2022+    |                                                                                                                                                                        |
| UI framework  | React + React DOM                           | ^19.2      | Function components and hooks only. `React.StrictMode` enabled.                                                                                                        |
| Design system | `@cloudscape-design/components`             | ^3.0.1165  | All UI components, including the chart (`MixedLineBarChart`) and the icons.                                                                                            |
| Global styles | `@cloudscape-design/global-styles`          | ^1.0.49    | Imported once in the entry point; `applyMode` for dark mode.                                                                                                           |
| Spreadsheets  | SheetJS `xlsx`                              | **0.20.3** | Installed from the official CDN tarball `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz` (versions > 0.18.5 are not on the npm registry). Read and write `.xlsx`. |
| Markdown      | `react-markdown`                            | ^10.1      | Changelog rendering only.                                                                                                                                              |
| Offline       | `vite-plugin-pwa` (Workbox `generateSW`)    | ^1.3       | Generates the service worker and manifest at build time.                                                                                                               |
| Randomness    | Web Crypto API (`crypto.getRandomValues`)   | native     |                                                                                                                                                                        |
| Storage       | `localStorage`                              | native     |                                                                                                                                                                        |

No other runtime dependency; build and test tools (Vite, plugins, ESLint, Prettier, Vitest…) are `devDependencies`. In particular: no router, no state management library, no CSS framework, no HTTP client, no charting library besides Cloudscape.

## Build and tooling

| Concern              | Choice                                                                                                                                                                                                         | Version                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Node.js              | Required for development and CI                                                                                                                                                                                | ≥ 22.12 (CI: 24)       |
| Package manager      | npm with committed `package-lock.json`                                                                                                                                                                         | npm 10+                |
| Bundler / dev server | Vite with `@vitejs/plugin-react`                                                                                                                                                                               | Vite ^7.3, plugin ^5.1 |
| Linting              | ESLint flat config: `@eslint/js` recommended, `eslint-plugin-react` (recommended + jsx-runtime), `eslint-plugin-react-hooks` (recommended, includes React Compiler rules), `eslint-config-prettier`, `globals` | ESLint ^9.39           |
| Formatting           | Prettier                                                                                                                                                                                                       | ^3.9                   |
| Tests                | Vitest, jsdom, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`                                                                                                            | Vitest ^5.0, jsdom ^30 |
| CI/CD                | GitHub Actions → GitHub Pages                                                                                                                                                                                  |                        |

ESLint stays on major version 9 as long as `eslint-plugin-react` does not support ESLint 10.

## Configuration summary

- **Vite**: `base: "/"`, dev server port `3000`, React plugin, PWA plugin (see [NFR-OFF](06-non-functional-requirements.md#availability-and-offline-operation)); Vitest block: `environment: "jsdom"`, `setupFiles: ["./src/test/setup.js"]`, `css: false`.
- **Prettier** (`.prettierrc.json`): `singleQuote: true`, `semi: true`, `tabWidth: 2`, `printWidth: 100`, `trailingComma: "es5"`. Ignored: `dist`, `dev-dist`, `coverage`, `.vitest`, `node_modules`, `.claude`, `package-lock.json`, `src/changelog.js`.
- **ESLint**: ignores `dist`, `dev-dist`, `src/changelog.js`; browser globals for sources, Node globals for `scripts/**`, `*.config.js` and tests; `react/prop-types` off; React version detected.
- **HTML entry** (`index.html`): `lang="en"`, UTF-8, responsive viewport meta, inline style `html, body { overscroll-behavior: none; }`, favicon `/favicon.ico`, title "Event Check-in", root `div#root`, module script `/src/main.jsx`.
