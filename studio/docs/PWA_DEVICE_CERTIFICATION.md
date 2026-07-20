# Radbit PWA device certification

Automated browser emulation is a preflight check, not real-device certification. A release is certified only when every required row below records a physical device or named device-cloud session, evidence, tester, and date.

## Release gate

Run automated preflight against the deployed candidate:

```powershell
$env:PLAYWRIGHT_BASE_URL="https://candidate.radbitstudios.co.zw"
npm run test:pwa
```

Then complete the physical matrix. Store screenshots or screen recordings with the release artifacts.

| Platform | Minimum device | Required browser/mode | Install | Cold launch | Offline shell | Offline saved work | Reconnect sync | Push + deep link | Safe areas/keyboard | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| iOS | iPhone, iOS 16.4 | Safari → Home Screen | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Pending |
| iOS current | Current iPhone/current iOS | Safari → Home Screen | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Pending |
| iPadOS | iPad/current iPadOS | Safari → Home Screen | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Pending |
| Android | Android 10+ | Chrome installed PWA | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Pending |
| Android current | Pixel/current Android | Chrome installed PWA | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Pending |
| Samsung | Galaxy/current supported OS | Samsung Internet installed PWA | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Pending |

## Required scenario

1. Clear site data and install from the browser.
2. Confirm the correct Radbit icon, name, standalone window and theme/status bar.
3. Sign in, open Action Centre, and create a uniquely named action.
4. Disable Wi-Fi and mobile data.
5. Relaunch from the Home Screen and confirm the offline shell and previously saved data.
6. Create or edit offline-capable work and confirm a visible pending-sync state.
7. Restore connectivity and confirm exactly-once synchronization.
8. Enable notifications from a user gesture, close the app, send a test push, and verify its deep link.
9. Rotate the device, open the keyboard, inspect notches/home indicators, and confirm no horizontal overflow.
10. Restart the device and repeat cold launch.

## Failure policy

- Any data loss, duplicate mutation, inaccessible primary action, failed install, blank offline launch, or misrouted push is release-blocking.
- Platform limitations must be explained in-product; silent degradation is a failure.
- Record device model, OS version, browser version, deployed commit, tester, timestamp, and evidence URL for every run.
