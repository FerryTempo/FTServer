/**
 * Keeps the in-memory UpdateChecks table bounded (#164): rows older than the retention window are
 * dropped, then the newest maxRows are kept. Pruning runs at most once per interval.
 */

export const DEFAULT_RETENTION_SECONDS = 7 * 24 * 60 * 60;
export const DEFAULT_MAX_ROWS = 20000;
export const DEFAULT_PRUNE_INTERVAL_SECONDS = 300;

function positiveIntegerOr(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Reads the limits from the environment, falling back to the defaults for unset or invalid values.
 * @param {object} env - The environment, usually process.env
 */
export function getUpdateCheckRetentionOptions(env = {}) {
  return {
    retentionSeconds: positiveIntegerOr(env.UPDATE_CHECK_RETENTION_SECONDS, DEFAULT_RETENTION_SECONDS),
    maxRows: positiveIntegerOr(env.MAX_UPDATE_CHECK_ROWS, DEFAULT_MAX_ROWS),
    intervalSeconds: positiveIntegerOr(env.UPDATE_CHECK_PRUNE_INTERVAL_SECONDS, DEFAULT_PRUNE_INTERVAL_SECONDS),
  };
}

/**
 * Indexes UpdateChecks by saveDate and returns a prune(nowEpochSeconds) function for it.
 * @param {object} db - A better-sqlite3 database that already has the UpdateChecks table
 * @param {object} options - retentionSeconds, maxRows and intervalSeconds
 */
export function createUpdateCheckPruner(db, {
  retentionSeconds = DEFAULT_RETENTION_SECONDS,
  maxRows = DEFAULT_MAX_ROWS,
  intervalSeconds = DEFAULT_PRUNE_INTERVAL_SECONDS,
} = {}) {
  db.exec('CREATE INDEX IF NOT EXISTS idx_UpdateChecks_saveDate ON UpdateChecks(saveDate)');
  const deleteExpired = db.prepare('DELETE FROM UpdateChecks WHERE saveDate <= ?');
  const trimToMaxRows = db.prepare(`
    DELETE FROM UpdateChecks
    WHERE id NOT IN (SELECT id FROM UpdateChecks ORDER BY id DESC LIMIT ?)
  `);
  let lastPruneAt = null;

  return function pruneUpdateChecks(nowEpochSeconds = Math.floor(Date.now() / 1000)) {
    if (lastPruneAt !== null && nowEpochSeconds - lastPruneAt < intervalSeconds) {
      return false;
    }
    lastPruneAt = nowEpochSeconds;
    deleteExpired.run(nowEpochSeconds - retentionSeconds);
    trimToMaxRows.run(maxRows);
    return true;
  };
}
