# Taipan!

An unofficial clone of the classic Taipan! trading game, to share with friends.

## Play in development

```bash
npm install
npm run dev
```

## Lint, typecheck, and test

```bash
npm run lint
npm run typecheck
npm test
npm run test:watch
```

`classic.smoke.test.ts` covers minimal firm→port→trade→sail→battle paths. `classic.golden.test.ts` is the broader Classic rule lock (Hong Kong arrival order, PRICE / ship / gun / robbery events, Li Yuen, and the undamaged-ship storm sink quirk) and should stay green before Classic vs Modern work (#2). The storm quirk is intentional Classic behavior: with zero damage, `fR(0)` always sinks the ship on the “going down” path. Modern storms ask for orders (ride it out, run before the wind, or cut cargo loose), and the outcome follows seaworthiness and cargo. The always-sink quirk stays Classic-only.

Pull requests and pushes to `main` run lint, typecheck, and test in GitHub Actions (workflow name **CI**, job **check**). After that workflow has run at least once, the repo owner should enable branch protection on `main` and require the CI check—required status is not enforced by the workflow file alone.

## Install a shared build

Download a build from the [releases](https://github.com/Processoriented/taipan-clone/releases) page.

- macOS: open the DMG and drag Taipan to Applications. Current releases are signed with an Apple Developer ID and notarized. Older unsigned builds stay quarantined; for those, run `xattr -cr /Applications/Taipan.app` in Terminal, then open Taipan.
- Windows: run the installer. It installs for the current user and does not ask for an administrator password. The installer is not code-signed, so SmartScreen says the publisher is unknown. Choose More info, then Run anyway. That warning applies to the first installer. Later updates install from inside the app.

Saves stay in the app data folder, so a newer install keeps them:

- macOS: `~/Library/Application Support/Taipan/saves`
- Windows: `%APPDATA%\Taipan\saves`

v1.0.5 and later check GitHub when the installed app opens. A newer release downloads in the background. When it is ready, Taipan asks you to restart now or later. Later installs the update the next time you quit. Check for Updates in the Taipan menu reports that you are up to date, or that the check failed. A failed check does not stop the app from opening. `npm run dev` does not check.

v1.0.4 and earlier open the release page when a newer build exists. Install v1.0.5 once from that page. Releases after that update from inside the app.

## Publish a patch

1. Bump `version` in `package.json`.
2. Commit that change.
3. Tag the same version and push the tag:

```bash
git tag v1.0.1
git push origin v1.0.1
```

The tag has to be `v` plus the version in `package.json`. GitHub Actions builds a universal macOS DMG, a macOS zip, and a Windows installer. It attaches those files, plus `latest-mac.yml`, `latest.yml`, and the blockmaps, to that release. The installed app downloads the zip on macOS and the installer on Windows.

Builds can also be made locally:

```bash
npm run build:mac
npm run build:win
```

Signing:

- macOS updates need the Developer ID certificate and notarization key the release workflow already uses (`CSC_LINK`, `CSC_KEY_PASSWORD`, `APPLE_API_KEY`, `APPLE_API_KEY_ID`, `APPLE_API_ISSUER`). The release has to include the zip and `latest-mac.yml`. The DMG is only for the first install.
- Windows builds have no code-signing certificate. SmartScreen still applies to the first installer. The per-user NSIS update applies without a certificate. A certificate would clear the unknown-publisher warning on that first installer.

## Icons

The app icon is generated from `src/renderer/src/assets/ship.gif`.

```bash
npm run icons
```

Commit the files that command writes in `build/` and `resources/`.
