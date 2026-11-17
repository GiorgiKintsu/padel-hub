# Padel Hub — development environment

Updated: 2026-11-16.

## Stack

- React Native + Expo SDK 58 + TypeScript + Expo Router.
- Node.js 22 and npm; use the committed package lock with `npm ci`.
- Android Studio and an Android emulator for Android testing.
- Expo Go on a physical iPhone for iOS testing from Linux. iOS Simulator requires macOS.

## Setup

From `mobile/`:

```sh
npm ci
npm start
```

Start an Android virtual device in Android Studio, then run `npm run android`.
For the browser preview, run `npm run web`.

For a phone on a different network:

```sh
npx expo start --tunnel ngrok
```

Use the current QR code and keep the development server running. Tunnel URLs are temporary and expose the development bundle through ngrok. Use an Expo Go version compatible with the project's SDK. If sign-in is required, use the same Expo account on the phone and development machine.

## Verification

On 2026-11-16, after the code was restructured, lint, TypeScript checks, and all 32 domain and translation tests passed, and the full booking path was walked through in the web preview. The Android and iOS bundles were last compiled before that restructuring. These checks do not replace testing on physical devices.

```sh
npm run check   # lint + typecheck + tests
```

Project requirements and current implementation status are recorded in `docs/PADEL_HUB_FULL_DOCUMENTATION.md`.
