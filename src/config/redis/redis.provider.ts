import { createClient } from 'redis';

export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
});

redisClient.on('connect', () => {
  console.log('✅ Redis Connected');
});

redisClient.on('error', (err) => {
  console.log('❌ Redis Error:', err);
});

(async () => {
  await redisClient.connect();
})();