const { createServer } = require('./src/server.cjs');
// Hostinger loads this entry point as a module; listen must run unconditionally.
createServer().listen(Number(process.env.PORT || 4173), process.env.HOST || '127.0.0.1', () => console.log('Adorereve server ready'));
