const express = require('express');
const router = express.Router();

const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('./controllers/productController');
const validate = require('./middleware/validate');
const {
    createProductRules,
    updateProductRules,
    idParamRule
} = require('./validators/productValidator');

router.route('/')
    .get(getProducts)
    .post(createProductRules, validate, createProduct);

router.route('/:id')
    .get(idParamRule, validate, getProduct)
    .put(idParamRule, updateProductRules, validate, updateProduct)
    .delete(idParamRule, validate, deleteProduct);

module.exports = router;