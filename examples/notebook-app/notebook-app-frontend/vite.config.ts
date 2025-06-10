import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'env-check',
      config: () => {
        if (!process.env.VITE_USERPOOL_ID) {
          throw new Error('VITE_USERPOOL_ID is not set')
        }
      },
    },
  ],
})
