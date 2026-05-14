export const notificationRecurrences = Object.freeze({
  once: 'once',
  daily: 'daily',
});

export const notificationTriggerTypes = Object.freeze({
  departed: 'departed',
  eta: 'eta',
});

export const allowedEtaMinutes = Object.freeze([5, 10, 15, 20, 25, 30]);

export function getTriggerKey(triggerType, triggerMinutes) {
  if (triggerType === notificationTriggerTypes.departed) {
    return notificationTriggerTypes.departed;
  }

  return `eta_${triggerMinutes}`;
}

