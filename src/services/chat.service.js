const Chat = require('../models/chat.model');
const User = require('../models/user.model');

/**
 * Send a message from a sender to a receiver.
 * @param {String} userId - ID of the user (if user-store chat).
 * @param {String} storeId - ID of the store.
 * @param {String} senderModel - 'User', 'Store', or 'Admin'.
 * @param {String} receiverModel - 'User', 'Store', or 'Admin'.
 * @param {String} content - The message content.
 * @returns {Object} - The saved chat with new message.
 */
const sendMessage = async (userId, storeId, senderModel, receiverModel, content) => {
  try {
    // Validate input
    if (!content) {
      throw new Error('Missing message content');
    }

    if (!storeId) {
      throw new Error('Missing store ID');
    }

    console.log(`Message parameters: userId=${userId}, storeId=${storeId}, senderModel=${senderModel}, receiverModel=${receiverModel}`);

    let chat;
    let isAdminChat = false;
    let query = { stores: storeId };

    // Determine if this is an admin-store chat
    if ((senderModel === 'Admin' && receiverModel === 'Store') || 
        (senderModel === 'Store' && receiverModel === 'Admin')) {
      isAdminChat = true;
      
      // For admin-store chats, we may need to get the admin ID if not provided
      if (!userId) {
        console.log('No userId provided for admin-store chat, fetching first admin');
        const admin = await getFirstAdmin();
        if (!admin) {
          throw new Error('No admin found in the system');
        }
        userId = admin._id;
        console.log(`Using admin ID: ${userId}`);
      }
      
      query.users = userId;
      query.isAdminChat = true;
    } else {
      // For user-store chats
      if (!userId) {
        throw new Error('Missing user ID for user-store chat');
      }
      query.users = userId;
    }

    console.log("Query for finding chat:", query);
    
    // Find the chat
    chat = await Chat.findOne(query);

    if (!chat) {
      console.log("Chat not found, creating new one");
      // Create new chat if not found
      chat = new Chat({
        users: [userId],
        stores: [storeId],
        messages: [],
        isAdminChat: isAdminChat
      });
    }

    let senderId, receiverId;
    
    // Set sender and receiver based on models
    if (senderModel === 'User' || senderModel === 'Admin') {
      senderId = userId;
      receiverId = storeId;
    } else if (senderModel === 'Store') {
      senderId = storeId;
      receiverId = userId;
    }

    // Add new message
    chat.messages.push({
      sender: senderId,
      receiver: receiverId,
      senderModel,
      receiverModel,
      content,
      timestamp: new Date()
    });

    await chat.save({validateBeforeSave: false});
    return chat;
  } catch (error) {
    console.error('Error in sendMessage service:', error);
    throw error;
  }
};

/**
 * Retrieve all messages between a user and a store.
 * @param {String} userId - ID of the user.
 * @param {String} storeId - ID of the store.
 * @returns {Array} - Array of message objects.
 */
const getMessagesforStore = async (storeId , chatId) => {
  const chat = await Chat.findOne({
    stores: storeId,
    _id: chatId
  });

  return chat ? chat.messages : [];
};

/**
 * List all chats for a user or store.
 * @param {String} userId - ID of the user or store.
 * @param {String} model - 'User' or 'Store'.
 * @returns {Array} - Array of chat objects.
 */
const listChats = async (userId, model) => {
  try {
    const query = model === 'User' ? { users: userId } : { stores: userId };
    const chats = await Chat.find(query)
      .populate('users', 'name email')
      .populate('stores', 'name email')
      .sort({ updatedAt: -1 });

    return chats.map(chat => ({
      _id: chat._id,
      participants: [
        ...chat.users.map(user => ({
          id: user,
          type: 'User',
          name: user.name
        })),
        ...chat.stores.map(store => ({
          id: store,
          type: 'Store',
          name: store.name
        }))
      ],
      messages: chat.messages,
      status: chat.messages.length > 0 ? 'Answered' : 'Pending',
      lastMessage: chat.updatedAt,
    }));
  } catch (error) {
    console.error('Error in listChats service:', error);
    throw error;
  }
};

/**
 * Delete a chat.
 * @param {String} chatId - ID of the chat.
 * @returns {Object} - The deleted chat object.
 */
const deleteChat = async (chatId) => {
  try {
    const chat = await Chat.findByIdAndDelete(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    return chat;
  } catch (error) {
    console.error('Error in deleteChat service:', error);
    throw error;
  }
};

const deleteAllAdminStoreChats = async(adminId)=>{
  try {
    const chats = await Chat.deleteMany({
      users: adminId,
      isAdminChat: true
    });
    return chats;
  } catch (error) {
    console.error('Error in deleteAllAdminStoreChats service:', error);
    throw error;
  }
}


/**
 * Get a specific chat between a user and a store.
 * @param {String} chatId - ID of the chat.
 * @param {String} userId - ID of the user.
 * @param {String} userType - Type of the user ('User' or 'Store').
 * @returns {Object} - The chat object.
 */
const getChat = async (chatId, userId, userType) => {
  try {
    let query = { _id: chatId };
    
    // Add additional validation based on userType
    if (userType === 'User') {
      query.users = userId;
    } else if (userType === 'Store') {
      query.stores = userId;
    }

    const chat = await Chat.findOne(query)
      .populate('users', 'name email')
      .populate('stores', 'name email')
      .populate('messages.sender messages.receiver');
    
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    return chat;
  } catch (error) {
    console.error('Error in getChat service:', error);
    throw error;
  }
};

/**
 * Find an existing chat between a user and store
 */
const findChat = async (userId, storeId) => {
  try {
    console.log(userId, storeId);
    return await Chat.findOne({
      users: userId,
      stores: storeId
    });
  } catch (error) {
    console.error('Error in findChat service:', error);
    throw error;
  }
};

/**
 * Create a new chat between a user and store
 */
const createChat = async (userId, storeId) => {
  try {
    const newChat = new Chat({
      users: [userId],
      stores: [storeId],
      messages: [] // Initialize with empty messages array
    });
    await newChat.save({validateBeforeSave: false});
    return newChat;
  } catch (error) {
    console.error('Error in createChat service:', error);
    throw error;
  }
};

/**
 * Find an admin-store chat
 * @param {String} adminId - ID of the admin user
 * @param {String} storeId - ID of the store
 * @returns {Object} - The found chat or null
 */
const findAdminStoreChat = async (adminId, storeId) => {
  try {
    const chat = await Chat.findOne({
      users: adminId,
      stores: storeId,
      isAdminChat: true
    });
    return chat;
  } catch (error) {
    console.error('Error in findAdminStoreChat service:', error);
    throw error;
  }
};

/**
 * Create a new admin-store chat
 * @param {String} adminId - ID of the admin user
 * @param {String} storeId - ID of the store
 * @returns {Object} - The created chat
 */
const createAdminStoreChat = async (adminId, storeId) => {
  try {
    // Get store details for the chat
    const store = await require('../models/store.model').findById(storeId).select('name');
    
    const newChat = new Chat({
      users: [adminId],
      stores: [storeId],
      messages: [],
      isAdminChat: true,
      storeName: store?.name || 'Store'
    });
    
    await newChat.save({validateBeforeSave: false});
    return newChat;
  } catch (error) {
    console.error('Error in createAdminStoreChat service:', error);
    throw error;
  }
};

/**
 * List all admin-store chats for an admin
 * @param {String} adminId - ID of the admin user
 * @returns {Array} - List of admin-store chats
 */
const listAdminStoreChats = async (adminId) => {
  try {
    const chats = await Chat.find({
      users: adminId,
      isAdminChat: true
    })
    .populate('stores', 'name email')
    .sort({ updatedAt: -1 });
    
    return chats.map(chat => {
      const store = chat.stores[0];
      
      return {
        _id: chat._id,
        storeName: store?.name || chat.storeName || 'Store',
        storeEmail: store?.email,
        messages: chat.messages,
        lastMessage: chat.updatedAt,
        status: chat.status || (chat.messages.length > 0 ? 'Answered' : 'Pending')
      };
    });
  } catch (error) {
    console.error('Error in listAdminStoreChats service:', error);
    throw error;
  }
};

/**
 * Get a specific admin-store chat
 * @param {String} chatId - ID of the chat
 * @param {String} participantId - ID of the participant (admin or store)
 * @param {String} role - Role of the participant ('Admin' or 'Store')
 * @returns {Object} - The chat object
 */
const getAdminStoreChat = async (chatId, participantId, role) => {
  try {
    let query = { 
      _id: chatId,
      isAdminChat: true
    };
    
    // Add role-specific condition to the query
    if (role === 'Admin') {
      query.users = participantId;
    } else if (role === 'Store') {
      query.stores = participantId;
    }
    
    const chat = await Chat.findOne(query)
      .populate('users', 'name email')
      .populate('stores', 'name email');
    
    if (!chat) {
      return null;
    }
    
    return chat;
  } catch (error) {
    console.error('Error in getAdminStoreChat service:', error);
    throw error;
  }
};

/**
 * Mark messages in an admin-store chat as read
 * @param {String} chatId - ID of the chat
 * @param {String} participantId - ID of the participant marking messages as read
 * @param {String} role - Role of the participant ('Admin' or 'Store')
 */
const markAdminStoreChatAsRead = async (chatId, participantId, role) => {
  try {
    const chat = await getAdminStoreChat(chatId, participantId, role);
    
    if (!chat) {
      throw new Error('Chat not found or you do not have permission to access it');
    }
    
    // Update the status if needed
    if (chat.status === 'Pending') {
      chat.status = 'Answered';
      await chat.save({validateBeforeSave: false});
    }
    
    return true;
  } catch (error) {
    console.error('Error in markAdminStoreChatAsRead service:', error);
    throw error;
  }
};

/**
 * Get the first admin user from the system
 * @returns {Object} - Admin user object
 */
const getFirstAdmin = async () => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    return admin;
  } catch (error) {
    console.error('Error in getFirstAdmin service:', error);
    throw error;
  }
};

module.exports = {
  sendMessage,
  getMessagesforStore,
  listChats,
  deleteChat,
  getChat,
  findChat,
  createChat,
  findAdminStoreChat,
  createAdminStoreChat,
  listAdminStoreChats,
  getAdminStoreChat,
  markAdminStoreChatAsRead,
  getFirstAdmin,
  deleteAllAdminStoreChats,
};
