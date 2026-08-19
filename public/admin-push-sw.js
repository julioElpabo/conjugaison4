self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  }
  catch {
    data = {}
  }
  const title = data.title || 'Tatitotu'
  event.waitUntil((async () => {
    await self.registration.showNotification(title, {
      body: data.body || 'Nouvelle alerte administrateur.',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.tag || 'tatitotu-admin-alert',
      renotify: true,
      requireInteraction: true,
      silent: false,
      data: { url: data.url || '/admin/charts' },
    })

    if (data.testId) {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      await Promise.all(windows.map(client => client.postMessage({
        type: 'tatitotu-admin-push-test-received',
        testId: data.testId,
      })))
    }
  })())
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = new URL(event.notification.data?.url || '/admin/charts', self.location.origin).href
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const existing = windows.find(client => client.url.startsWith(self.location.origin))
    if (existing) {
      await existing.navigate(targetUrl)
      return existing.focus()
    }
    return self.clients.openWindow(targetUrl)
  })())
})
