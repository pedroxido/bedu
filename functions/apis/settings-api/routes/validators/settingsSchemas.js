const getAdminSettingsSchema = {
    permission: {
        errorMessage: 'Permission should be sent in query as a non empty string',
        in: ['query'],
        notEmpty: true,
        isString: true,
        matches: {
            options: [/^(admin.view)$/]
        }
    },
};
  
module.exports = {
    getAdminSettingsSchema,
}