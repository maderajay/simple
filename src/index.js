import express from 'express';
import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

const router = express.Router();

// let usuariosRouter = require('./rutas/usuarios');
// C:\Users\roger\Documents\NPM\Simple\src\rutas\usuarios.js
import * as usuarios from './rutas/usuarios.js';
import * as partidos from './rutas/partidos.js';
import * as paises from './rutas/paises.js';
import * as grupos from './rutas/grupos.js';

config(); 
// Configuración de MongoDB
const url = process.env.DB_URI;
const client = new MongoClient(url);
const dbName = 'mundial';
let db;

const allowedOrigins = ['http://localhost:8080', 'https://expressmundial.onrender.com'];

const app = express();
const PORT = process.env.PORT;

const version = 3.0;

async function connectDB() {
    try {
        await client.connect();
        //console.log(' Conectado con éxito a MongoDB');
        db = client.db(dbName);
    } catch (error) {
        console.error(' Error al conectar a MongoDB:', error);
        process.exit(1); // Detener la app si no hay base de datos
    }
}
////////////////////////////////////////////////777

// middleware that is specific to this router
const timeLog = (req, res, next) => {
  console.log('Time: ', Date.now());
  next();
};

// Middleware para procesar datos en formato JSON
app.use(express.json());

/////////////////////////////////////////////////7
let rutas = ['/partidos_get','/partidos_filtro/:numeral','/partidos_filtro_pais/:pais',
	'/partido_actualizar/:numeral/:goleslocal/:golesvisita/:golespenallocal/:golespenalvisita',
	'/partido_insertar/:numeral/:paislocal/:paisvisita/:grupo/:fecha',	
	'/partido_actualizar_ids/:pais/:paisid', '/pais_get', 
	'/pais_filtro/:id', 
	'/pais_filtro_pais/:pais', 
	'/grupo_actualizar',
	'/grupos',
	'/add','/book',
	'/grupos_collection','/paises','/paises/:id','/paises/orden/:ord',
	'/partidos/orden/:pais/:ord',
	'/partidos',
	'/partidos/:numeral',
	'/about', 
	];

app.get('/partidos_get', partidos.partidos_get);
app.get('/partidos_filtro/:numeral', partidos.partidos_filtro);
app.get('/partidos_filtro_pais/:pais', partidos.partidos_filtro);

// put
app.put('/partido_actualizar_clave_valor/:numeral/:campo/:valor', partidos.partido_actualizar_clave_valor);

// PUT actualizar
app.put('/partido_actualizar/:numeral/:goleslocal/:golesvisita/:golespenallocal/:golespenalvisita', partidos.partido_actualizar);
// POST insert
app.post('/partido_insertar/:numeral/:paislocal/:paisvisita/:grupo/:fecha', partidos.partido_insertar);

app.get('/partido_actualizar_ids/:pais/:paisid', partidos.partido_actualizar_ids);


app.get('/pais_get', paises.paises_get);
app.get('/pais_filtro/:id', paises.paises_filtro);
app.get('/pais_filtro_pais/:pais', paises.paises_filtro);

// PUT actualizar
app.put('/grupo_actualizar/:id/:grupo', grupos.grupo_actualizar);


app.route('/grupos').get(grupos.grupos_get)
  .post(grupos.grupos_get)
  .delete(grupos.grupos_get)
  .put(grupos.grupos_get);
  


app.get('/add', async (req, res) => {
	let sum = usuarios.add(2,3);
	//console.log(sum);
	res.send('Suma ' + sum);
});

app
  .route('/book').get((req, res) => { res.send('Get a random book');
  }).post((req, res) => { res.send('POST Add a book');
  }).delete((req, res) => { res.send('DELETE. Eliminar a book');
  }).put((req, res) => { res.send('PUT. Update the book'); });
  
////////////////////////////////////////////////
app.get('/grupos_collection', async (req, res) => {
    try {
        const grupos = await db.collection('grupos').find({}).toArray();
        res.json(grupos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener grupos' });
    }
});

////////////////////////////////////////////////
app.get('/paises', async (req, res) => {
    try {
        
		// const paises = await db.collection('paises').find({},{pais:1,_id:0}).toArray();
		// 											({ campo: { $gt: valor } })
        const paises = await db.collection('paises').find({id:{$gt:10}}).toArray();
		//console.log('paises', paises);
		
		let resultados = [];
		
		paises.forEach(function (p) {
			 resultados.push({id:p.id, pais:p.pais });
		  });
		res.json(resultados);
		
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener paises' });
    }
});

app.get('/paises/:id', async (req, res) => {
    try {
		
		const  params  = req.params;
		const id = parseInt(params.id);
		//console.log('paises . id', id);
		
        const paises = await db.collection('paises').find({'id':id}).toArray();
        res.json(paises);
		
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener ID paises' });
    }
});

app.get('/paises/orden/:ord', async (req, res) => {
    try {
		
		const  params  = req.params;
		const ord = parseInt(params.ord);
		
        const paises = await db.collection('paises').find({}).sort({ pais: ord }).toArray();
        res.json(paises);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener Orden paises' });
    }
});

//////////////////////////

app.get('/partidos/orden/:pais/:ord', async (req, res) => {
    try {
		
		const  params  = req.params;
		const ord = parseInt(params.ord);
		const pais = params.pais;
		
        const partidos = await db.collection('partidos').find({paislocal: pais}).sort({ paislocal: ord }).toArray();
        res.json(partidos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener partidos' });
    }
});

app.get('/partidos', async (req, res) => {
    try {
        const partidos = await db.collection('partidos').find({}).sort({paislocal:1}).toArray();
		
		const origin = req.headers.origin;
		if (allowedOrigins.includes(origin)) {
			res.header('Access-Control-Allow-Origin', origin);
		}
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		res.json(partidos);
		//res.status(500).json({ error: 'Error al obtener partidos desordenados' });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener partidos' });
    }
});

app.get('/partidos/:numeral', async (req, res) => {
    try {
		const  params  = req.params;
		const numeral = parseInt(params.numeral);
		
		const partidos = await db.collection('partidos').find({'numeral':numeral}).toArray();
        
		const origin = req.headers.origin;
		if (allowedOrigins.includes(origin)) {
			res.header('Access-Control-Allow-Origin', origin);
		}
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		res.json(partidos);
		
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener partidos' });
    }
});

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
	res.send('Servidor simple (V.' + version + ')');
});

app.get('/about', (req, res) => {
	
	// const  params  = req.params;
	// const num = parseInt(params.num);
	// console.log('add num ', num );
	
	let htmlul = " ";
	rutas.forEach(item => { 
        htmlul += " " + item + " ";
    });
	htmlul += " ";
	
	res.json({'About page ':htmlul});
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
    });
});
