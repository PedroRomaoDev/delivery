/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        fontFamily: {
            sans: ['Poppins', 'sans-serif'],
        },
        extend: {
            colors: {
                brand: {
                    'dark-green': '#0F3B2E',
                    primary: '#0F3B2E',
                    gold: '#C9A227',
                    accent: '#C9A227',
                    'dark-gray': '#818181',
                    'text-gray': '#9A9C9F',
                    'light-gray': '#EEEEEE',
                    white: '#FFFFFF',
                    black: '#000000',
                    background: '#F8F8F8',
                    border: '#F4F4F5',
                    process: '#C9A227',
                    danger: '#EF4444',
                },
            },
        },
    },
    plugins: [],
};
