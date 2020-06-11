const { 
    get_user_id_by_email,
    get_current_user_permission
} = require('../../utils/acl');
const { runQuery } = require('../../utils/db');

exports.getSettings = async (req, res) => {
    console.log(`Event received to get settings`);

    let currentUserId = await get_user_id_by_email(req.user.email);

    if(currentUserId.status == 'error'){
        return res.status(500)
                  .send(currentUserId.msg)
    }

    if(currentUserId.msg.rowCount == 0){
        return res.status(403)
                  .send({message: 'User has not access to perform this action'});
    }

    if(currentUserId.msg.rowCount > 1){
        return res.status(500)
                  .send({message: 'More than one user was found with that email'});
    }

    currentUserId = currentUserId.msg.rows[0].id;

    const permission = req.query.permission;

    const allowedOperation = await get_current_user_permission(currentUserId);

    if(allowedOperation.status == 'error'){
        return res.status(500)
                  .send(allowedOperation.msg)
    }

    if(allowedOperation.msg.rowCount == 0){
        return res.status(403)
                  .send({message: 'User has not access to perform this action'});
    }

    const userPermissions = allowedOperation.msg.rows;

    const matchedPermissions = userPermissions.filter(item => item.name === permission);

    if(matchedPermissions.length == 0){
        return res.status(403)
                  .send({message: 'User has not access to perform this action'});
    }

    //user has permission
    const getSiteSettingsQuery = `
        select 	site_visibility,
                title,
                fontsize,
                selfurl,
                customcolor,
                darkmode,
                description,
                copyright,
                websiteurl,
                brandmail,
                brandlogourl,
                faviconurl,
                appiconurl,
                brandname,
                brandowner,
                brandmanager,
                selectedfont
        from settings.site_settings
    `;

    const queryResult = await runQuery(getSiteSettingsQuery);

    if(queryResult.status == 'error'){
        return res.status(500)
                  .send(queryResult.msg)
    }

    return res.status(200)
              .send(queryResult.msg.rows[0]);

}
