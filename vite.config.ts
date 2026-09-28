import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { spawn, type ChildProcess } from 'node:child_process';
import http from 'node:http';

function bhumiBackendPlugin(): Plugin {
  let backendProcess: ChildProcess | null = null;

  return {
    name: 'bhumi-backend-runner',
    configureServer(server) {
      // Check if backend on port 5000 is already active
      const checkReq = http.get('http://127.0.0.1:5000/api/health', () => {
        console.log('[BHUMI] Connected to active backend server on http://localhost:5000');
      });

      checkReq.on('error', () => {
        console.log('[BHUMI] Backend server is not running. Auto-starting Node.js backend on http://localhost:5000...');
        backendProcess = spawn('node', ['server/index.js'], {
          stdio: 'inherit',
          shell: true,
          env: { ...process.env, PORT: '5000' }
        });

        backendProcess.on('error', (err) => {
          console.error('[BHUMI] Failed to auto-start backend server:', err.message);
        });
      });

      const cleanup = () => {
        if (backendProcess && !backendProcess.killed) {
          try {
            if (process.platform === 'win32' && backendProcess.pid) {
              spawn('taskkill', ['/pid', backendProcess.pid.toString(), '/f', '/t']);
            } else {
              backendProcess.kill();
            }
          } catch (_) {}
          backendProcess = null;
        }
      };

      process.on('exit', cleanup);
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
      server.httpServer?.on('close', cleanup);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), bhumiBackendPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res: any) => {
            console.warn(`[Vite Proxy] Backend service connecting or unreachable: ${err.message}`);
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: false,
                data: null,
                message: 'Backend server is starting up or temporarily offline.'
              }));
            }
          });
        }
      }
    }
  }
});
