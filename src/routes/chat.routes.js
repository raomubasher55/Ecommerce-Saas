const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { isAuthenticatedUser, isAuthenticatedStore, isAuthenticatedStoreOrUser, authorizeRoles } = require('../middlewares/auth.middleware');
const { getMessages } = require('../controllers/chat.controller');

router.get('/list',isAuthenticatedStore, chatController.listChats);
// Add route for user to list their chats
router.get('/user/list', isAuthenticatedUser, chatController.listUserChats);
router.post('/send', chatController.sendMessage);
router.delete('/:chatId', chatController.deleteChat);
//for store
router.get('/store/chat/:chatId',isAuthenticatedStore, chatController.getChats);
//for user
router.post('/find-or-create', isAuthenticatedUser, chatController.findOrCreateChat);

// Admin-Store chat routes
router.get('/admin/store-chats', isAuthenticatedUser, authorizeRoles('admin'), chatController.listAdminStoreChats);
router.post('/admin-store/create', isAuthenticatedUser, authorizeRoles('admin'), chatController.createAdminStoreChat);
router.get('/admin-store/:chatId', isAuthenticatedStoreOrUser, chatController.getAdminStoreChat);
router.put('/admin-store/:chatId/read', isAuthenticatedStoreOrUser, chatController.markAdminStoreChatAsRead);
router.delete('/admin/all-chat-delete', isAuthenticatedUser , authorizeRoles('admin'), chatController.deleteAllAdminStoreChats);

// Store-Admin chat routes
router.post('/store-admin/create', isAuthenticatedStore, chatController.createStoreAdminChat);

// Admin info routes
router.get('/admin/first', isAuthenticatedStore, chatController.getFirstAdminUser);
router.get('/admin/current', isAuthenticatedUser, chatController.getCurrentAdminUser);

// Route to get messages between authenticated user/store and another receiver
// Example: GET /api/v1/chat/messages/:receiverId/:receiverModel
router.get('/messages/:receiverId/:receiverModel', isAuthenticatedUser, getMessages);

module.exports = router; 