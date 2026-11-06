import Database from 'better-sqlite3';
import {
  createUpdateCheckPruner,
  getUpdateCheckRetentionOptions,
  DEFAULT_MAX_ROWS,
  DEFAULT_PRUNE_INTERVAL_SECONDS,
  DEFAULT_RETENTION_SECONDS,
} from '../src/UpdateCheckRetention.js';

const NOW = 2000000000;

function createDb() {
  const db = new Database(':memory:');
  db.exec('CREATE TABLE UpdateChecks (id INTEGER PRIMARY KEY, saveDate INTEGER, deviceCid TEXT)');
  return db;
}

function insert(db, saveDate, deviceCid = 'cid') {
  db.prepare('INSERT INTO UpdateChecks (saveDate, deviceCid) VALUES (?, ?)').run(saveDate, deviceCid);
}

const savedDates = (db) => db.prepare('SELECT saveDate FROM UpdateChecks ORDER BY id').all()
    .map((row) => row.saveDate);

describe('createUpdateCheckPruner', () => {
  test('drops rows older than the retention window', () => {
    const db = createDb();
    insert(db, NOW - 1000);
    insert(db, NOW - 100);
    insert(db, NOW);

    const prune = createUpdateCheckPruner(db, { retentionSeconds: 500, maxRows: 100, intervalSeconds: 60 });
    expect(prune(NOW)).toBe(true);
    expect(savedDates(db)).toEqual([NOW - 100, NOW]);
  });

  test('keeps only the newest maxRows rows', () => {
    const db = createDb();
    for (let i = 0; i < 5; i++) {
      insert(db, NOW + i);
    }

    createUpdateCheckPruner(db, { retentionSeconds: 1000, maxRows: 2, intervalSeconds: 60 })(NOW + 5);
    expect(savedDates(db)).toEqual([NOW + 3, NOW + 4]);
  });

  test('prunes at most once per interval', () => {
    const db = createDb();
    const prune = createUpdateCheckPruner(db, { retentionSeconds: 100, maxRows: 100, intervalSeconds: 60 });
    expect(prune(NOW)).toBe(true);

    insert(db, NOW - 500);
    expect(prune(NOW + 59)).toBe(false);
    expect(savedDates(db)).toEqual([NOW - 500]);

    expect(prune(NOW + 60)).toBe(true);
    expect(savedDates(db)).toEqual([]);
  });

  test('indexes UpdateChecks by saveDate', () => {
    const db = createDb();
    createUpdateCheckPruner(db);
    createUpdateCheckPruner(db);
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'UpdateChecks'")
        .all().map((row) => row.name);
    expect(indexes).toEqual(['idx_UpdateChecks_saveDate']);
  });
});

describe('getUpdateCheckRetentionOptions', () => {
  test('uses the defaults when nothing is set', () => {
    expect(getUpdateCheckRetentionOptions({})).toEqual({
      retentionSeconds: DEFAULT_RETENTION_SECONDS,
      maxRows: DEFAULT_MAX_ROWS,
      intervalSeconds: DEFAULT_PRUNE_INTERVAL_SECONDS,
    });
  });

  test('reads positive integers and ignores invalid values', () => {
    expect(getUpdateCheckRetentionOptions({
      UPDATE_CHECK_RETENTION_SECONDS: '3600',
      MAX_UPDATE_CHECK_ROWS: 'lots',
      UPDATE_CHECK_PRUNE_INTERVAL_SECONDS: '0',
    })).toEqual({
      retentionSeconds: 3600,
      maxRows: DEFAULT_MAX_ROWS,
      intervalSeconds: DEFAULT_PRUNE_INTERVAL_SECONDS,
    });
  });
});
