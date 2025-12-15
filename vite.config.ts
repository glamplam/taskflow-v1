import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 기본 500kB 제한을 2000kB(2MB)로 늘려 경고를 방지합니다.
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // 거대 라이브러리들을 별도의 파일로 분리하여 로딩 속도 최적화
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-utils': ['@supabase/supabase-js', '@google/genai'],
          'vendor-ui': ['recharts', 'lucide-react']
        }
      }
    }
  }
});