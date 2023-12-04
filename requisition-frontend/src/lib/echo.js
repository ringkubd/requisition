import Echo from 'laravel-echo';
import axios from "@/lib/axios";
import process from "next/dist/build/webpack/loaders/resolve-url-loader/lib/postcss";

const EchoConfig = () =>{
    window.Pusher = require('pusher-js');
    window.Echo = new Echo({
        broadcaster: 'pusher',
        cluster: 'ap2',
        key: '90c92a8a0e2ca163bdb3',// same key used in the pusher key
        wsHost: process.env.SOKETI_URL ?? 'soketi.isdb-bisew.org',// host when you deploy would be your domain
        wsPort: process.env.SOKETI_PORT ?? 443,// same port
        forceTLS: process.env.SOKETI_FORCE_TLS !== "false", // force https to false
        disableStats: true, // don't send stats to pusher because we aren't using pusher
        enabledTransports: ['ws', 'wss'],
        authorizer: (channel, option) => {
            return {
                authorize: (socketId, callback) => {
                    axios.post('api/broadcasting/auth', {
                        socket_id: socketId,
                        channel_name: channel.name,
                    })
                        .then(response => {
                            callback(false, response.data);
                        })
                        .catch(error => {
                            callback(true, error);
                        });
                }
            }
        }
    })
}

export {
    EchoConfig
}
