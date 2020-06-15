const firebaseHelper = require('firebase-functions-helper/dist')

const categoryCollection = 'category'


exports.getCategories = async (_, res) => {
    firebaseHelper.firestore
        .backup(db, categoryCollection)
        .then(data => res.status(200).send(Object.entries(data.category).map((e) => ( { [e[0]]: e[1] } ))))
        .catch(error => res.status(400).send(`Cannot get category: ${error}`))
}

exports.getCategory = async(req, res) => {
    firebaseHelper.firestore
        .getDocument(db, categoryCollection, req.params.id)
        .then(doc => res.status(200).send(doc))
        .catch(error => res.status(400).send(`Cannot get category: ${error}`));
}

exports.createCategory = async(req, res) => {
    const category = {
        name: req.body['name']
    }

    const newDoc = await firebaseHelper.firestore
            .createNewDocument(db, categoryCollection, category);
        res.status(201).send(`Created a new category: ${newDoc.id}`);
}

exports.updateCategory = async(req, res) => {
    const category = {
        name: req.body['name']
    }
    const updatedDoc = await firebaseHelper.firestore
        .updateDocument(db, categoryCollection, req.params.id, category);
    res.status(204).send(`Update a new category: ${updatedDoc}`)
}

exports.deleteCategory = async(req, res) => {
    const deletedContact = await firebaseHelper.firestore
        .deleteDocument(db, categoryCollection, req.params.id);
    res.status(204).send(`Contact is deleted: ${deletedContact}`);
}