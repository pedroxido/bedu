const express = require('express');
const settingsRouter = express.Router();
const { checkSchema, validationResult } = require('express-validator');
const { getSettings } = require('../controller/settingsController');
const { getAdminSettingsSchema } = require('./validators/settingsSchemas');

const checkInputErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (errors && !errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    return next();
}

//GET /site-settings
settingsRouter.route('/')
    .get(
        checkSchema(getAdminSettingsSchema),
        checkInputErrors,
        getSettings
    );

module.exports = settingsRouter;