# Taipan!

An unofficial clone of the classic Taipan! trading game, to share with friends.

## Play in development

```bash
npm install
npm run dev
```

## Install a shared build

Download a build from the [releases](https://github.com/Processoriented/taipan-clone/releases) page.

- macOS: open the DMG and drag Taipan to Applications. The app is not signed with an Apple Developer ID, so the first launch needs a right-click on the app and then Open. If macOS says the app is damaged, run `xattr -cr /Applications/Taipan.app` and open it again.
- Windows: run the installer. It installs for the current user and does not ask for an administrator password. SmartScreen will say the publisher is unknown. Choose More info, then Run anyway.

Those prompts come back for each new download. Saves stay in the app data folder, so a newer install keeps them:

- macOS: `~/Library/Application Support/Taipan/saves`
- Windows: `%APPDATA%\Taipan\saves`

The installed app checks GitHub when it opens. If a newer release exists, it links to the download. Check for Updates is in the Taipan menu.

## Publish a patch

1. Bump `version` in `package.json`.
2. Commit that change.
3. Tag the same version and push the tag:

```bash
git tag v1.0.1
git push origin v1.0.1
```

The tag has to be `v` plus the version in `package.json`. GitHub Actions builds a universal macOS DMG and a Windows installer and attaches them to that release.

Builds can also be made locally:

```bash
npm run build:mac
npm run build:win
```

Silent auto-update is not included. macOS only installs those updates for apps signed with a paid Apple Developer ID. `electron-builder.yml` already publishes to this GitHub repository, which is the setting that later step would use.

## Icons

The app icon is generated from `src/renderer/src/assets/ship.gif`.

```bash
npm run icons
```

Commit the files that command writes in `build/` and `resources/`.
