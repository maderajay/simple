import express from 'express';
import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
 
const router = express.Router();

// let usuariosRouter = require('./rutas/usuarios');
// C:\Users\roger\Documents\NPM\Simple\src\rutas\usuarios.js
import * as usuarios from './rutas/usuarios.js';
import * as partidos from './rutas/partidos.js';
import * as paises from './rutas/paises.js';
import * as grupos from './rutas/grupos.js';
import * as notas from './rutas/notas.js';

config(); 
// Configuración de MongoDB
const url = process.env.DB_URI;
const client = new MongoClient(url);
const dbName = 'mundial';
let db;

const allowedOrigins = ['http://localhost:8080', 'https://expressmundial.onrender.com'];

const app = express();
const PORT = process.env.PORT;

const version = 4.0;

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
	'/nososjuez', 
	];


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

function HeadersAuth(req, res){
	const origin = req.headers.origin;
	if (allowedOrigins.includes(origin)) {
		res.header('Access-Control-Allow-Origin', origin);
	}
	res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}


///////////////////////////////////////// Middleware para procesar datos en formato JSON
	//////////////////////////////////////////////// app.use(express.json());
			
app.use('/login/:user/:clave', (req, res, next) => {
  console.log('Request Type:', req.method);  
  next();
});

app.get("/login/:user/:clave", usuarios.usuarios_login);
			
			

app.use((req, res, next) => {
		
		const rutasExcluidas = ['/', '/usuarios', '/login', '/usuarios_test', '/token'];
		//console.log({'req path':req.path, 'exluidas':rutasExcluidas})
  
	  if (rutasExcluidas.includes(req.path)) {
		//console.log('exluida con exito' + req.path);
		return next(); // Sale del middleware y pasa a la ruta
	  }else{

		// console.log('Noooo exluida ' + req.path);

		const authHeader = req.headers.authorization;
		// console.log('app use authHeader', authHeader);
		
		
		if(authHeader == undefined){
			// console.log('Auth Header ' + authHeader);
			return res.status(500).json({ error: 'Sin Token Valido' });
			//return 0;
		}else{
			
			let resultado = ValidarToken(req, res);	
			// console.log('resultado ', resultado);
			
			if(resultado.error > 0 ){
				return res.status(500).json(resultado);
			}else{
				next();
			}
		}	
		 // next();
	  }
	  
		// next();
});



function ValidarToken(req, res){
	
	
	let resultado = {error:100, mensaje:'sindatos'};
		
	const authHeader = req.headers.authorization;
	// console.log('validar token', authHeader);
	
	
	if(authHeader == undefined){
		resultado = { error:5, mensaje: 'Token header invalido'};
		return resultado;
	}
	
	const token0 = authHeader && authHeader.split(' ')[0]; //Bearer 
	const token1 = authHeader && authHeader.split(' ')[1];
	
	const token = token1
	
	
	if(token == undefined){
		resultado = { error:4, mensaje: 'Token Invalido / Vacio (Falta Bearer)'};
		return resultado;
	}
	

	if (!token) {
		resultado = { error:1, mensaje: 'Sin Token'};
		return resultado;
	}
	
	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

		if (err) {
			resultado =  { error:2, mensaje: 'Invalid or expired token' };
		} 

		if(decoded == undefined){
			resultado =  { error:3, mensaje: 'error token invalido', 'decoded':decoded };
		}else{ 
			req.user = decoded;	
			resultado =  { error:0, mensaje: 'Exito', 'decoded':decoded };
		}
	});
	
	// console.log(resultado);
	return resultado;
	
}


//put actuliza datos
app.put("/usuario/:id/:user/:pass", async (req, res) => {
	
	const  params  = req.params;
	const id = params.id.trim();
	const usuario = params.user.trim();
	const pass = params.pass.trim();
	
	//console.log({id:id, user:usuario, pass:pass});
	
	const saltRounds = 10;
	let resultado = {info:''};
	
	bcrypt.hash(pass, saltRounds, (err, hash) => {
		
		if (err) {
			// Handle error
			//res.send({'error':err});
			return res.status(403).json({error:err, message: 'fallo insert usuario' });
		}

		// Hashing successful, 'hash' contains the hashed password
		// console.log('Hashed password:', hash);
		
		let rol = 'user'
		if(pass.length > 4){ rol = 'admin'}
		if(pass.length > 5){ rol = 'super'}
		
		params.role = rol;
		params.clave = hash;
		
		let resultado = usuarios.actulizar_clave(req, res, params);	
	});
});



app.get('/usuarios', usuarios.usuarios_get);
app.get('/usuario/:user', usuarios.usuarios_buscar);

app.get('/usuarios_test', usuarios.usuarios_test); 


/////////no validar token.. Middleware app.use()
///:numeral/:paislocal/:paisvisita/:grupo/:fecha
app.post("/usuario/:id/:user/:pass", async (req, res) => {
	
	const  params  = req.params;
	const id = params.id.trim();
	const usuario = params.user.trim();
	const pass = params.pass.trim();
	
	const saltRounds = 10;
	let resultado = {};
	
	bcrypt.hash(pass, saltRounds, (err, hash) => {
		
		if (err) {
			// Handle error
			//res.send({'error':err});
			return res.status(403).json({error:err, message: 'fallo insert usuario' });
		}

		// Hashing successful, 'hash' contains the hashed password
		// console.log('Hashed password:', hash);
		
		let rol = 'user'
		if(pass.length > 4){ rol = 'admin'}
		if(pass.length > 5){ rol = 'super'}
		
		params.role = rol;
		params.clave = hash;
		
		let resultado = usuarios.usuario_nuevo(req, res, params);
	});
	
	res.send({'usuario':resultado});
	
});

///////////////////////////////////7
 

app.get("/token", async (req, res) => {

	//const authHeader = req.headers['authorization'];
	const authHeader = req.headers.authorization;
	
	const token0 = authHeader && authHeader.split(' ')[0]; //Bearer 
	const token1 = authHeader && authHeader.split(' ')[1];

	const token = token1
	
	
	// console.log('metodo token....', authHeader);
	
	if (!token) {
		return res.status(401).json({ mensaje: 'Token missing', 
			headers: authHeader });
	}
	
	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
	if (err) {
	  return res.status(403).json({ message: 'Token Invalido o Expirado', 'decoded':decoded, error:err });
	}
		req.user = decoded;
		//next();
		
		return res.send({'datos':decoded});
		
	});

	
});


app.post("/tokenvalido", async (req, res) => {
	
	//res.status(500).json({ error: 'Error token' });
	//const authHeader = req.headers['authorization']; 
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];

	const token0 = authHeader && authHeader.split(' ')[0]; //Bearer 
	const token1 = authHeader && authHeader.split(' ')[1];

	if (!authHeader) {
		return res.status(401).json({ mensaje: 'header token invalido',
			headers: req.headers });
	}
	
	if (!token) {
		return res.status(401).json({ mensaje: 'Token missing',
			token0:token0,
			token1:token1,
			headers: req.headers });
	}
	
	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
		  return res.status(403).json({ message: 'Invalid or expired token' , error:err,
				token0:token0,
				token1:token1, 
				tok: authHeader, token:token});
		}
		req.user = decoded;
		res.send({'exito':decoded, 'user':decoded.user});
		//next();
	});

	//res.send({'token':token});
	
});
 
////////////////////////////////////
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
		
		const origin = req.headers.origin;
		if (allowedOrigins.includes(origin)) {
			res.header('Access-Control-Allow-Origin', origin);
		}
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		
        res.json(grupos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener grupos' });
    }
});




////////////////////////////////////////////////
app.get('/paises',  paises.paises_get );
app.get('/paises_filtro',  paises.paises_filtro_diez);


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

app.get('/partidos/grupo/:grupo/:ord', async (req, res) => {
    try {
		
		const  params  = req.params;
		const ord = parseInt(params.ord);
		const grupo = params.grupo;
		
        const partidos = await db.collection('partidos').find({grupo: grupo}).sort({ numeral: ord }).toArray();
		
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

app.get('/partidos/orden/:pais/:ord', async (req, res) => {
    try {
		
		const  params  = req.params;
		const ord = parseInt(params.ord);
		const pais = params.pais;
		
        const partidos = await db.collection('partidos').find({paislocal: pais}).sort({ paislocal: ord }).toArray();
		
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

app.get('/partidos', async (req, res) => {
    try {
        const partidos = await db.collection('partidos').find({}).sort({numeral:1}).toArray();
		
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
	res.json({ 'Servidor':'Servidor Simple', 'Version':version, 'Rutas':rutas });
	//res.send('Servidor simple (V.' + version + ')');
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

///////////

app.get('/notas', notas.notas_get);
app.get('/notas/:titulo', notas.notas_get);
app.get('/notasxuser/:user', notas.notas_get);

app.get('/notas_test', notas.notas_test);
app.post('/nota/:titulo/:nota', notas.nota_nueva);

app.get('/contadores', notas.nota_inicio_contador);

////////

/*
app.use((req, res, next) => {
	// console.log('Midelware final');
});
*/

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
    });
});
