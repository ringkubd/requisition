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
    const message =
        data.message || "Here's something you might want to check out.";
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
    var doge = event.notification.data;
    console.log(doge);
});
