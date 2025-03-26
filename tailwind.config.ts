export default {
  darkMode: 'class',
  corePlugins: {
    preflight: false,
  },
  content: {
    files: ['./src/**/*.{vue,js,ts,jsx,tsx}', './index.html', './src/styles/tailwind.css', './src/**/*.scss'],
  },
  theme: {
    extend: {
      colors: {
        bg_color: 'var(--el-bg-color)',
        primary: 'var(--el-color-primary)',
        text_color_primary: 'var(--el-text-color-primary)',
        text_color_regular: 'var(--el-text-color-regular)',
      },
    },
  },
};
