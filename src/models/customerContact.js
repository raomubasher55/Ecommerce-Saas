const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: "unread" }, 
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model("customerContact", contactSchema);

module.exports = Contact;
