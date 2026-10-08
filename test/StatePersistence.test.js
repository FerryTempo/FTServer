import fs from 'fs';
import os from 'os';
import path from 'path';
import {saveState, loadState, stateFilePath} from '../src/StatePersistence.js';
import {exportStorageState, importStorageState, recordSailingDepartureDelay, getSailingLog} from '../src/Utils.js';
import {exportCompletedMetrics, importCompletedMetrics} from '../src/FerryTempo.js';

describe('StatePersistence', () => {
  let directory;

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ftserver-state-'));
  });

  afterEach(() => {
    fs.rmSync(directory, {recursive: true, force: true});
  });

  test('is disabled without a directory', () => {
    expect(stateFilePath('')).toBeNull();
    expect(saveState(null)).toBe(false);
    expect(loadState(null)).toBe(false);
  });

  test('restores the sailing log after a restart', () => {
    const now = Math.floor(Date.now() / 1000);
    recordSailingDepartureDelay('persist-test-port', now - 600, 420, 1, now - 180);
    const filePath = stateFilePath(directory);
    expect(saveState(filePath)).toBe(true);

    // A restart: memory is empty again.
    importStorageState({delayStorage: {}, sailingLogStorage: {}});
    expect(getSailingLog('persist-test-port', [], now)).toEqual([]);

    expect(loadState(filePath)).toBe(true);
    expect(getSailingLog('persist-test-port', [], now)).toEqual([[now - 600, 420, null, 1]]);
  });

  test('restores the completed-departure metrics', () => {
    importCompletedMetrics({portLastDepartureDelayCache: {'test-port': {value: 300, eventTime: 1, sailingDayId: 'x'}}});
    const filePath = stateFilePath(directory);
    saveState(filePath);
    importCompletedMetrics({portLastDepartureDelayCache: {'test-port': {value: 0, eventTime: 0, sailingDayId: 'y'}}});
    loadState(filePath);
    expect(exportCompletedMetrics().portLastDepartureDelayCache['test-port'].value).toBe(300);
  });

  test('ignores a corrupt file', () => {
    const filePath = stateFilePath(directory);
    fs.writeFileSync(filePath, '{not json');
    const before = JSON.stringify(exportStorageState());
    expect(loadState(filePath)).toBe(false);
    expect(JSON.stringify(exportStorageState())).toBe(before);
  });
});
