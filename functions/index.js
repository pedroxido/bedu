const functions = require('firebase-functions')

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/json' }));

app.get('/ping', async  (req, res) => {
	const pingResponse = res.send({message: 'ok'});
	res.end();
	return pingResponse;
});

const productsRoutes = require('./apis/products/routes/productsRoutes')
app.use('/products', productsRoutes)

app.use((req, res, next) => {
	res.status(404).send({ error: `${req.originalUrl} not found` })
	next()
});

const api = functions.https.onRequest(app);

module.exports = {
	api
}