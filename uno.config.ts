import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  theme: {
    colors: {
      bg_color: 'var(--el-bg-color)',
      primary: 'var(--el-color-primary)',
      text_color_primary: 'var(--el-text-color-primary)',
      text_color_regular: 'var(--el-text-color-regular)',
    },
  },
  shortcuts: {
    'flex-c': 'flex justify-center items-center',
    'flex-ac': 'flex justify-around items-center',
    'flex-bc': 'flex justify-between items-center',
    'navbar-bg-hover': 'dark:text-white dark:hover:!bg-[#242424]',
  },
});
