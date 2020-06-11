const query = require('../../controller/pages/queryProvider');

const uuid4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const typesValidators = {
    texteditor_c: [
        {
            name: 'content',
            type: 'isString'
        }
    ],
    colorpalette_c: [
        {
            name: 'title',
            type: 'isString'
        },
        {
            name: 'title_tg',
            type: 'isBoolean'
        },
        {
            name: 'caption',
            type: 'isString'
        },
        {
            name: 'caption_tg',
            type: 'isBoolean'
        },
        {
            name: 'itsmain',
            type: 'isBoolean'
        },
        {
            name: 'template',
            type: 'isString'
        },
        {
            name: 'arraycolumns',
            type: 'isString'
        }
    ],
    fontfamilygalery_c: [
        {
            name: 'title',
            type: 'isString'
        },
        {
            name: 'title_tg',
            type: 'isBoolean'
        },
        {
            name: 'caption',
            type: 'isString'
        },
        {
            name: 'caption_tg',
            type: 'isBoolean'
        },
        {
            name: 'template',
            type: 'isString'
        },
    ]
}


const itemsValidators = {
    colorpalette_c_item: [
        {
            name: 'hex',
            type: 'isString',
        },
        {
            name: 'rgb',
            type: 'isString',
        },
        {
            name: 'rgb_alpha',
            type: 'isInt',
        },
        {
            name: 'cmyk',
            type: 'isString',
        },
        {
            name: 'hsb',
            type: 'isString',
        },
        {
            name: 'cmyk_ogv',
            type: 'isString',
        },
        {
            name: 'pantone_c',
            type: 'isString',
        },
        {
            name: 'pantone_uc',
            type: 'isString',
        },
        {
            name: 'title',
            type: 'isString',
        }
    ],
    fontfamilygalery_c_item: [
        {
            name: 'variation',
            type: 'isString',
        }
    ]
}

function isString(value) {
    return value && typeof value.valueOf() === 'string';
}

function isBoolean(value) {
    return typeof value === 'boolean';
}

function isUuid(value) {
    return uuid4Regex.test(value);
}

function isInt(value) {
    return Number.isInteger(value);
}

const getPageComponentsSchema = {
    permission: {
        errorMessage: 'Permission should be sent in query as a non empty string',
        in: ['query'],
        notEmpty: true,
        isString: true,
        matches: {
            options: [/^(admin.view)$/]
        }
    },
    pageId: {
        errorMessage: 'pageId needs to be sent as a param',
        in: ['params'],
        notEmpty: true,
        isUUID: true,
    }
};

const postPageComponentSchema = {
    permission: {
        errorMessage: 'Permission should be sent in query as a non empty string',
        in: ['query'],
        notEmpty: true,
        isString: true,
        matches: {
            options: [/^(admin.view)$/]
        }
    },
    pageId: {
        errorMessage: 'pageId needs to be sent as a param',
        in: ['params'],
        notEmpty: true,
        isUUID: true,
    },
    component_order: {
        errorMessage: 'component_order must be a non empty int',
        in: ['body'],
        notEmpty: true,
        isInt: true,
        toInt: true
    },
    type: {
        errorMessage: 'type must be a valid existing db value',
        in: ['body'],
        notEmpty: true,
        isString: true,
        matches: {
            options: [/^(colorpalette_c|colorvariations_c|embeddedvideo_c|fontfamilygalery_c|icongrid_c|imageannotiations_c|imagegrid_c|note_c|panoimage_c|texteditor_c)$/]
        }
    },
    columns: {
        errorMessage: 'columns must be non empty string',
        in: ['body'],
        notEmpty: true,
        isString: true,
    },
    data: {
        errorMessage: 'data object is not valid schema for the type',
        optional: { options: { nullable: true } },
        notEmpty: true,
        custom: {
            options: (value, { req }) => {
                if (value) {
                    return validator(value, req.method, req.body.type);
                }
            }
        }
    }
};


const patchPageComponentSchema = {
    permission: {
        errorMessage: 'Permission should be sent in query as a non empty string',
        in: ['query'],
        notEmpty: true,
        isString: true,
        matches: {
            options: [/^(admin.view)$/]
        }
    },
    pageId: {
        errorMessage: 'pageId needs to be sent as a param',
        in: ['params'],
        notEmpty: true,
        isUUID: true,
    },
    component_order: {
        optional: { options: { nullable: true } },
        errorMessage: 'component_order must be a non empty int',
        in: ['body'],
        notEmpty: true,
        isInt: true,
        toInt: true
    },
    component_id: {
        errorMessage: 'component_id must be a non empty uuid',
        in: ['body'],
        notEmpty: true,
        isUUID: true,
    },
    type: {
        errorMessage: 'type must be a valid existing db value',
        in: ['body'],
        notEmpty: true,
        isString: true,
        matches: {
            options: [/^(colorpalette_c|colorvariations_c|embeddedvideo_c|fontfamilygalery_c|icongrid_c|imageannotiations_c|imagegrid_c|note_c|panoimage_c|texteditor_c)$/]
        }
    },
    columns: {
        optional: { options: { nullable: true } },
        errorMessage: 'columns must be non empty string',
        in: ['body'],
        notEmpty: true,
        isString: true,
    },
    data: {
        optional: { options: { nullable: true } },
        errorMessage: 'data object is not valid a valid schema for the type',
        notEmpty: true,
        custom: {
            options: (value, { req }) => {
                if (value) {
                    return validator(value, req.method, req.body.type);
                }
            }
        }
    }
};


/*
 *
 *  SCHEMA FOR COMPONENT ITEMS 
 *
 */


const postPageComponentItemsSchema = {
    permission: {
        errorMessage: 'Permission should be sent in query as a non empty string',
        in: ['query'],
        notEmpty: true,
        isString: true,
        matches: {
            options: [/^(admin.view)$/]
        }
    },
    pageId: {
        errorMessage: 'pageId needs to be sent as a param',
        in: ['params'],
        notEmpty: true,
        isUUID: true,
    },
    componentId: {
        errorMessage: 'componentID must be a non empty uuid',
        in: ['params'],
        notEmpty: true,
        isUuid: true,
    },
    type: {
        errorMessage: 'type must be a valid existing db value that has items',
        in: ['body'],
        notEmpty: true,
        isString: true,
        matches: {
            options: [/^(colorpalette_c|colorvariations_c|fontfamilygalery_c|icongrid_c|imagegrid_c)$/]
        }
    },
    items: {
        errorMessage: 'data object is not valid schema for the type',
        optional: { options: { nullable: true } },
        notEmpty: true,
        custom: {
            options: (value, { req }) => {
                if (value) {
                    return validator(value, req.method, req.body.type, 'item');
                }
            }
        }
    }
};

const patchPageComponentItemsSchema = {
    permission: {
        errorMessage: 'Permission should be sent in query as a non empty string',
        in: ['query'],
        notEmpty: true,
        isString: true,
        matches: {
            options: [/^(admin.view)$/]
        }
    },
    pageId: {
        errorMessage: 'pageId needs to be sent as a param',
        in: ['params'],
        notEmpty: true,
        isUUID: true,
    },
    componentId: {
        errorMessage: 'componentID must be a non empty uuid',
        in: ['params'],
        notEmpty: true,
        isUuid: true,
    },
    item_id: {
        errorMessage: 'itemID must be a non empty uuid',
        in: ['body'],
        notEmpty: true,
        isUuid: true,
    },
    type: {
        errorMessage: 'type must be a valid existing db value that has items',
        in: ['body'],
        notEmpty: true,
        isString: true,
        matches: {
            options: [/^(colorpalette_c|colorvariations_c|fontfamilygalery_c|icongrid_c|imagegrid_c)$/]
        }
    },
    items: {
        errorMessage: 'data object is not valid schema for the type',
        optional: { options: { nullable: true } },
        notEmpty: true,
        custom: {
            options: (value, { req }) => {
                if (value) {
                    return validator(value, req.method, req.body.type, 'item');
                }
            }
        }
    }
};

const validator = (value, method, type, source='component') => {
    let cloneValue = createCopy(value);

    //validate for subcomponent field
    let fields;
    if(source == 'component'){
        fields = typesValidators[type]; 
    }else{
        const compoundMapping = query.getCompoundComponentMapping(type);
        if(isEmpty(compoundMapping))
            return false;
        fields = itemsValidators[compoundMapping.table];
    }

    if(fields.length == 0)
        return false;

    console.log(`Fields to validate : ${JSON.stringify(fields)}`);

    //run validations
    for (let index = 0; index < fields.length; index++) {
        //check if type exists based on method type
        const element = fields[index];
        console.log(`Current element validation: ${JSON.stringify(element)}`);
        if (!cloneValue.hasOwnProperty(element.name) && method == 'POST')
            return false;

        //check the data type
        if (cloneValue.hasOwnProperty(element.name)) {
            let val = eval(element.type)(cloneValue[element.name]);
            if (val) {
                delete cloneValue[element.name];
            } else {
                return false;
            }
        }
    }

    return isEmpty(cloneValue);

}

const createCopy = (obj) => {
    return { ...obj };
}

const isEmpty = (obj) => {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

module.exports = {
    getPageComponentsSchema,
    postPageComponentSchema,
    patchPageComponentSchema,
    postPageComponentItemsSchema,
    patchPageComponentItemsSchema
}