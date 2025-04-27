const socketIo = require('socket.io');
const chatService = require('../../services/chat.service');

let io;
const userSocketMap = new Map();
const storeSocketMap = new Map();
const adminSocketMap = new Map();

// Debug function to log active connections
const logActiveConnections = () => {
  console.log('Active user connections:', [...userSocketMap.keys()]);
  console.log('Active store connections:', [...storeSocketMap.keys()]);
  console.log('Active admin connections:', [...adminSocketMap.keys()]);
};

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*', 
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    },
    pingTimeout: 60000,
    transports: ['polling', 'websocket']
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('authenticate', (token) => {
      try {
        console.log('Client authenticated:', socket.id);
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('unauthorized');
      }
    });

    /**
     * Event: identify
     * Payload: { id: String, role: 'User' | 'Store' | 'Admin' }
     */
    socket.on('identify', ({ id, role }) => {
      console.log(`Client identifying as ${role} with ID ${id}`);
      
      if (!id) {
        console.error('Missing ID in identify event');
        return;
      }

      if (role === 'User') {
        // Remove any previous socket ID for this user to prevent duplicates
        for (let [existingId, existingSocketId] of userSocketMap.entries()) {
          if (existingId === id && existingSocketId !== socket.id) {
            console.log(`Removing previous socket mapping for user ${id}`);
            userSocketMap.delete(existingId);
          }
        }
        
        userSocketMap.set(id, socket.id);
        console.log(`User connected: ${id} with socket ${socket.id}`);
      } else if (role === 'Store') {
        // Remove any previous socket ID for this store to prevent duplicates
        for (let [existingId, existingSocketId] of storeSocketMap.entries()) {
          if (existingId === id && existingSocketId !== socket.id) {
            console.log(`Removing previous socket mapping for store ${id}`);
            storeSocketMap.delete(existingId);
          }
        }
        
        storeSocketMap.set(id, socket.id);
        console.log(`Store connected: ${id} with socket ${socket.id}`);
      } else if (role === 'Admin') {
        // Remove any previous socket ID for this admin to prevent duplicates
        for (let [existingId, existingSocketId] of adminSocketMap.entries()) {
          if (existingId === id && existingSocketId !== socket.id) {
            console.log(`Removing previous socket mapping for admin ${id}`);
            adminSocketMap.delete(existingId);
          }
        }
        
        adminSocketMap.set(id, socket.id);
        console.log(`Admin connected: ${id} with socket ${socket.id}`);
      }
      
      logActiveConnections();
    });

    /**
     * Event: send_message
     * Payload: { senderId, receiverId, senderModel, receiverModel, content, chatId, storeId, adminId }
     */
    socket.on('send_message', async ({ 
      senderId, 
      receiverId, 
      senderModel, 
      receiverModel, 
      content,
      chatId,
      storeId,
      adminId
    }) => {
      try {
        console.log(`Message from ${senderModel} (${senderId}) to ${receiverModel} (${receiverId}): ${content.substring(0, 30)}...`);
        
        let userId, storeIdToUse, adminIdToUse;
        
        if (senderModel === 'User' && receiverModel === 'Store') {
          userId = senderId;
          storeIdToUse = receiverId || storeId;
        } else if (senderModel === 'Store' && receiverModel === 'User') {
          storeIdToUse = senderId || storeId;
          userId = receiverId;
        } else if (senderModel === 'Admin' && receiverModel === 'Store') {
          adminIdToUse = senderId || adminId;
          storeIdToUse = receiverId || storeId;
          userId = adminIdToUse; // For admin-store chats, userId is the admin ID
        } else if (senderModel === 'Store' && receiverModel === 'Admin') {
          storeIdToUse = senderId || storeId;
          adminIdToUse = receiverId || adminId;
          userId = adminIdToUse; // For store-admin chats, userId is the admin ID
        } else {
          console.error('Invalid roles in send_message');
          return;
        }

        console.log(`Processed IDs - userId: ${userId}, storeId: ${storeIdToUse}, adminId: ${adminIdToUse}`);
        
        // Call the enhanced sendMessage function
        const chat = await chatService.sendMessage(userId, storeIdToUse, senderModel, receiverModel, content);
        
        const newMessage = chat.messages[chat.messages.length - 1];
        const messageToSend = {
          ...newMessage.toObject(),
          chatId: chat._id,
        };
        
        console.log(`Emitting message to ${receiverModel}:`, messageToSend);
        
        // Determine the socket ID of the recipient
        let recipientSocketId;
        let actualReceiverId;
        
        if (receiverModel === 'User') {
          actualReceiverId = receiverId;
          recipientSocketId = userSocketMap.get(receiverId);
        } else if (receiverModel === 'Store') {
          actualReceiverId = receiverId || storeIdToUse;
          recipientSocketId = storeSocketMap.get(actualReceiverId);
          console.log(`Looking for store socket with ID: ${actualReceiverId}`);
          console.log(`Active store connections:`, [...storeSocketMap.entries()]);
        } else if (receiverModel === 'Admin') {
          actualReceiverId = receiverId || adminIdToUse;
          recipientSocketId = adminSocketMap.get(actualReceiverId);
          console.log(`Looking for admin socket with ID: ${actualReceiverId}`);
          console.log(`Active admin connections:`, [...adminSocketMap.entries()]);
        }
        
        // Send the message to the recipient if they're online
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receive_message', messageToSend);
          console.log(`Message sent to ${receiverModel} socket ${recipientSocketId}`);
        } else {
          console.log(`${receiverModel} is not online, message not delivered directly`);
        }
        
        // Always emit a notification for the message, but only once
        // Create a unique ID that's deterministic based on message content to prevent duplicates
        const contentHash = Buffer.from(content).toString('base64').substring(0, 10);
        const notificationId = `msg_${senderModel}_${senderId}_${chatId || chat._id.toString()}_${contentHash}`;
        
        const notification = {
          id: notificationId,
          type: 'message',
          title: `New Message from ${senderModel}`,
          message: content,
          senderId: senderId,
          senderModel: senderModel,
          receiverId: actualReceiverId,
          receiverModel: receiverModel,
          chatId: chatId || chat._id.toString(),
          timestamp: new Date().toISOString()
        };
        
        console.log(`Automatically emitting notification with chatId:`, notification.chatId);
        
        // Always broadcast notifications to all clients
        // This ensures all connected clients receive the notification
        // Each client will filter notifications based on their own receiverId
        io.emit('new_message_notification', notification);
        console.log(`Notification broadcast to all clients - ID: ${notificationId}, receiverId: ${actualReceiverId}, receiverModel: ${receiverModel}`);
        
        // Don't send back to the sender - they've already added it to their state
        // This prevents duplicate messages appearing in the sender's chat
        // socket.emit('receive_message', messageToSend);
        
      } catch (error) {
        console.error('Error in send_message handler:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Event: new_message_notification
     * Payload: notification object specific to messages
     */
    socket.on('new_message_notification', (notification) => {
      try {
        console.log('New message notification received:', notification);
        const { receiverId, receiverModel } = notification;
        
        if (!receiverId) {
          console.error('Missing receiverId in message notification');
          return;
        }
        
        let recipientSocketId;
        
        if (receiverModel === 'User' || !receiverModel) {
          recipientSocketId = userSocketMap.get(receiverId);
          console.log(`Looking up User socket for ${receiverId}, found: ${recipientSocketId}`);
        } else if (receiverModel === 'Store') {
          recipientSocketId = storeSocketMap.get(receiverId);
          console.log(`Looking up Store socket for ${receiverId}, found: ${recipientSocketId}`);
        } else if (receiverModel === 'Admin') {
          recipientSocketId = adminSocketMap.get(receiverId);
          console.log(`Looking up Admin socket for ${receiverId}, found: ${recipientSocketId}`);
        }
        
        // Ensure the notification has a unique ID
        const notificationWithId = {
          ...notification,
          id: notification.id || `msg_notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        };
        
        if (recipientSocketId) {
          // Send the notification to the appropriate event handler
          io.to(recipientSocketId).emit('new_message_notification', notificationWithId);
          console.log(`Message notification sent to ${receiverModel || 'User'} (${receiverId}), Socket: ${recipientSocketId}`);
        } else {
          console.log(`Recipient ${receiverModel} (${receiverId}) not connected for message notification. Active maps:`, 
            { 
              users: [...userSocketMap.entries()], 
              stores: [...storeSocketMap.entries()], 
              admins: [...adminSocketMap.entries()] 
            }
          );
        }
      } catch (error) {
        console.error('Error handling new_message_notification:', error);
      }
    });

    /**
     * Event: new_notification
     * Payload: notification object
     */
    socket.on('new_notification', (notification) => {
      try {
        console.log('New custom notification received:', notification);
        const { receiverId, receiverModel } = notification;
        
        if (!receiverId) {
          console.error('Missing receiverId in notification');
          return;
        }
        
        let recipientSocketId;
        
        if (receiverModel === 'User' || !receiverModel) {  // Default to User if not specified
          recipientSocketId = userSocketMap.get(receiverId);
        } else if (receiverModel === 'Store') {
          recipientSocketId = storeSocketMap.get(receiverId);
        } else if (receiverModel === 'Admin') {
          recipientSocketId = adminSocketMap.get(receiverId);
        }
        
        // Ensure the notification has a unique ID
        const notificationWithId = {
          ...notification,
          id: notification.id || `notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        };
        
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('new_notification', notificationWithId);
          console.log(`Custom notification sent to ${receiverModel || 'User'} (${receiverId}), Socket: ${recipientSocketId}`);
        } else {
          console.log(`Recipient (${receiverId}) not connected for notification. Will be delivered when they reconnect.`);
        }
      } catch (error) {
        console.error('Error handling new_notification:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      let disconnectedEntity = null;
      
      for (let [key, value] of userSocketMap.entries()) {
        if (value === socket.id) {
          userSocketMap.delete(key);
          disconnectedEntity = { type: 'User', id: key };
          console.log(`User disconnected: ${key}`);
          break;
        }
      }

      for (let [key, value] of storeSocketMap.entries()) {
        if (value === socket.id) {
          storeSocketMap.delete(key);
          disconnectedEntity = { type: 'Store', id: key };
          console.log(`Store disconnected: ${key}`);
          break;
        }
      }
      
      for (let [key, value] of adminSocketMap.entries()) {
        if (value === socket.id) {
          adminSocketMap.delete(key);
          disconnectedEntity = { type: 'Admin', id: key };
          console.log(`Admin disconnected: ${key}`);
          break;
        }
      }
      
      if (disconnectedEntity) {
        console.log(`${disconnectedEntity.type} (${disconnectedEntity.id}) fully disconnected`);
      } else {
        console.log('Unknown client disconnected');
      }
      
      logActiveConnections();
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  io.engine.on('connection_error', (err) => {
    console.error('Connection error:', err);
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initializeSocket, getIO };