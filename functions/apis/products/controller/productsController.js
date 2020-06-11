const functions = require('firebase-functions')
const admin = require('firebase-admin')
const firebaseHelper = require('firebase-functions-helper/dist')

admin.initializeApp(functions.config().firebase)
const db = admin.firestore()

const productsCollection = 'products'

exports.getProducts = async (req, res) => {
    let response = []
    firebaseHelper.firestore
        .backup(db, productsCollection)
        .then(data => {
            promises = [];
            for(const [key, value] of Object.entries(data.products)){
                let currentProduct = value;
                console.log(JSON.stringify(value))
                let promise = firebaseHelper.firestore.getDocument(db, value.category_id._path.segments[0], value.category_id._path.segments[1])
                                .then(data => {
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