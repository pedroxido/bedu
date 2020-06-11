const {
    get_user_id_by_email,
    get_current_user_permission
} = require('../../../../utils/acl');
const {
    getCustomQueryForSimpleComponent,
    createSimpleSubcomponentsSQL,
    getCompoundComponentMapping,
    updateSimpleSubcomponentsSQL
} = require('../queryProvider');
const { runQuery } = require('../../../../utils/db');

const isEmpty = (obj) => {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

exports.postPageComponentItems = async (req, res) => {
    console.log(`Event received to POST items for a component`);

    let currentUserId = await get_user_id_by_email(req.user.email);

    if (currentUserId.status == 'error') {
        return res.status(500)
            .send(currentUserId.msg)
    }

    if (currentUserId.msg.rowCount == 0) {
        return res.status(403)
            .send({ message: 'User has not access to perform this action' });
    }

    if (currentUserId.msg.rowCount > 1) {
        return res.status(500)
            .send({ message: 'More than one user was found with that email' });
    }

    currentUserId = currentUserId.msg.rows[0].id;

    const permission = req.query.permission;

    const allowedOperation = await get_current_user_permission(currentUserId);

    console.log(`ACL query return ${JSON.stringify(allowedOperation)}`);

    if (allowedOperation.status == 'error') {
        return res.status(500)
            .send(allowedOperation.msg)
    }

    if (allowedOperation.msg.rowCount == 0) {
        return res.status(403)
            .send({ message: 'User has not access to perform this action' });
    }

    //check if the page_id exists in the permission array

    const userPermissions = allowedOperation.msg.rows;

    let matchedPermissions = userPermissions.filter(item => item.resource_id === req.params.pageId);

    console.log(`Filter for resource id: ${matchedPermissions}`);

    matchedPermissions = matchedPermissions.filter(item => item.name === permission);

    if (matchedPermissions.length == 0) {
        return res.status(403)
            .send({ message: 'User has not access to perform this action' });
    }

    //user has permission, proceed

    //get component by component ID

    const componentQueryResult = await runQuery(getCustomQueryForSimpleComponent(req.body.type, req.params.componentId));

    console.log(`Query result: ${JSON.stringify(componentQueryResult)}`);

    if (componentQueryResult.status == 'error' || componentQueryResult.msg.rowCount != 1) {
        return res.status(404)
            .send(componentQueryResult.msg)
    }

    console.log(`Component found`);

    const componentItemSchema = getCompoundComponentMapping(req.body.type)

    if (isEmpty(componentItemSchema)) {
        return res.status(404)
            .send({ message: `${req.body.type} mapping not found` });
    }

    console.log(`Mapping ${JSON.stringify(componentItemSchema)}`);

    const subcomponentObject = await runQuery(createSimpleSubcomponentsSQL(req.body.items, componentItemSchema.table, componentQueryResult.msg.rows[0].id, req.user.email, componentItemSchema.column));

    if (subcomponentObject.status == 'error') {
        console.log(`Query not executed`);
        return res.status(500)
            .send(subcomponentObject.msg)
    }

    if (subcomponentObject.msg.rowCount != 1) {
        console.log(`Query excecuted but with not 1 result`);
        return res.status(500)
            .send(subcomponentObject.msg)
    }

    return res.status(201)
        .send(subcomponentObject.msg.rows[0]);

}

exports.patchPageComponentItems = async (req, res) => {
    console.log(`Event received to PATCH items for a component`);

    let currentUserId = await get_user_id_by_email(req.user.email);

    if (currentUserId.status == 'error') {
        return res.status(500)
            .send(currentUserId.msg)
    }

    if (currentUserId.msg.rowCount == 0) {
        return res.status(403)
            .send({ message: 'User has not access to perform this action' });
    }

    if (currentUserId.msg.rowCount > 1) {
        return res.status(500)
            .send({ message: 'More than one user was found with that email' });
    }

    currentUserId = currentUserId.msg.rows[0].id;

    const permission = req.query.permission;

    const allowedOperation = await get_current_user_permission(currentUserId);

    console.log(`ACL query return ${JSON.stringify(allowedOperation)}`);

    if (allowedOperation.status == 'error') {
        return res.status(500)
            .send(allowedOperation.msg)
    }

    if (allowedOperation.msg.rowCount == 0) {
        return res.status(403)
            .send({ message: 'User has not access to perform this action' });
    }

    //check if the page_id exists in the permission array

    const userPermissions = allowedOperation.msg.rows;

    let matchedPermissions = userPermissions.filter(item => item.resource_id === req.params.pageId);

    console.log(`Filter for resource id: ${matchedPermissions}`);

    matchedPermissions = matchedPermissions.filter(item => item.name === permission);

    if (matchedPermissions.length == 0) {
        return res.status(403)
            .send({ message: 'User has not access to perform this action' });
    }

    //user has permission, proceed

    //get component by component ID

    const componentQueryResult = await runQuery(getCustomQueryForSimpleComponent(req.body.type, req.params.componentId));

    console.log(`Query result: ${JSON.stringify(componentQueryResult)}`);

    if (componentQueryResult.status == 'error' || componentQueryResult.msg.rowCount != 1) {
        return res.status(404)
            .send(componentQueryResult.msg)
    }

    console.log(`Component found`);

    const componentItemSchema = getCompoundComponentMapping(req.body.type)

    if (isEmpty(componentItemSchema)) {
        return res.status(404)
            .send({ message: `${req.body.type} mapping not found` });
    }

    console.log(`Mapping ${JSON.stringify(componentItemSchema)}`);

    //get item to update
    const componentItemResult = await runQuery(getCustomQueryForSimpleComponent(componentItemSchema.table, req.body.item_id, 'id'));

    if (componentItemResult.status == 'error') {
        console.log(`Query not executed`);
        return res.status(500)
            .send(componentItemResult.msg)
    }

    if (componentItemResult.msg.rowCount != 1) {
        console.log(`Query excecuted but with not 1 result`);
        return res.status(500)
            .send(componentItemResult.msg)
    }

    console.log(`Item component found: ${JSON.stringify(componentItemResult)}`);

    //Update it

    const subcomponentObject = await runQuery(updateSimpleSubcomponentsSQL(req.body.items, componentItemSchema.table, componentItemResult.msg.rows[0].id, req.user.email));

    if (subcomponentObject.status == 'error') {
        console.log(`Query not executed`);
        return res.status(500)
            .send(subcomponentObject.msg)
    }

    if (subcomponentObject.msg.rowCount != 1) {
        console.log(`Query excecuted but with not 1 result`);
        return res.status(500)
            .send(subcomponentObject.msg)
    }

    return res.status(201)
        .send(subcomponentObject.msg.rows[0]);

}

/*
exports.patchPageComponent = async (req, res) => {
    console.log(`Event received to PATCH page component`);

    let currentUserId = await get_user_id_by_email(req.user.email);

    if (currentUserId.status == 'error') {
        return res.status(500)
            .send(currentUserId.msg)
    }

    if (currentUserId.msg.rowCount == 0) {
        return res.status(403)
            .send({ message: 'User has not access to perform this action' });
    }

    if (currentUserId.msg.rowCount > 1) {
        return res.status(500)
            .send({ message: 'More than one user was found with that email' });
    }

    currentUserId = currentUserId.msg.rows[0].id;

    const permission = req.query.permission;

    const allowedOperation = await get_current_user_permission(currentUserId);

    console.log(`ACL query return ${JSON.stringify(allowedOperation)}`);

    if (allowedOperation.status == 'error') {
        return res.status(500)
            .send(allowedOperation.msg)
    }

    if (allowedOperation.msg.rowCount == 0) {
        return res.status(403)
            .send({ message: 'User has not access to perform this action' });
    }

    //check if the page_id exists in the permission array

    const userPermissions = allowedOperation.msg.rows;

    let matchedPermissions = userPermissions.filter(item => item.resource_id === req.params.pageId);

    console.log(`Filter for resource id: ${matchedPermissions}`);

    matchedPermissions = matchedPermissions.filter(item => item.name === permission);

    if (matchedPermissions.length == 0) {
        return res.status(403)
            .send({ message: 'User has not access to perform this action' });
    }

    //user has permission, proceed

    //verify that the component_id exists and belongs to only one sub component
    const componentQueryResult = await runQuery(getCustomQueryForSimpleComponent(req.body.type, req.body.component_id));

    console.log(`Query result: ${JSON.stringify(componentQueryResult)}`);
    if (componentQueryResult.status == 'error' || componentQueryResult.msg.rowCount != 1) {
        return res.status(500)
            .send(componentQueryResult.msg);
    }

    const component = componentQueryResult.msg.rows[0];

    if (!req.body.component_order && !req.body.data) {
        console.log('No data or component_order was sent in the payload. Nothing to update');
        return res.status(500)
            .send({ message: 'nothing to update' });
    }

    //check for component_order update
    if (req.body.component_order) {
        console.log('Updating component_order');
        let result = await runQuery(updateComponentSQL(req.body.component_order, req.body.component_id, req.user.email));

        console.log(`Query result: ${JSON.stringify(result)}`);

        if (result.status == 'error') {
            console.log(`Query not executed`);
            return res.status(500)
                .send(result.msg)
        }

        if (result.msg.rowCount != 1) {
            console.log(`Query excecuted but with not 1 result`);
            return res.status(500)
                .send(result.msg)
        }

        console.log(`Component order updated successfully`);
    }

    //update sub component
    const simpleComponents = getSimpleComponents();
    let isSimpleComponent = simpleComponents.indexOf(req.body.type) > -1;

    console.log(`isSimpleComponent ${isSimpleComponent}`);

    if (req.body.data) {
        const subcomponentObject = await runQuery(updateSimpleSubcomponentsSQL(req.body.data, req.body.type, component.id, req.user.email));

        if (subcomponentObject.status == 'error') {
            console.log(`Query not executed`);
            return res.status(500)
                .send(subcomponentObject.msg)
        }

        if (subcomponentObject.msg.rowCount != 1) {
            console.log(`Query excecuted but with not 1 result`);
            return res.status(500)
                .send(subcomponentObject.msg)
        }

        console.log(`Simple component data updated successfully`);
    }

    if (req.body.data || req.body.component_order) {
        return res.status(200)
            .send(req.body);
    }

    return res.status(500)
        .send({ message: 'Internal server Error' });
}
*/