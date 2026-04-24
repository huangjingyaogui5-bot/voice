self.addEventListener('push', (event) => {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icon.png',
        badge: '/badge.png',
        data: { url: data.url },
        tag: 'voice-mement-notification' // 通知の上書き防止
    };

    event.waitUntil(
        self.ServiceWorkerRegistration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUnitil(
        clients.openWindow(event.notification.data.url)
    );
});