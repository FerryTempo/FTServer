import Database from 'better-sqlite3';

class NotificationStore {
  constructor(dbPath = process.env.NOTIFICATION_DB_PATH || 'data/notifications.sqlite') {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initialize();
  }

  initialize() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS PushTokens (
        id INTEGER PRIMARY KEY,
        deviceId TEXT NOT NULL UNIQUE,
        platform TEXT NOT NULL,
        token TEXT NOT NULL,
        environment TEXT NOT NULL,
        appVersion TEXT,
        disabled INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS NotificationSubscriptions (
        id INTEGER PRIMARY KEY,
        deviceId TEXT NOT NULL,
        routeId TEXT NOT NULL,
        direction TEXT NOT NULL,
        departingTerminalAbbrev TEXT,
        arrivingTerminalAbbrev TEXT,
        scheduledDeparture INTEGER NOT NULL,
        scheduledDepartureTimeKey TEXT NOT NULL,
        triggerType TEXT NOT NULL,
        triggerMinutes INTEGER,
        recurrence TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_active
        ON NotificationSubscriptions(active, routeId, direction, scheduledDeparture);

      CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_daily
        ON NotificationSubscriptions(active, routeId, direction, scheduledDepartureTimeKey);

      CREATE TABLE IF NOT EXISTS FiredNotifications (
        id INTEGER PRIMARY KEY,
        dedupeKey TEXT NOT NULL UNIQUE,
        subscriptionId INTEGER NOT NULL,
        deviceId TEXT NOT NULL,
        routeId TEXT NOT NULL,
        direction TEXT NOT NULL,
        scheduledDeparture INTEGER NOT NULL,
        triggerKey TEXT NOT NULL,
        firedAt INTEGER NOT NULL
      );
    `);
  }

  close() {
    this.db.close();
  }

  upsertPushToken(tokenInfo) {
    const now = Math.floor(Date.now() / 1000);
    return this.db.prepare(`
      INSERT INTO PushTokens (
        deviceId,
        platform,
        token,
        environment,
        appVersion,
        disabled,
        createdAt,
        updatedAt
      ) VALUES (
        @deviceId,
        @platform,
        @token,
        @environment,
        @appVersion,
        0,
        @now,
        @now
      )
      ON CONFLICT(deviceId) DO UPDATE SET
        platform = excluded.platform,
        token = excluded.token,
        environment = excluded.environment,
        appVersion = excluded.appVersion,
        disabled = 0,
        updatedAt = excluded.updatedAt
    `).run({
      ...tokenInfo,
      appVersion: tokenInfo.appVersion || '',
      now,
    });
  }

  createSubscription(subscription) {
    const now = Math.floor(Date.now() / 1000);
    const result = this.db.prepare(`
      INSERT INTO NotificationSubscriptions (
        deviceId,
        routeId,
        direction,
        departingTerminalAbbrev,
        arrivingTerminalAbbrev,
        scheduledDeparture,
        scheduledDepartureTimeKey,
        triggerType,
        triggerMinutes,
        recurrence,
        active,
        createdAt,
        updatedAt
      ) VALUES (
        @deviceId,
        @routeId,
        @direction,
        @departingTerminalAbbrev,
        @arrivingTerminalAbbrev,
        @scheduledDeparture,
        @scheduledDepartureTimeKey,
        @triggerType,
        @triggerMinutes,
        @recurrence,
        1,
        @now,
        @now
      )
    `).run({
      ...subscription,
      departingTerminalAbbrev: subscription.departingTerminalAbbrev || '',
      arrivingTerminalAbbrev: subscription.arrivingTerminalAbbrev || '',
      triggerMinutes: subscription.triggerMinutes ?? null,
      now,
    });

    return this.getSubscription(result.lastInsertRowid);
  }

  getSubscription(subscriptionId) {
    return this.db.prepare(`
      SELECT *
      FROM NotificationSubscriptions
      WHERE id = ?
    `).get(subscriptionId);
  }

  getSubscriptionsForDevice(deviceId) {
    return this.db.prepare(`
      SELECT *
      FROM NotificationSubscriptions
      WHERE deviceId = ? AND active = 1
      ORDER BY scheduledDeparture, triggerType, triggerMinutes
    `).all(deviceId);
  }

  deactivateSubscription(subscriptionId, deviceId) {
    const result = this.db.prepare(`
      UPDATE NotificationSubscriptions
      SET active = 0, updatedAt = unixepoch()
      WHERE id = ? AND deviceId = ?
    `).run(subscriptionId, deviceId);
    return result.changes > 0;
  }

  getActiveSubscriptionsForSailing(sailing) {
    return this.db.prepare(`
      SELECT subscriptions.*, tokens.token, tokens.environment
      FROM NotificationSubscriptions subscriptions
      JOIN PushTokens tokens ON tokens.deviceId = subscriptions.deviceId
      WHERE subscriptions.active = 1
        AND tokens.disabled = 0
        AND subscriptions.routeId = @routeId
        AND subscriptions.direction = @direction
        AND (
          (
            subscriptions.recurrence = 'once'
            AND subscriptions.scheduledDeparture = @scheduledDeparture
          )
          OR (
            subscriptions.recurrence = 'daily'
            AND subscriptions.scheduledDepartureTimeKey = @scheduledDepartureTimeKey
          )
        )
    `).all(sailing);
  }

  recordFiredNotification(event) {
    const result = this.db.prepare(`
      INSERT OR IGNORE INTO FiredNotifications (
        dedupeKey,
        subscriptionId,
        deviceId,
        routeId,
        direction,
        scheduledDeparture,
        triggerKey,
        firedAt
      ) VALUES (
        @dedupeKey,
        @subscriptionId,
        @deviceId,
        @routeId,
        @direction,
        @scheduledDeparture,
        @triggerKey,
        @firedAt
      )
    `).run(event);

    return result.changes > 0;
  }

  removeFiredNotification(dedupeKey) {
    this.db.prepare(`
      DELETE FROM FiredNotifications
      WHERE dedupeKey = ?
    `).run(dedupeKey);
  }

  markTokenDisabled(deviceId) {
    this.db.prepare(`
      UPDATE PushTokens
      SET disabled = 1, updatedAt = unixepoch()
      WHERE deviceId = ?
    `).run(deviceId);
  }
}

export default NotificationStore;
