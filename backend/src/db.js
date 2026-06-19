const mongoose = require('mongoose');

let connection = mongoose.connection;

/**
 * Connects to MongoDB with retries and event logging.
 * @param {string} uri MongoDB connection string
 * @param {object} opts mongoose connect options
 */
async function connect(uri, opts = {}) {
  if (!uri) throw new Error('MONGODB_URI is not set');

  const options = Object.assign({
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
  }, opts);

  const maxRetries = 5;
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      await mongoose.connect(uri, options);
      // Setup listeners
      connection.on('connected', () => {
        console.log('Mongoose connected to', uri);
      });
      connection.on('error', (err) => {
        console.error('Mongoose connection error:', err);
      });
      connection.on('disconnected', () => {
        console.warn('Mongoose disconnected');
      });
      connection.on('reconnected', () => {
        console.log('Mongoose reconnected');
      });
      return connection;
    } catch (err) {
      attempt += 1;
      const waitMs = Math.pow(2, attempt) * 1000;
      console.error(`MongoDB connection attempt ${attempt} failed: ${err.message}. Retrying in ${waitMs}ms`);
      if (attempt >= maxRetries) {
        console.error('Max MongoDB connection attempts reached.');
        throw err;
      }
      await new Promise((res) => setTimeout(res, waitMs));
    }
  }
}

async function close() {
  try {
    await mongoose.disconnect();
    console.log('Mongoose disconnected cleanly');
  } catch (err) {
    console.error('Error while disconnecting mongoose:', err);
  }
}

function getState() {
  return connection.readyState; // 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
}

module.exports = { connect, close, getState };
