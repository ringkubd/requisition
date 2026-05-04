const installEvent = () => {
    self.addEventListener('install', () => {
        console.log('service worker installed!!!!');
    });
};

installEvent();

const activateEvent = () => {
    self.addEventListener('activate', () => {
        console.log('service worker activated!!!');
    });
};

activateEvent();

self.addEventListener("push", (event) => {
    if (!(self.Notification && self.Notification.permission === "granted")) {
        return;
    }

    const data = event.data?.json() ?? {};
    const title = data.title || "Something Has Happened";
    event.waitUntil(
        self.registration.showNotification(title, {
            body: data.body,
            icon: data.icon,
            tag: 'abcd',
            data: data
        })
    )
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            for (const client of windowClients) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            return clients.openWindow(url);
        })
    );
});
