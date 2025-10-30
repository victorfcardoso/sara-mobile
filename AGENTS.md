# Repository Guidelines

## Project Structure & Module Organization
- `App.tsx` hosts the Expo entrypoint; runtime configuration stays in `app.config.ts`.
- Core code lives in `src/`: `screens/` for routed views, `components-next/` for shared UI, `store/` for Redux slices, `services/` for API clients, and helpers in `hooks/`, `utils/`, and `constants/`.
- Assets sit in `assets/`; Storybook tooling is under `.storybook/`; native tweaks reside in `patches/` and `with-ffmpeg-pod.js`.

## Build, Test, and Development Commands
- `pnpm install` — install dependencies (pnpm is canonical; lockfile is `pnpm-lock.yaml`).
- `pnpm start` — run the Expo dev client.
- `pnpm ios` / `pnpm android` — compile and launch the native shells via `expo run`.
- `pnpm lint` — enforce ESLint + Prettier; fix violations before raising a PR.
- `pnpm test` — execute the Jest suite; pair with `--watch` during local cycles.
- `pnpm build:ios` / `pnpm build:android` — trigger EAS production builds; use `:local` when testing.

## Coding Style & Naming Conventions
- Prettier defines format: 2-space indent, single quotes, trailing commas, 100-character lines; run `pnpm lint --fix` to stay compliant.
- Use `PascalCase` for React components, `camelCase` for hooks/utilities, and `SCREAMING_SNAKE_CASE` for constants. Keep file names aligned with their primary export.
- Centralize design tokens in `src/theme/` or Tailwind config and mirror navigation route names with their screen files.

## Testing Guidelines
- Jest with the React Native preset drives tests; shared mocks belong in the root `__mocks__/`.
- Co-locate specs beside sources as `*.test.ts(x)` so they auto-load, stubbing network calls with axios mocks.
- Run `pnpm test` before commits and guard async flows with fake timers or mocked sockets to avoid flaky regressions.

## Commit & Pull Request Guidelines
- Follow the conventional commit style in history (`feat:`, `fix:`, `chore:`) with imperative summaries under 72 characters.
- Reference related issues (`(#123)`), and capture breaking changes with upgrade notes or migration steps.
- PRs need a concise summary, platform test evidence (Android + iOS for UI), and refreshed media when visuals change.
- Complete the PR checklist, flag configuration updates, and wait for passing lint/test runs before requesting review.

## Environment & Release Tips
- Base secrets on `.env.example`; never commit real credentials and document new keys in the PR.
- `pnpm run run:doctor` validates native linking; rerun after changing pods or Gradle plugins.
- When adjusting native modules, update the paired patch in `patches/` and outline migration steps for the release team.
