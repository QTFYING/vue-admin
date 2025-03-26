/** @type {import('postcss-load-config').Config} */

export default {
  plugins: {
    'postcss-nested': {},
    '@tailwindcss/postcss': {
      tailwindcss: {},
      autoprefixer: {},
    },
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
  },
};
