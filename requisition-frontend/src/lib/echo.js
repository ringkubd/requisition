import Echo from 'laravel-echo';
import axios from "@/lib/axios";

const EchoConfig = () =>{
    window.Pusher = require('pusher-js');
    window.Echo = new Echo({
        broadcaster: 'pusher',
        cluster: 'ap2',
        key: '90c92a8a0e2ca163bdb3',// same key used in the pusher key
        wsHost: process.env.SOKETI_URL,// host when you deploy would be your domain
        wsPort: process.env.SOKETI_PORT,// same port
        forceTLS: false, // force https to false
        disableStats: true, // don't send stats to pusher because we aren't using pusher
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

const EchoServer = () => {
    window.Pusher = require('pusher-js');
  return new Echo({
    broadcaster: 'pusher',
    key: '90c92a8a0e2ca163bdb3',
    httpHost: '127.0.0.1',
    wsHost: '127.0.0.1',
    wsPort: 6001,
    wssPort: 6001,
    forceTLS: false,
    encrypted: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
  });
}

export {
  EchoServer
}
