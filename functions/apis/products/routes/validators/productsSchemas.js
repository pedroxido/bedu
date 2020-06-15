const getProductSchema = {
    id: {
        errorMessage: 'id needs to be sent as a param',
        in: ['params'],
        notEmpty: true,
        isString: true,
    }
}

const postProductSchema = {
    name: {
        errorMessage: 'name needs to be sent in the body',
        in: ['body'],
        notEmpty: true,
        isString: true,
    },
    unit: {
        errorMessage: 'unit needs to be sent in the body',
        in: ['body'],
        notEmpty: true,
        isString: true,
    },
    unit_price: {
        errorMessage: 'unit_price needs to be sent in the body',
        in: ['body'],
        notEmpty: true,
        isInt: true,
    },
    unit_qty: {
        errorMessage: 'unit_qty needs to be sent in the body',
        in: ['body'],
        notEmpty: true,
        isFloat: true,
    },
    category_id: {
        errorMessage: 'category_id is not valid',
        notEmpty: true,
        isString: true,
    }
}

const putProductSchema = {
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
    },
    unit: {
        errorMessage: 'unit needs to be sent in the body',
        in: ['body'],
        notEmpty: true,
        isString: true,
    },
    unit_price: {
        errorMessage: 'unit_price needs to be sent in the body',
        in: ['body'],
        notEmpty: true,
        isInt: true,
    },
    unit_qty: {
        errorMessage: 'unit_qty needs to be sent in the body',
        in: ['body'],
        notEmpty: true,
        isFloat: true,
    },
    category_id: {
        optional: { options: { nullable: true } },
        errorMessage: 'category_id is not valid',
        notEmpty: true,
        isString: true,
    }
}

const deleteProductSchema = {
    id: {
        errorMessage: 'id needs to be sent as a param',
        in: ['params'],
        notEmpty: true,
        isString: true,
    }
}

module.exports = {
    getProductSchema,
    postProductSchema,
    putProductSchema,
    deleteProductSchema
}