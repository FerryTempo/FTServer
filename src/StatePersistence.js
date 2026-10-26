/**
 * StatePersistence.js
 * ===================
 * Saves the day's in-memory state (sailing logs, day averages and completed-departure metrics) to a file
 * on a persistent disk, and restores it at startup, so a deploy or restart doesn't wipe the day's history.
 *
 * Enabled only when STATE_DIR is set (for example a Render persistent disk mounted at /var/data);
 * otherwise every call is a no-op. Writes are atomic (temporary file, then rename).
 */
import fs from 'fs';
import path from 'path';
import Logger from './Logger.js';
import {exportStorageState, importStorageState} from './Utils.js';
import {exportCompletedMetrics, importCompletedMetrics} from './FerryTempo.js';

const logger = new Logger();
const STATE_VERSION = 1;
const STATE_FILE_NAME = 'ftserver-state.json';

/**
 * @param {string|undefined} directory - Directory to save to; disabled when empty.
 * @return {string|null} The state file path, or null when disabled.
 */
export function stateFilePath(directory = process.env.STATE_DIR) {
  return directory ? path.join(directory, STATE_FILE_NAME) : null;
}

/**
 * Save the current state. Synchronous, so it can run in a shutdown handler.
 * @param {string|null} filePath - From stateFilePath.
 * @return {boolean} Whether a file was written.
 */
export function saveState(filePath = stateFilePath()) {
  if (!filePath) return false;
  try {
    const state = {
      version: STATE_VERSION,
      savedAt: Math.floor(Date.now() / 1000),
      storage: exportStorageState(),
      completedMetrics: exportCompletedMetrics(),
    };
    fs.mkdirSync(path.dirname(filePath), {recursive: true});
    const temporaryPath = `${filePath}.tmp`;
    fs.writeFileSync(temporaryPath, JSON.stringify(state));
    fs.renameSync(temporaryPath, filePath);
    return true;
  } catch (error) {
    logger.error(`Saving state to ${filePath} failed: ${error.message}`);
    return false;
  }
}

/**
 * Restore state saved by saveState. A missing or unreadable file starts fresh.
 * @param {string|null} filePath - From stateFilePath.
 * @return {boolean} Whether state was restored.
 */
export function loadState(filePath = stateFilePath()) {
  if (!filePath || !fs.existsSync(filePath)) return false;
  try {
    const state = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (state?.version !== STATE_VERSION) {
      logger.info(`Ignoring saved state with version ${state?.version}.`);
      return false;
    }
    importStorageState(state.storage);
    importCompletedMetrics(state.completedMetrics);
    logger.info(`Restored state saved at ${new Date(state.savedAt * 1000).toISOString()}.`);
    return true;
  } catch (error) {
    logger.error(`Restoring state from ${filePath} failed: ${error.message}`);
    return false;
  }
}

/**
 * Restore saved state, then save every `intervalMs` and when the process is asked to stop (Render sends
 * SIGTERM before a deploy or restart).
 * @param {number} intervalMs - Save interval.
 * @return {object|null} The interval timer, or null when disabled.
 */
export function startStatePersistence(intervalMs = 60000) {
  const filePath = stateFilePath();
  if (!filePath) {
    logger.info('STATE_DIR is not set; day state is kept in memory only.');
    return null;
  }
  loadState(filePath);
  const timer = setInterval(() => saveState(filePath), intervalMs);
  timer.unref?.();
  for (const signal of ['SIGTERM', 'SIGINT']) {
    process.once(signal, () => {
      saveState(filePath);
      process.exit(0);
    });
  }
  return timer;
}
