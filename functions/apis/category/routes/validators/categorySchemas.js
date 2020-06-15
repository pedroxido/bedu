const getCategorySchema = {
    id: {
        errorMessage: 'id needs to be sent as a param',
        in: ['params'],
        notEmpty: true,
        isString: true,
    }
}

const postCategorySchema = {
    name: {
        errorMessage: 'name needs to be sent in the body',
        in: ['body'],
        notEmpty: true,
        isString: true,
    }
}

const putCategorySchema = {
    id: {
        errorMessage: 'id needs to be sent as a param',
        in: ['params'],
        notEmpty: true,
        isString: true,
    },
    name: {
        errorMessage: 'name needs to be sent in the body',
        in: ['body'],
        notEmpty: true,
        isString: true,
    }
}

const deleteCategorySchema = {
    id: {
        errorMessage: 'id needs to be sent as a param',
        in: ['params'],
        notEmpty: true,
        isString: true,
    }
}

module.exports = {
    getCategorySchema,
    postCategorySchema,
    putCategorySchema,
    deleteCategorySchema
}