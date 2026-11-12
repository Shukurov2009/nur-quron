export const NOTIFICATION_EVENT = 'nur:prayer-notification'

export function notificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  if (!notificationSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!notificationSupported()) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  return Notification.requestPermission()
}

export async function showPrayerNotification(
  title: string,
  body: string,
  tag: string,
): Promise<boolean> {
  if (!notificationSupported() || Notification.permission !== 'granted') return false
  try {
    const registration = await navigator.serviceWorker?.getRegistration()
    if (registration) {
      await registration.showNotification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag,
        renotify: true,
        data: { url: '/namoz' },
      } as NotificationOptions)
      return true
    }
    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      tag,
    })
    return true
  } catch {
    try {
      new Notification(title, { body, icon: '/icons/icon-192.png', tag })
      return true
    } catch {
      return false
    }
  }
}

export function dispatchInAppReminder(title: string, body: string) {
  window.dispatchEvent(
    new CustomEvent(NOTIFICATION_EVENT, { detail: { title, body, at: Date.now() } }),
  )
}
