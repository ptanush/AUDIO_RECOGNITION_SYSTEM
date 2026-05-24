const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const app = require('./app');
const { initializeDatabase } = require('./config/mongo');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`✅ Audio identification backend listening on http://localhost:${PORT}`);
    });

    initializeDatabase().catch((error) => {
      console.warn('⚠️  Background database initialization failed:', error.message || error);
    });

    // Graceful error handling — prevents nodemon crash-loop on EADDRINUSE
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use!\n`);
        console.error('Run this command to free it, then restart:\n');
        console.error(`  PowerShell: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
        process.exit(1);
      } else {
        throw err;
      }
    });
  } catch (error) {
    console.error('Failed to start backend:');
    console.error(error.message || error);
    process.exit(1);
  }
};

startServer();
