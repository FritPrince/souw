import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
    const plugins = [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
    ];

    // Ne générer les types Wayfinder qu'en mode développement
    // En production, les types doivent être générés manuellement avant le build
    if (command === 'serve') {
        plugins.push(
        wayfinder({
            formVariants: true,
            })
        );
    }

    return {
        plugins,
    esbuild: {
        jsx: 'automatic',
    },
    };
});
