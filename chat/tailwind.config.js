/** @type {import('tailwindcss').Config} */
module.exports = {
    // purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    content: [
        // Example content paths...
        './public/**/*.html',
        './src/**/*.{js,jsx,ts,tsx,vue}',
    ],
    darkMode: 'media', // or 'media' or 'class'
    theme: {
        extend: {
            keyframes: {},
            animation: {},
        },
    },
    variants: {
        extend: {},
    },
    plugins: [require("daisyui")],
}