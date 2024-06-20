import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {vitePlugin as remix} from '@remix-run/dev';
import tsconfigPaths from 'vite-tsconfig-paths';
import {vercelPreset} from '@vercel/remix/vite';

export default defineConfig({
  plugins: [
    hydrogen(),
    remix({presets: [hydrogen.preset(), vercelPreset()]}),
    tsconfigPaths(),
  ],
  ssr: {
    optimizeDeps: {
      include: [
        'typographic-base',
        '@react-three/fiber',
        'three',
        '@react-three/drei',
        '@react-three/postprocessing',
        'formik',
        'yup',
      ],
    },
  },
  optimizeDeps: {
    include: [
      'clsx',
      '@headlessui/react',
      'typographic-base',
      'react-intersection-observer',
      'react-use/esm/useScroll',
      'react-use/esm/useDebounce',
      'react-use/esm/useWindowScroll',
      '@react-three/fiber',
      'three',
      '@react-three/drei',
      '@react-three/postprocessing',
      'formik',
      'yup',
    ],
  },
  build: {
    // Allow a strict Content-Security-Policy
    // withtout inlining assets as base64:
    assetsInlineLimit: 0,
  },
});
