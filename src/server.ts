import { createServer } from 'node:http';
import { config } from 'dotenv';

config();

const PORT = process.env.PORT || 3000;

const fibo = (n: number): number => {
  if (n <= 1) return n;
  return fibo(n - 1) + fibo(n - 2);
};

// Servidor HTTP básico con Node.js nativo
const server = createServer((req, res) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);

  res.writeHead(200, { 'Content-Type': 'application/json' });

  if (url.pathname === '/fibonacci') {
    const n = parseInt(url.searchParams.get('n') || '10', 10);
    const result = fibo(n);
    res.end(
      JSON.stringify({
        message: `Fibonacci of ${n} is: ${result}`,
        value: result,
        timestamp: new Date().toISOString(),
      })
    );
  } else {
    res.end(
      JSON.stringify({
        message: 'Hello from Node.js Backend!',
        endpoints: ['/fibonacci?n=10'],
        timestamp: new Date().toISOString(),
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
      })
    );
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Try: http://localhost:${PORT}/fibonacci?n=10`);
});
export { fibo };
export default server;
