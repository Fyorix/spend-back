import { createProxyMiddleware } from 'http-proxy-middleware';
import { JwtService } from '@nestjs/jwt';
import { loadEnvConfig } from './env.config.js';

export function createWsProxyMiddleware(jwtService: JwtService) {
  const config = loadEnvConfig();

  return createProxyMiddleware({
    target: config.wsServiceUrl,
    ws: true,
    changeOrigin: true,
    on: {
      proxyReqWs: (proxyReq, req, socket) => {
        const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
        let token = req.headers.authorization?.split(' ')[1];

        if (!token) {
          const authQuery = url.searchParams.get('auth');
          if (authQuery) {
            try {
              const auth = JSON.parse(authQuery) as { token?: string };
              token = auth.token;
            } catch {
              token = authQuery;
            }
          }
        }

        if (!token) {
          token = (url.searchParams.get('token') as string) || (url.searchParams.get('accessToken') as string) || undefined;
        }

        if (!token) {
          console.warn(`[ProxyWS] No token found for ${req.url}`);
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
          return;
        }

        try {
          const payload = jwtService.verify(token) as { sub: string };
          if (payload?.sub) {
            req.headers['x-user-id'] = payload.sub;
            proxyReq.setHeader('x-user-id', payload.sub);
          } else {
            console.error('[ProxyWS] Invalid token payload: sub missing');
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
          }
        } catch (error) {
          console.error('[ProxyWS] JWT verification failed:', error instanceof Error ? error.message : 'Unknown error');
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
        }
      },
    },
  });
}
