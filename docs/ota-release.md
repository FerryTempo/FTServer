# FTClient OTA Release

This server exposes the OTA endpoints used by deployed FTClient devices:

- `GET /api/v1/check-update?type=flash`
- `GET /api/v1/check-update?type=spiffs`
- `GET /api/v1/update?type=flash`
- `GET /api/v1/update?type=spiffs`

Devices check for updates periodically while connected to Wi-Fi. The current
firmware version and model are sent in the query string. The server compares
those values against the update maps in `src/App.js`.

## Firmware Release Steps

1. In `FTClient/FerryTempoClient/include/FTconfig.h`, bump `VERSION`.
2. Build the firmware from the FTClient repo:

   ```sh
   cd /Users/matthewcarrig/Documents/GitHub/FTClient/FerryTempoClient
   python3 -m platformio run -e lolin_s2_mini
   ```

3. Copy the built firmware into this repo's update folder with a versioned name:

   ```sh
   cp /Users/matthewcarrig/Documents/GitHub/FTClient/FerryTempoClient/.pio/build/lolin_s2_mini/firmware.bin \
     /Users/matthewcarrig/Documents/GitHub/FTServer/src/updates/FTC_<version>_<date>.bin
   ```

4. In `src/App.js`, add every deployed source firmware version that should
   update to the new artifact:

   ```js
   const firmwareUpdates = {
     "PointsOfSail_8M" : {
       "2.0.0": "FTC_2.0.2_2026_06_22.bin",
       "2.0.1": "FTC_2.0.2_2026_06_22.bin",
     }
   };
   ```

5. Verify the server can see the artifact:

   ```sh
   npm test -- --runInBand
   ```

6. Commit and deploy FTServer.

## SPIFFS Release Steps

Use a SPIFFS OTA release only when files under `FTClient/FerryTempoClient/data`
change. The build script writes the current filesystem version to
`fs_version.txt`.

1. Build the filesystem image from the FTClient repo:

   ```sh
   cd /Users/matthewcarrig/Documents/GitHub/FTClient/FerryTempoClient
   python3 -m platformio run -e lolin_s2_mini -t buildfs
   ```

2. Copy `.pio/build/lolin_s2_mini/spiffs.bin` into `FTServer/src/updates` with a
   versioned name.
3. Add the deployed source SPIFFS version mapping to `spiffsUpdates` in
   `src/App.js`.
4. Run tests, commit, and deploy FTServer.

## Field Behavior

- Devices check approximately hourly while connected.
- During OTA, all four nav lamps pulse together.
- A device already on the target version should not be added to the source
  version map, or it will repeatedly see the same update.
