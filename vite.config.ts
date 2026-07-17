import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// GitHub Pages 배포를 위해 base는 반드시 상대 경로를 사용한다.
// 라우팅은 HashRouter를 쓰므로 새로고침 404가 발생하지 않는다.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    // 모바일 LTE 환경을 고려해 번들이 커지면 경고한다.
    chunkSizeWarningLimit: 400,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
