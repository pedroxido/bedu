const express = require('express');
const contentRouter = express.Router();
const { checkSchema, validationResult } = require('express-validator');
const { 
    getPageComponents, 
    postPageComponent,
    patchPageComponent
} = require('../controller/pages/contentPagesController');
const {
    postPageComponentItems,
    patchPageComponentItems,
    deletePageComponentItems
} = require('../controller/pages/components/contentPageComponentsController');
const { 
    getPageComponentsSchema,
    postPageComponentSchema,
    patchPageComponentSchema,
    postPageComponentItemsSchema,
    patchPageComponentItemsSchema,
    deletePageComponentItemsSchema
} = require('./validators/contentSchemas');

const checkInputErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (errors && !errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    return next();
}


//content
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

module.exports = contentRouter;