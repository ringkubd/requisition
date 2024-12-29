module.exports = {
    apps: {
        name: 'requisition',
        script: 'node_modules/next/dist/bin/next',
        args: 'start -p 1080',
        instances: 2,
        exec_mode: 'cluster',
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env_prod: {
            NODE_ENV: 'production' // NODE_ENV: 'development' || NODE_ENV: 'test'
        }
    }
}
