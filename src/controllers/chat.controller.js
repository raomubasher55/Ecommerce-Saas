const chatService = require('../services/chat.service');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors.middleware');

/**
 * @desc    Get all messages between authenticated user/store and another user/store
 * @route   GET /api/v1/chat/messages/:receiverId/:receiverModel
 * @access  Private
 */
exports.getMessages = catchAsyncErrors(async (req, res) => {
  const { receiverId, receiverModel } = req.params;
  const { role } = req.user;

  if (role === 'User') {
    const messages = await chatService.getMessages(req.user._id, receiverId, 'User', receiverModel);
    return res.status(200).json({
      success: true,
      messages
    });
  } else if (role === 'Store') {
    const messages = await chatService.getMessages(receiverId, req.store._id, receiverModel, 'Store');
    return res.status(200).json({
      success: true,
      messages
    });
  }
  
  return res.status(400).json({
    success: false,
    message: 'Invalid role'
  });
});

/**
 * @desc    List all chats for authenticated user/store
 * @route   GET /api/v1/chat/list
 * @access  Private
 */
exports.listChats  = catchAsyncErrors(async (req, res) => {
  const chats = await chatService.listChats(req.store._id, 'Store');
  return res.status(200).json(chats);
})

/**
 * @desc    List all chats for authenticated user
 * @route   GET /api/v1/chat/user/list
 * @access  Private
 */
exports.listUserChats = catchAsyncErrors(async (req, res) => {
  const chats = await chatService.listChats(req.user._id, 'User');
  return res.status(200).json(chats);
})

/**
 * @desc    Send a message
 * @route   POST /api/v1/chat/send
 * @access  Private
 */
exports.sendMessage = catchAsyncErrors(async (req, res) => {
  const { receiverId, receiverModel, content } = req.body;
  const { role } = req.user;
  
  if (role === 'User') {
    const message = await chatService.sendMessage(req.user._id, receiverId, 'User', receiverModel, content);
    
    // Get chat ID for the notification
    const chat = await chatService.findChat(req.user._id, receiverId);
    
    // Emit notification for message
    req.app.get('io').to(receiverId).emit('new_message_notification', {
      id: message._id,
      type: 'message',
      title: 'New Message from User',
      message: content,
      senderId: req.user._id,
      receiverId: receiverId,
      chatId: chat?._id,
      timestamp: new Date().toISOString()
    });
    
    return res.status(200).json(message);
  } else if (role === 'Store') {
    const message = await chatService.sendMessage(req.store._id, receiverId, 'Store', receiverModel, content);
    
    // Get chat ID for the notification
    const chat = await chatService.findChat(receiverId, req.store._id);
    
    // Emit notification for message
    req.app.get('io').to(receiverId).emit('new_message_notification', {
      id: message._id,
      type: 'message',
      title: 'New Message from Store',
      message: content,
      senderId: req.store._id,
      receiverId: receiverId,
      chatId: chat?._id,
      timestamp: new Date().toISOString()
    });
    
    return res.status(200).json(message);
  } else {
    return res.status(400).json({message: 'Invalid role'});
  }
})    

/**
 * @desc    Delete a chat
 * @route   DELETE /api/v1/chat/:chatId
 * @access  Private
 */
exports.deleteChat = catchAsyncErrors(async (req, res) => {
  const { chatId } = req.params;
  const { role } = req.user;
  
  if (role === 'User') {
    await chatService.deleteChat(chatId, 'User');
    return res.status(200).json({message: 'Chat deleted successfully'});
  } else if (role === 'Store') {
    await chatService.deleteChat(chatId, 'Store');
    return res.status(200).json({message: 'Chat deleted successfully'});
  } else {
    return res.status(400).json({message: 'Invalid role'});
  }
})


/**
 * @desc Delete all admin-store chats
 * @route DELETE /api/v1/chat/admin/all-chat-delete
 * @access Private (admin only)
 */
exports.deleteAllAdminStoreChats = catchAsyncErrors(async (req, res) => {
  await chatService.deleteAllAdminStoreChats(req.user._id);
  return res.status(200).json({ success: true , message: 'All admin-store chats deleted successfully.'});
});


/**
 * @desc    Get all chats for authenticated user/store
 * @route   GET /api/v1/chat/chat/:chatId
 * @access  Private
 */

exports.getChats = catchAsyncErrors(async (req, res) => {
  const chats = await chatService.getMessagesforStore(req.store._id , req.params.chatId);
  return res.status(200).json(chats);
})

/**
 * @desc    Find or create a chat
 * @route   POST /api/v1/chat/find-or-create
 * @access  Private
 */
exports.findOrCreateChat = catchAsyncErrors(async (req, res) => {
  const { storeId, senderModel, receiverModel } = req.body;
  const userId = req.user._id;

  // First try to find existing chat
  let chat = await chatService.findChat(userId, storeId);
  console.log(chat);
  // If no chat exists, create a new one without initial message
  if (!chat) {
    chat = await chatService.createChat(userId, storeId);
  }

  return res.status(200).json(chat);
});

/**
 * @desc    List all admin-store chats for authenticated admin
 * @route   GET /api/v1/chat/admin/store-chats
 * @access  Private (Admin only)
 */
exports.listAdminStoreChats = catchAsyncErrors(async (req, res) => {
  // Ensure the user is an admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only admins can access store chats.'
    });
  }

  const adminId = req.user._id;
  const chats = await chatService.listAdminStoreChats(adminId);
  
  return res.status(200).json(chats);
});

/**
 * @desc    Create a new chat between admin and store
 * @route   POST /api/v1/chat/admin-store/create
 * @access  Private (Admin only)
 */
exports.createAdminStoreChat = catchAsyncErrors(async (req, res) => {
  // Ensure the user is an admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only admins can create admin-store chats.'
    });
  }

  const { storeId } = req.body;
  const adminId = req.user._id;

  // First check if a chat already exists
  let chat = await chatService.findAdminStoreChat(adminId, storeId);
  
  // If no chat exists, create a new one
  if (!chat) {
    chat = await chatService.createAdminStoreChat(adminId, storeId);
  }

  return res.status(200).json(chat);
});

/**
 * @desc    Create a new chat between store and admin
 * @route   POST /api/v1/chat/store-admin/create
 * @access  Private (Store only)
 */
exports.createStoreAdminChat = catchAsyncErrors(async (req, res) => {
  const storeId = req.store._id;
  
  // Get the first admin from the system
  const admin = await chatService.getFirstAdmin();
  
  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'No admin found in the system.'
    });
  }

  // First check if a chat already exists
  let chat = await chatService.findAdminStoreChat(admin._id, storeId);
  
  // If no chat exists, create a new one
  if (!chat) {
    chat = await chatService.createAdminStoreChat(admin._id, storeId);
  }

  return res.status(200).json(chat);
});

/**
 * @desc    Get a specific admin-store chat
 * @route   GET /api/v1/chat/admin-store/:chatId
 * @access  Private (Admin and Store)
 */
exports.getAdminStoreChat = catchAsyncErrors(async (req, res) => {
  const { chatId } = req.params;
  
  // Check if it's an admin or store requesting
  let participantId;
  let role;
  
  if (req.user) {
    // Admin token
    participantId = req.user._id;
    role = 'Admin';
  } else if (req.store) {
    // Store token
    participantId = req.store._id;
    role = 'Store';
  } else {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  const chat = await chatService.getAdminStoreChat(chatId, participantId, role);
  
  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found or you do not have permission to access it.'
    });
  }

  return res.status(200).json({ success: true, chat });
});

/**
 * @desc    Mark messages in an admin-store chat as read
 * @route   PUT /api/v1/chat/admin-store/:chatId/read
 * @access  Private (Admin and Store)
 */
exports.markAdminStoreChatAsRead = catchAsyncErrors(async (req, res) => {
  const { chatId } = req.params;
  
  // Check if it's an admin or store requesting
  let participantId;
  let role;
  
  if (req.user) {
    // Admin token
    participantId = req.user._id;
    role = 'Admin';
  } else if (req.store) {
    // Store token
    participantId = req.store._id;
    role = 'Store';
  } else {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  await chatService.markAdminStoreChatAsRead(chatId, participantId, role);
  
  return res.status(200).json({ 
    success: true, 
    message: 'Messages marked as read.'
  });
});

/**
 * @desc    Get first admin user in the system
 * @route   GET /api/v1/chat/admin/first
 * @access  Private (Store only)
 */
exports.getFirstAdminUser = catchAsyncErrors(async (req, res) => {
  const admin = await chatService.getFirstAdmin();
  
  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'No admin found in the system.'
    });
  }

  return res.status(200).json({
    success: true,
    admin: {
      _id: admin._id,
      name: admin.name || 'Platform Admin'
    }
  });
});

/**
 * @desc    Get current admin user
 * @route   GET /api/v1/chat/admin/current
 * @access  Private (Admin only)
 */
exports.getCurrentAdminUser = catchAsyncErrors(async (req, res) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only admins can access this resource.'
    });
  }

  return res.status(200).json({
    success: true,
    admin: {
      _id: req.user._id,
      name: req.user.name || 'Platform Admin'
    }
  });
});
