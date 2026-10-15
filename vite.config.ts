import { defineConfig } from 'vite';

// No GitHub Pages o site é servido em https://<usuario>.github.io/projeto-clima/,
// então os assets precisam desse prefixo. Em dev continua servindo na raiz.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/projeto-clima/' : '/',
}));
