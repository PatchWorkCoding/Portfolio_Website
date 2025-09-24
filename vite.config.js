
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    base: '/Portfolio_Website/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                nested: resolve(__dirname, 'Dreams_Of_Disquiet/Dreams_Of_Disquiet.html'),
                nested2: resolve(__dirname, 'FMA/FMA.html'),
            },
        },
    },
})
