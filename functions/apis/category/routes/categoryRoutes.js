const express = require('express');
const categoryRouter = express.Router();
const { checkSchema, validationResult } = require('express-validator');
const { 
    getCategories, getCategory, createCategory, updateCategory, deleteCategory
} = require('../controller/categoryController');
const {
    getCategorySchema, postCategorySchema, putCategorySchema, deleteCategorySchema
} = require('./validators/categorySchemas')
const checkInputErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (errors && !errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    return next();
}

//GET categories
categoryRouter.route('/')
    .get(getCategories)
    .post(
        checkSchema(postCategorySchema),
        checkInputErrors,
        createCategory
    )
;

categoryRouter.route('/:id')
    .get(        
        checkSchema(getCategorySchema),
        checkInputErrors,
        getCategory
    )
    .put(
        checkSchema(putCategorySchema),
        checkInputErrors,
        updateCategory
    )
    .delete(
        checkSchema(deleteCategorySchema),
        checkInputErrors,
        deleteCategory
    )

module.exports = categoryRouter;