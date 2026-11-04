/**
 * Live Activities for tracked sailings, kept in the notification database.
 * status: pending (waiting for its start push), started (on the phone), ended.
 */
class LiveActivityStore {
  constructor(db) {
    this.db = db;
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS LiveActivityStartTokens (
        deviceId TEXT PRIMARY KEY,
        token TEXT NOT NULL,
        environment TEXT NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS LiveActivities (
        id INTEGER PRIMARY KEY,
        deviceId TEXT NOT NULL,
        environment TEXT NOT NULL,
        routeId TEXT NOT NULL,
        direction TEXT NOT NULL,
        departingTerminalAbbrev TEXT NOT NULL,
        departingName TEXT NOT NULL,
        arrivingName TEXT NOT NULL,
        scheduledDeparture INTEGER NOT NULL,
        status TEXT NOT NULL,
        updateToken TEXT,
        contentState TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_live_activities_status ON LiveActivities(status);
    `);
  }

  upsertStartToken({ deviceId, token, environment }) {
    this.db.prepare(`
      INSERT INTO LiveActivityStartTokens (deviceId, token, environment, updatedAt)
      VALUES (@deviceId, @token, @environment, unixepoch())
      ON CONFLICT(deviceId) DO UPDATE SET
        token = excluded.token,
        environment = excluded.environment,
        updatedAt = excluded.updatedAt
    `).run({ deviceId, token, environment });
  }

  /** One Live Activity per device: a new one replaces any open one. */
  create(activity) {
    this.db.prepare(`
      UPDATE LiveActivities SET status = 'ended', updatedAt = unixepoch()
      WHERE deviceId = ? AND status != 'ended'
    `).run(activity.deviceId);
    const result = this.db.prepare(`
      INSERT INTO LiveActivities (
        deviceId, environment, routeId, direction, departingTerminalAbbrev, departingName, arrivingName,
        scheduledDeparture, status, createdAt, updatedAt
      ) VALUES (
        @deviceId, @environment, @routeId, @direction, @departingTerminalAbbrev, @departingName, @arrivingName,
        @scheduledDeparture, @status, unixepoch(), unixepoch()
      )
    `).run(activity);
    return result.lastInsertRowid;
  }

  setUpdateToken(id, deviceId, token) {
    return this.db.prepare(`
      UPDATE LiveActivities
      SET updateToken = ?, status = 'started', updatedAt = unixepoch()
      WHERE id = ? AND deviceId = ? AND status != 'ended'
    `).run(token, id, deviceId).changes > 0;
  }

  endForSailing(deviceId, routeId, scheduledDeparture) {
    return this.db.prepare(`
      UPDATE LiveActivities
      SET status = 'ended', updatedAt = unixepoch()
      WHERE deviceId = ? AND routeId = ? AND scheduledDeparture = ? AND status != 'ended'
    `).run(deviceId, routeId, scheduledDeparture).changes > 0;
  }

  /** Whether the device tracks this sailing live (pending or started). */
  hasOpenForSailing(deviceId, routeId, scheduledDeparture) {
    return this.db.prepare(`
      SELECT 1 FROM LiveActivities
      WHERE deviceId = ? AND routeId = ? AND scheduledDeparture = ? AND status != 'ended'
      LIMIT 1
    `).get(deviceId, routeId, scheduledDeparture) != null;
  }

  /** Open activities with the device's push-to-start token, if any. */
  getOpen() {
    return this.db.prepare(`
      SELECT activities.*, startTokens.token AS startToken
      FROM LiveActivities activities
      LEFT JOIN LiveActivityStartTokens startTokens ON startTokens.deviceId = activities.deviceId
      WHERE activities.status != 'ended'
    `).all();
  }

  update(id, { status, contentState }) {
    this.db.prepare(`
      UPDATE LiveActivities
      SET status = COALESCE(@status, status),
        contentState = COALESCE(@contentState, contentState),
        updatedAt = unixepoch()
      WHERE id = @id
    `).run({ id, status: status ?? null, contentState: contentState ?? null });
  }

  removeStartToken(deviceId) {
    this.db.prepare('DELETE FROM LiveActivityStartTokens WHERE deviceId = ?').run(deviceId);
  }
}

export default LiveActivityStore;
