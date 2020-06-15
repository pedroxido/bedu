const firebaseHelper = require('firebase-functions-helper/dist')

const productsCollection = 'products'
const categoryCollection = 'category'

exports.getProducts = async (_, res) => {
    let response = []
    firebaseHelper.firestore
        .backup(db, productsCollection)
        .then(data => {
            promises = [];
            for (const [key, value] of Object.entries(data.products)) {
                let currentProduct = value;
                console.log(JSON.stringify(value))
                let promise = firebaseHelper.firestore.getDocument(db, value.category_id._path.segments[0], value.category_id._path.segments[1])
                    .then(data => {
                        data.id = value.category_id._path.segments[1]
                        console.log(data)
                        currentProduct.category = data
                        delete currentProduct.category_id
                        response.push({
                            [key]: currentProduct
                        })
                    })
                promises.push(promise)
            }

            return Promise.all(promises);
        })
        .then(() => {
            return res.status(200).send(response)
        })
        .catch(error => res.status(400).send(`Cannot get products: ${error}`))
}

exports.getProduct = async (req, res) => {
    let response = {}
    firebaseHelper.firestore
        .getDocument(db, productsCollection, req.params.id)
        .then(doc => {
            response = doc
            return firebaseHelper.firestore.getDocument(db, doc.category_id._path.segments[0], doc.category_id._path.segments[1])
        })
        .then(data => {
            response.category = data
            delete response.category_id
            res.status(200).send(response)
        })
        .catch(error => res.status(400).send(`Cannot get product: ${error}`));
}

exports.createProduct = async (req, res) => {

    console.log(`Check if category exists ${req.body['category_id']}`)
    firebaseHelper.firestore
        .getDocument(db, categoryCollection, req.body['category_id'])
        .then(_ => {
            console.log('Found')
            return db.collection(categoryCollection).doc(req.body['category_id'])
        })
        .then(category_ref => {
            console.log('Got cat ref')
            const product = {
                name: req.body['name'],
                unit: req.body['unit'],
                unit_price: req.body['unit_price'],
                unit_qty: req.body['unit_qty'],
                available: (req.body['unit_qty'] > 0) ? true : false,
                category_id: category_ref
            }

            return firebaseHelper.firestore
                .createNewDocument(db, productsCollection, product);
        })
        .then(newDoc => res.status(201).send(`Created a new product: ${newDoc.id}`))
        .catch(_ => {
            console.log('Not found category_id')
            return res.status(400).send(`Category id not found`)
        })
}

exports.updateProduct = async (req, res) => {
    firebaseHelper.firestore
        .getDocument(db, categoryCollection, req.body['category_id'])
        .then(doc => {
            console.log('Found')
            console.log(doc)
            console.log(JSON.stringify(doc))
            if(!doc)
                return res.status(404).send(`Category id not found`)
            return db.collection(categoryCollection).doc(req.body['category_id'])
        })
        .then(category_ref => {
            console.log('Got cat ref')
            const product = {
                name: req.body['name'],
                unit: req.body['unit'],
                unit_price: req.body['unit_price'],
                unit_qty: req.body['unit_qty'],
                available: (req.body['unit_qty'] > 0) ? true : false,
                category_id: category_ref
            }

            return firebaseHelper.firestore
            .updateDocument(db, productsCollection, req.params.id, product);
        })
        .then(_ => res.status(204).send(`Update new product`))
        .catch(_ => {
            console.log('Not found category_id')
            return res.status(400).send(`Category id not found`)
        })
}

exports.deleteProduct = async(req, res) => {
    const deletedContact = await firebaseHelper.firestore
        .deleteDocument(db, productsCollection, req.params.id);
    res.status(204).send(`Product is deleted: ${deletedContact}`);
}