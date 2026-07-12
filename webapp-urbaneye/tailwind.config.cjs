/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#4f46e5',
                    hover: '#4338ca',
                    soft: 'rgba(79, 70, 229, 0.1)',
                },
                secondary: '#ec4899',
                accent: '#10b981',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'premium': '0 10px 40px rgba(0, 0, 0, 0.06)',
                'premium-hover': '0 40px 60px rgba(0, 0, 0, 0.1)',
            }
        },
    },
    plugins: [],
}
