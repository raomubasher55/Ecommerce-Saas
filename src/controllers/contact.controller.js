const catchAsyncErrorsMiddleware = require("../middlewares/catchAsyncErrors.middleware");
const Contact = require("../models/customerContact");

// ✅ Send contact message with default "unread" status
exports.contact = catchAsyncErrorsMiddleware(async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  const newContact = new Contact({ name, email, message, status: "unread" }); // ✅ Status added
  await newContact.save({validateBeforeSave: false});

  res.status(201).json({ success: true, message: "Message sent successfully!" });
});

// ✅ Get all contact messages
exports.getContact = catchAsyncErrorsMiddleware(async (req, res) => {
  const messages = await Contact.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: messages.length,
    messages,
  });
});



exports.contactStatus = async (req, res) => {
    try {
      const updatedMessage = await Contact.findByIdAndUpdate(
        req.params.id,
        { status: "read" },
        { new: true }
      );
  
      if (!updatedMessage) {
        return res.status(404).json({ success: false, message: "Message not found" });
      }
  
      res.status(200).json({ success: true, message: "Marked as read", updatedMessage });
    } catch (error) {
      console.error("Error updating message:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  };
  