const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { initializeSocket } = require('./src/utils/socket');
const path = require('path');
const { startSchedulers } = require('./src/services/scheduler.service');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// CORS configuration
// const corsOptions = {
//   origin: ["http://localhost:5173" , 'https://cebleu-platform.netlify.app' , 'https://cebleu.com'], 
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true, 
//   optionsSuccessStatus: 200,
// };
 
// Apply CORS middleware
app.use(cors());

// Create HTTP server 
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Start the schedulers
startSchedulers();

// Add this middleware to serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// import all routes
const products = require("./src/routes/product.routes");
const errorMiddleWire = require('./src/middlewares/errors.middleware');
const auth = require('./src/routes/auth.routes');
const order = require('./src/routes/order.routes');
const user = require('./src/routes/user.routes');
const categoryRoutes = require('./src/routes/category.routes');
const adRoutes = require("./src/routes/ad.routes");
const packageRoutes = require("./src/routes/package.routes");
const storeRotues = require("./src/routes/store.routes");
const discountRoutes = require('./src/routes/discount.routes');
const reviewRoutes = require('./src/routes/review.routes'); 
const chatRoutes = require('./src/routes/chat.routes'); 
const customerContact = require('./src/routes/customerContact.route');
const Subscription = require('./src/routes/subscription.routes')

app.get('/' , (req, res)=>{
    res.send("Hello world");
})

app.use('/api/v1', auth);
app.use('/api/v1/store', storeRotues);
app.use("/api/v1", products);
app.use('/api/v1/discount' , discountRoutes);
app.use('/api/v1/review', reviewRoutes);
app.use('/api/v1/order',order);
app.use('/api/v1',user);
app.use('/api/v1', categoryRoutes);
app.use("/api/v1/ads", adRoutes);
app.use("/api/v1/package", packageRoutes); 
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1' , customerContact);
app.use('/api/v1' , Subscription);
app.use(errorMiddleWire);

// Export both app and server
module.exports = { app, server };

