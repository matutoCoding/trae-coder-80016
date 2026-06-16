/**
 * local server entry file, for local development
 */
import app from './app.js';
import { processNoShows } from './services/bookingService.js';
import { processExpiredNotifications, processWaitlistForRoom } from './services/waitlistService.js';
import { getBookings } from './services/bookingService.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

/**
 * 定时任务：处理超时未到的预约和候补通知超时
 */
const CHECK_INTERVAL = 30 * 1000;

setInterval(() => {
  try {
    const noShows = processNoShows();
    
    for (const booking of noShows) {
      processWaitlistForRoom(booking.roomId, booking.startTime, booking.endTime);
    }
    
    processExpiredNotifications();
  } catch (error) {
    console.error('定时任务执行出错:', error);
  }
}, CHECK_INTERVAL);

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;