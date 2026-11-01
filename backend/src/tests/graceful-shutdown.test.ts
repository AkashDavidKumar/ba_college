/**
 * graceful-shutdown.test.ts — Verify server closes on SIGTERM
 *
 * This test starts a real HTTP server on a test port, sends SIGTERM to the
 * current process (or simulates it), and verifies that the server stops
 * accepting connections.
 *
 * Limitation: Sending SIGTERM to the current Jest process would terminate the
 * entire test run. Instead, we test the shutdown logic directly by:
 *  1. Starting an HTTP server.
 *  2. Calling server.close() as the shutdown handler would.
 *  3. Verifying that subsequent connections are refused.
 *
 * This is a practical test of the shutdown mechanism without the side effect
 * of killing the test runner.
 */
import http from 'http';
import net from 'net';
import { createApp } from '../app';

async function startServer(): Promise<{ server: http.Server; port: number }> {
  return new Promise((resolve) => {
    const app = createApp({ corsOrigins: ['http://localhost:3000'], trustProxy: false });
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      resolve({ server, port });
    });
  });
}

async function closeServer(server: http.Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => { if (err) reject(err); else resolve(); });
  });
}

async function isPortAccepting(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    sock.setTimeout(500);
    sock.on('connect', () => { sock.destroy(); resolve(true); });
    sock.on('error', () => resolve(false));
    sock.on('timeout', () => resolve(false));
    sock.connect(port, '127.0.0.1');
  });
}

describe('Graceful shutdown', () => {
  it('server closes cleanly via server.close()', async () => {
    const { server, port } = await startServer();

    // Verify it is accepting connections before closing
    const acceptingBefore = await isPortAccepting(port);
    expect(acceptingBefore).toBe(true);

    // Simulate the shutdown handler
    await closeServer(server);

    // After close, port should no longer be accepting connections
    const acceptingAfter = await isPortAccepting(port);
    expect(acceptingAfter).toBe(false);
  });

  it('server.close() resolves without error when no connections are open', async () => {
    const { server } = await startServer();
    await expect(closeServer(server)).resolves.toBeUndefined();
  });
});
