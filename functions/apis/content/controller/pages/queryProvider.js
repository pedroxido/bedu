const getCompoundComponentMapping = {
    colorpalette_c: {
        table: 'colorpalette_c_item',
        column: 'colorpalette_c_id',
        hasAttachments: false
    },
    fontfamilygallery_c: {
        table: 'fontfamilygallery_c_item',
        column: 'fontfamilygallery_id',
        hasAttachments: false
    }
};

exports.getAllComponentsByPageUuidSQL = (page_id) => {
    const query = `
        select id, component_order, ref_id, table_name, columns
        from content.component
        where page_id = '${page_id}' and deleted = false
        order by component_order
    `;

    console.log(`Query ${query}`);
    return query;    
}

exports.getSimpleComponents = () => {
    return [
        'texteditor_c',
    ];
}

exports.getCompoundComponents = () => {
    return [
        'colorpalette_c',
    ];
}

exports.getCompoundComponentMapping = (table) => {
    return getCompoundComponentMapping[table] ? getCompoundComponentMapping[table] : {};
}

exports.getCustomQueryForSimpleComponent = (table, value, column = 'component_id') => {
    const query = `
        select *
        from content.${table}
        where ${column} = '${value}' and deleted = false
    `;
    console.log(`Query ${query}`);
    return query;
}

exports.createComponentObjectSQL = (page_id, table, component_order, user) => {
    const query = `
        INSERT INTO
        content.component (component_order, table_name, page_id, created_at, modified_by, last_updated)
        VALUES (${component_order}, '${table}', '${page_id}', current_timestamp, '${user}', current_timestamp)
        RETURNING id;
    `;

    console.log(`Query: ${query}`);
    return query;
}

exports.createSimpleSubcomponentsSQL = (data, table, id, user, reference = 'component_id') => {
    let columns = '', values = '';
    for (const [key, value] of Object.entries(data)) {
        columns += `${key},`;
        if (Number.isInteger(value)) {
            values += `${value},`;
        } else {
            values += `'${value}', `
        }
    }

    const sql = `
        INSERT INTO
        content.${table} (${columns} ${reference}, created_at, modified_by, last_updated)
        values (${values} '${id}', current_timestamp, '${user}', current_timestamp)
        RETURNING id;
    `;

    console.log(`Query: ${sql}`);

    return sql;
}

exports.updateSimpleSubcomponentsSQL = (data, table, id, user) => {
    let values = [];
    for (const [key, value] of Object.entries(data)) {
        let cleanValue;
        if (Number.isInteger(value)) {
            cleanValue = `${value}`;
        } else {
            cleanValue = `'${value}' `
        }
        values.push(`${key}=${cleanValue}`);
    }

    //append modified_by and last_update values
    values.push(`last_updated = current_timestamp`);
    values.push(`modified_by = '${user}'`);

    const sql = `
        UPDATE content.${table} SET
        ${values.join(',')}
        WHERE id = '${id}'
        RETURNING id;
    `;

    console.log(`Query: ${sql}`);

    return sql;
}

exports.updateComponentSQL = (component_order, id, user) => {
    const sql = `
        UPDATE content.component
        SET component_order = ${component_order},
        last_updated = current_timestamp,
        modified_by = '${user}'
        WHERE id = '${id}'
        RETURNING id;
    `;

    console.log(`Query ${sql}`);

    return sql;
}
