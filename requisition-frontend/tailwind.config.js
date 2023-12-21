const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    content: [
        './src/**/*.js',
        './public/**/*.svg',
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
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                wiggle: 'wiggle 1s ease-in-out infinite',
                fall: 'fall 3s ease infinite',
            },
            keyframes: {
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
                fall: {
                    '0%': { transform: 'translate(0%,-150%) skewX(0deg)' },
                    '50%': { transform: 'translate(0%,0%) skewX(-10deg)' },
                    '100%': { transform: 'translate(0%,150%) skewX(0deg)' },
                },
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
        require("tailwindcss-animate"),
    ],
}
