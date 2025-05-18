/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          blue: {
            50: '#e6f1ff',
            100: '#bdd7fe',
            200: '#90befa',
            300: '#64a5f6',
            400: '#428df3',
            500: '#2374e1',
            600: '#1a5bb0',
            700: '#12427f',
            800: '#0a2a4e',
            900: '#03121e',
          },
          green: {
            50: '#e6fff9',
            100: '#b3ffed',
            200: '#80ffe1',
            300: '#4dffd5',
            400: '#1affc9',
            500: '#00e6b0',
            600: '#00b38a',
            700: '#008063',
            800: '#004d3d',
            900: '#001a15',
          },
          red: {
            50: '#ffe6e6',
            100: '#ffbdbd',
            200: '#ff9494',
            300: '#ff6b6b',
            400: '#ff4242',
            500: '#ff1919',
            600: '#cc0000',
            700: '#990000',
            800: '#660000',
            900: '#330000',
          },
          gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
          },
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        },
        spacing: {
          '72': '18rem',
          '80': '20rem',
          '96': '24rem',
        },
        boxShadow: {
          'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        borderRadius: {
          'xl': '1rem',
          '2xl': '1.5rem',
        },
      },
    },
    plugins: [],
  }