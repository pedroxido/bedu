const express = require('express');
const productsRouter = express.Router();
const { checkSchema, validationResult } = require('express-validator');
const { 
    getProducts
} = require('../controller/productsController');

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
;

/*
contentRouter.route('/pages/:pageId')
    .get(
        checkSchema(getPageComponentsSchema),
        checkInputErrors,
        getPageComponents)
    .post(
        checkSchema(postPageComponentSchema),
        checkInputErrors,
        postPageComponent
    )
    .patch(
        checkSchema(patchPageComponentSchema),
        checkInputErrors,
        patchPageComponent
    )
;

contentRouter.route('/pages/:pageId/components/:componentId')
    .post(
        checkSchema(postPageComponentItemsSchema),
        checkInputErrors,
        postPageComponentItems
    )
    .patch(
        checkSchema(patchPageComponentItemsSchema),
        checkInputErrors,
        patchPageComponentItems
    )
;
*/

module.exports = productsRouter;