const {
    get_user_id_by_email,
    get_current_user_permission
} = require('../../../utils/acl');
const {
    getAllComponentsByPageUuidSQL,
    getSimpleComponents,
    getCustomQueryForSimpleComponent,
    createComponentObjectSQL,
    createSimpleSubcomponentsSQL,
    updateSimpleSubcomponentsSQL,
    updateComponentSQL,
    getCompoundComponents,
    getCompoundComponentMapping
} = require('./queryProvider');
const { runQuery, replaceUndefined } = require('../../../utils/db');

const isEmpty = (obj) => {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

exports.getPageComponents = async (req, res) => {
    console.log(`Event received to get settings`);

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

    console.log(`Filter for resource id: ${JSON.stringify(matchedPermissions)}`);

    matchedPermissions = matchedPermissions.filter(item => item.name === permission);

    console.log(`Filter for resource id: ${JSON.stringify(matchedPermissions)}`);

    if (matchedPermissions.length == 0) {
        return res.status(403)
            .send({ message: 'User has not access to perform this action' });
    }

    //user has permission, proceed

    //get all the componentes by page uuid

    const queryResult = await runQuery(getAllComponentsByPageUuidSQL(req.params.pageId));

    console.log(`Query response ${JSON.stringify(queryResult, replaceUndefined)}`);

    if (queryResult.status == 'error') {
        console.log('Error running query');
        return res.status(500)
            .send(queryResult.msg)
    }

    if (queryResult.msg.rowCount == 0) {
        return res.status(200)
            .send([]);
    }

    //not empty, iterate array of results
    const components = queryResult.msg.rows;

    let componentsResponse = [];

    const compoundComponents = getCompoundComponents();

    for (let index = 0; index < components.length; index++) {
        const element = components[index];

        const table = element.table_name;
        let isCompoundComponent = compoundComponents.indexOf(table) > -1;

        //get component detail
        const componentQuery = await runQuery(getCustomQueryForSimpleComponent(table, element.id));

        if (componentQuery.status == 'error' || componentQuery.msg.rowCount != 1) {
            return res.status(500)
                .send(componentQuery.msg)
        }

        let data = componentQuery.msg.rows[0];

        if (isCompoundComponent) {
            // if it is compound get items per each subcomponent
            const subcomponentOptions = getCompoundComponentMapping(table);

            console.log(`Compound component ${table} options: ${JSON.stringify(subcomponentOptions, replaceUndefined)}`);

            if (isEmpty(subcomponentOptions)) {
                return res.status(500)
                    .send({message: `No subcomponent options found for ${table}`})
            }

            const itemResult = await runQuery(getCustomQueryForSimpleComponent(subcomponentOptions.table, data.id, subcomponentOptions.column));

            console.log(`Query result: ${JSON.stringify(itemResult, replaceUndefined)}`);

            if (itemResult.status == 'error') {
                return res.status(500)
                    .send(itemResult.msg)
            }

            data.items = itemResult.msg.rows;

            //TODO: GET ALL ATTACHMENTS IF IT HAS
        }

        //results ready
        componentsResponse.push(
            {
                id: element.id,
                component_order: element.component_order,
                ref_id: element.ref_id,
                type: element.table_name,
                columns: element.columns,
                data: data
            }
        );


    }

    const responseString = JSON.stringify(componentsResponse, replaceUndefined);

    console.log(`Parsed response: ${responseString}`);

    const responseObject = JSON.parse(responseString)

    console.log(`Objet response : ${responseObject}`)

    return res.status(200)
        .send(responseObject);
}

exports.postPageComponent = async (req, res) => {
    console.log(`Event received to get settings`);

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

    //get all the componentes by page uuid

    const queryResult = await runQuery(createComponentObjectSQL(req.params.pageId, req.body.type, req.body.component_order, req.user.email));

    console.log(`Query result: ${JSON.stringify(queryResult)}`);
    if (queryResult.status == 'error' || queryResult.msg.rowCount != 1) {
        return res.status(500)
            .send(queryResult.msg)
    }

    //not empty, iterate array of results
    const componentObject = queryResult.msg.rows[0];

    //create subcomponent
    const simpleComponents = getSimpleComponents();
    let isSimpleComponent = simpleComponents.indexOf(req.body.type) > -1;

    console.log(`isSimpleComponent ${isSimpleComponent}`);

    const subcomponentObject = await runQuery(createSimpleSubcomponentsSQL(req.body.data, req.body.type, componentObject.id, req.user.email));

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
        .send(componentObject);

}

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

    if (!req.body.component_order && !req.body.data && !req.body.columns) {
        console.log('No data or component_order or columns was sent in the payload. Nothing to update');
        return res.status(500)
            .send({ message: 'nothing to update' });
    }

    //check for component_order update
    if (req.body.component_order || req.body.columns) {
        console.log('Updating table');
        let data = {};
        if(req.body.component_order){
            data.component_order = req.body.component_order;
        }

        if(req.body.columns){
            data.columns = req.body.columnsl
        }

        console.log(`Data to update: ${JSON.stringify(data)}`);

        let result = await runQuery(updateSimpleSubcomponentsSQL(data, 'component', req.body.component_id, req.user.email));

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