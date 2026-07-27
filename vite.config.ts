import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const deriveBasePath = () => {
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH;
  }

  const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  return repositoryName ? `/${repositoryName}/` : '/';
};

export default defineConfig(({ command }) => ({
  base: command === 'build' ? deriveBasePath() : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true
  }
}));
