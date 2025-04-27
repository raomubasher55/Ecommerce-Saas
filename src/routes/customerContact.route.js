
const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth.middleware");
const { contact, getContact, contactStatus } = require("../controllers/contact.controller");

const router = express.Router()


router.post('/contact' , contact)
router.get('/contact' , isAuthenticatedUser, authorizeRoles('admin'), getContact)
router.put("/contact/:id/read", isAuthenticatedUser, authorizeRoles('admin'), contactStatus)


module.exports = router; 