const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    content: [
        './src/**/*.js',
        "./node_modules/flowbite-react/**/*.js",
        './styles/globals.css',
        "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
    ],
    darkMode: 'media',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Nunito', ...defaultTheme.fontFamily.sans],
            },
            boxShadow: {
                'sm' : 'box-shadow: 0 1px 2px 0 #f59e0b;',
                'md' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }
        },
    },
    variants: {
        extend: {
            opacity: ['disabled'],
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require("flowbite/plugin"),
    ],
}
