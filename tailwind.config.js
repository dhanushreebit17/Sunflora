/** @type {import('tailwindcss').Config} */
module.exports = {
content: ['./src/**/*.{js,jsx}'],
theme: {
extend: {
colors: {
cream: { 50: '#FFFDF7', 100: '#FBF6EA' },
blush: { 100: '#FBE7E4', 400: '#F2B8B0' },
sage: { 100: '#E7EEE2', 400: '#9CB18E', 700: '#5C7052' },
gold: { 100: '#FBEFCB', 400: '#E0B33C', 700: '#A9791A' },
peach: { 100: '#FCE8E1', 400: '#EFAB98' },
},
fontFamily: {
heading: ['"Patrick Hand"', 'cursive'],
rounded: ['"Quicksand"', 'sans-serif'],
},
borderRadius: { '3xl': '1.75rem' },
},
},
plugins: [],
}