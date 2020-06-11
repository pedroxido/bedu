const {runQuery} = require('./db');

const get_user_id_by_email = async (email) => {
    console.log(`Email ${email}`)
    const query = `
        select u.id
        from users.users as u
        where u.email = '${email}'
    `;
    const result = await runQuery(query);
    return result;

};

const get_current_user_permission = async (user_id) => {
    console.log(`User_id -> ${user_id}`);
    const query = `
        select pt.name, p.resource_id
        from roles.permission_type as pt
        inner join roles.permission as p on p.permission_type_id = pt.id
        inner join roles.permission_role as pr on pr.permission_id = p.id
        inner join roles.role as r on r.id = pr.role_id
        inner join users.users as u on u.role_id = r.id
        where u.id = '${user_id}'
    `;

    const result = await runQuery(query);
    console.log(`Query: ${query}`);
    return result;
};


module.exports = {
    get_user_id_by_email,
    get_current_user_permission
};