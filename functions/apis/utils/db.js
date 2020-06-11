const pool = require('../../dbconfig').pool;

const runQuery = async (query) => {
    const client = await pool.connect();
    let result;
    let status;

    try{
        await client.query('BEGIN');

        try{
            result = await client.query(query);
            status = 'ok';
            await client.query('COMMIT');
        }catch(err){
            await client.query('ROLLBACK');
            result = err.stack;
            status = 'error';
        }
    }finally{
        client.release();
    }

    return {
        status: status,
        msg: result
    }
}

const replaceUndefined = (key, value) =>
    (value === 'undefined' || value === undefined) ?
        null :
        value;

module.exports = {
    runQuery,
    replaceUndefined
}