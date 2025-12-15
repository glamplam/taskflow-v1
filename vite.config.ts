import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 현재 작업 디렉토리의 .env 파일 등을 로드합니다.
  // 세 번째 인자를 ''로 설정하여 VITE_ 접두사가 없는 변수(API_KEY 등)도 로드합니다.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // 클라이언트 코드에서 process.env.API_KEY를 사용할 수 있도록 값을 주입합니다.
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-utils': ['@supabase/supabase-js', '@google/genai'],
            'vendor-ui': ['recharts', 'lucide-react']
          }
        }
      }
    }
  };
});