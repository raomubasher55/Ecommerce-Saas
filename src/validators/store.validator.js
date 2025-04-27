const { check, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to validate store registration data
 */
exports.validateStore = [
    check('name', 'Please enter store name')
    .not()
    .isEmpty()
    .withMessage('Store name is required')
    .isLength({ max: 50 })
    .withMessage('Store name cannot exceed 50 characters'),

  check('description', 'Please enter store description')
    .not()
    .isEmpty()
    .withMessage('Store description is required')
    .isLength({ max: 500 })
    .withMessage('Store description cannot exceed 500 characters'),

  check('address', 'Please enter store address')
    .not()
    .isEmpty()
    .withMessage('Store address is required'),

  check('location', 'Please enter store location')
    .not()
    .isEmpty()
    .withMessage('Store location is required'),

  check('phone', 'Please enter store phone')
    .not()
    .isEmpty()
    .withMessage('Store phone number is required')
    .isNumeric()
    .withMessage('Phone number must be a valid number'),

  check('email', 'Please enter a valid store email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .not()
    .isEmpty()
    .withMessage('Store email is required'),


  check('categories', 'Please provide valid store categories')
    .isArray()
    .withMessage('Categories must be an array of valid category IDs')
    .optional(),

  check('products', 'Please provide valid store products')
    .isArray()
    .withMessage('Products must be an array of valid product IDs')
    .optional(),



  check('createdAt', 'Invalid createdAt date format')
    .optional()
    .isDate()
    .withMessage('createdAt should be a valid date'),

  check('emailVerified', 'emailVerified should be a boolean value')
    .optional()
    .isBoolean()
    .withMessage('emailVerified must be a boolean'),

  check('verificationToken', 'Verification token should be a string')
    .optional()
    .isString()
    .withMessage('verificationToken should be a string'),


    /**
     * Validation result all array
     */
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
    
   
];
