const express = require('express');
const productsRouter = express.Router();
const { checkSchema, validationResult } = require('express-validator');
const { 
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controller/productsController');
const {
    getProductSchema,
    postProductSchema,
    putProductSchema,
    deleteProductSchema
} = require('./validators/productsSchemas')
const checkInputErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (errors && !errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    return next();
}

//GET products
productsRouter.route('/')
    .get(getProducts)
    .post(
        checkSchema(postProductSchema),
        checkInputErrors,
        createProduct
    )
;

productsRouter.route('/:id')
    .get(
        checkSchema(getProductSchema),
        checkInputErrors,
        getProduct
    )
    .put(
        checkSchema(putProductSchema),
        checkInputErrors,
        updateProduct
    )
    .delete(
        checkSchema(deleteProductSchema),
        checkInputErrors,
        deleteProduct
    )
;

module.exports = productsRouter;