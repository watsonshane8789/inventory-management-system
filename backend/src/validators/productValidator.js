const { body, param } = require('express-validator');

const createProductRules = [
  body('name').trim().notEmpty().withMessage('Product name is required')
    .isLength({ max: 100 }).withMessage('Name too long'),
  body('sku').trim().notEmpty().withMessage('SKU is required')
    .matches(/^[A-Za-z0-9-]+$/).withMessage('SKU must be alphanumeric with hyphens only'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
];

const updateProductRules = [
  body('name').optional().trim().isLength({ max: 100 }),
  body('quantity').optional().isInt({ min: 0 }),
  body('price').optional().isFloat({ min: 0 }),
];

const idParamRule = [
  param('id').isMongoId().withMessage('Invalid product ID'),
];

module.exports = { createProductRules, updateProductRules, idParamRule };