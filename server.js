  require('dotenv').config({ path: './src/config/config.env' });
  const { server } = require('./app');
  const http = require('http');
  const socketIo = require('socket.io');
  const connectDatabase = require('./src/config/database');
  const express = require('express');
  const path = require('path');
  const os = require('os');
  const { initializeSocket } = require('./src/utils/socket');

  const port = process.env.PORT || 4000;
  const env = process.env.NODE_ENV || 'development';

  // Handle Uncaught exceptions
  process.on('uncaughtException', err => { 
      console.log(`ERROR: ${err.stack}`); 
      console.log('Shutting down due to uncaught exception');
      process.exit(1);
  });

  // Connecting to database
  connectDatabase();  

  // app.use('/api/v1', require('./routes/order.routes'));
  // app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  // app.use('/api/v1', require('./routes/chat.routes'));


  // unhandled promise rejection eror
  process.on('unhandledRejection', err =>{ 
    console.log(`ERROR: ${err.stack}`);
    console.log("shutting down the server due to handled error");
    server.close(()=>{
        process.exit(1)
    })
  })

  // handle uncaught exceptions
  process.on("uncaughtException", err=>{
    console.log(`Message : ${err.message}`)
    console.log("shutting down the server due to uncaughtException");
    process.exit(1)
  }) 

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on all interfaces (0.0.0.0), port ${port}`);

    // Get local network IPs
    const networkInterfaces = os.networkInterfaces();
    Object.values(networkInterfaces).forEach((interfaces) => {
      interfaces.forEach((iface) => {
        if (iface.family === "IPv4" && !iface.internal) {
          console.log(`Local IP: ${iface.address}`);
        }
      });
    });
  });

  // Handle Unhandled Promise rejections
  process.on('unhandledRejection', err => {
      console.log(`ERROR: ${err.stack}`);
      console.log('Shutting down the server due to Unhandled Promise rejection');
      server.close(() => {
          process.exit(1);
      });
  }); 