/**
 * The title and body shown for a sailing notification, shared by the APNs (iOS) and FCM (Android) clients.
 */
export function getNotificationText(payload) {
  return {
    title: payload.title || 'FerryTempo',
    body: payload.body || getDefaultBody(payload),
  };
}

function getDefaultBody(payload) {
  if (payload.triggerKey === 'departed') {
    return `${payload.vesselName || 'Your ferry'} has departed.`;
  }

  if (payload.triggerKey?.startsWith('eta_')) {
    const minutes = payload.triggerKey.replace('eta_', '');
    return `${payload.vesselName || 'Your ferry'} is about ${minutes} minutes from dock.`;
  }

  return 'Your ferry notification is ready.';
}
