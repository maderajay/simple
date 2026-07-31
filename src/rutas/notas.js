import { config } from 'dotenv';
import { MongoClient, ObjectId  } from 'mongodb'; 
import * as basedatos from './basedatos.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

config(); 
// Configuración de MongoDB
const url = process.env.DB_URI;
const client = new MongoClient(url);
const dbName = 'mundial';
let db;

const allowedOrigins = ['http://localhost:8080', 'https://expressmundial.onrender.com'];

function AgregarHeaders(req, res){
	const origin = req.headers.origin;
	if (allowedOrigins.includes(origin)) {
		res.header('Access-Control-Allow-Origin', origin);
	}
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function getNextSequence(sequenceName) {
	
	const filtro = { _id: sequenceName };
	
	const actualizacion = {
	  $inc: { 
		sequence_value: 1      // Incrementa el campo 'sequence_value' en 1 
	  }
	};

	const resultado = await basedatos.db.collection('contadores').updateOne(filtro, actualizacion);
	const contadores = await basedatos.db.collection('contadores').find(filtro).toArray();
	// console.log('function getNextSequence',resultado, 'contadores', contadores[0]);
	return contadores[0].sequence_value;

}


async function connectDB() {
    try {
        await client.connect(); 
        db = client.db(dbName);
    } catch (error) {
        console.error(' Error al conectar a MongoDB:', error);
        process.exit(1); // Detener la app si no hay base de datos
    }
}

async function IniciaContadores(){
	
	const datos = {
		  _id: "notasId",
		  sequence_value: 0
	};
	const contador = basedatos.db.collection('contadores').insertOne(datos);
	
	return contador;
}

async function  buscar_notas(filtro){
	try {
		const notas = db.collection('notas').find(filtro).toArray();
		return notas;
	}catch(error){		
		return {'Error': error};
	}
}

async function insertar_nota(datos){
	//post
	try{	
		const notas = basedatos.db.collection('notas').insertOne(datos);
		return notas;
	}catch(error){
		return {'Error': error};
	}
}

async function actualizar_nota(filtro, actualizacion){
	try { 
		const notas = basedatos.db.collection('notas').updateOne(filtro, actualizacion);
		return notas;
	}catch(error){		
		return {'Error':  error};
	}
}

//////////////////7

export function nota_inicio_contador(req, res){
	
	basedatos.connectDB().then(() => {
		try{
			
			IniciaContadores().then(
					data => { 
						res.status(200).json(data); 
					}
				);
		 
		}catch(error){
			return res.status(500).json({ error: 'Error counter' });
		}
	});
	
}

		
export function nota_nueva(req, res){
	
	basedatos.connectDB().then(() => {
		try{
			
			let contar = 0;
			let nota = {};
			
			let fecha = new Date();
			let token_user = req.user.user;
			let token_rol = req.user.role;
					
			let datos = {
				user: token_user,
				rol: token_rol,
				titulo: "",
				nota: "",
				fecha_alta: fecha,
				id : 0
			};
			
			const  params  = req.params;
			
			// console.log('notas insert' , params);
			// console.log('datos globales', req.user );
			
			if(token_user != undefined){
				const user = token_user;
				datos.user = user;
				datos.email = user + '@rutas.net';
				contar++;
			}
			
			if(params.titulo != undefined){
				const titulo = params.titulo.trim();
				datos.titulo = titulo;
				contar++;
			}
			
			if(params.nota != undefined){
				const nota = params.nota.trim();
				datos.nota = nota; 
				contar++;
			}
			
			
			if(contar > 2){			
				
				
				getNextSequence("notasId").then(
				
					dataid => {  
						const newId = dataid;
						datos.id = newId;
			
						insertar_nota(datos).then(
							data => { 
								res.status(200).json(data); 
							}
						);
						
					}
				);

			}else{
					
				// console.log({func:'fin nota nuevo', cantidad:contar, nota:nota});
				return res.status(500).json({ error: 'Error al insert nota, faltan parametros' });
				// ejemplo return res.status(400).json(...)
				
			}
		}catch(error){
			res.status(500).json({ error: 'Error al insert nota' });
		}
	});
}

export function notas_get(req, res){
	connectDB().then(() => {
		try{			
		
			let filtro = {};
		
			let token_user = req.user.user;
			let token_rol = req.user.role;
			
			const  params  = req.params;
			
			if( params.titulo != undefined ){
				filtro.titulo = params.titulo; 
			}
			/*
			if( params.user != undefined ){
				filtro.user = params.user; 
			}
			*/
			
			if( token_user != undefined ){
				filtro.user = token_user; 
			}
			
			buscar_notas( filtro ).then(
				data => {
					// console.log('notas get data:', data);
					//AgregarHeaders(req, res);
					res.json(data);
				}
			);			
		}catch(error){
			res.status(500).json({err: error,  error: 'Error al obtener notas' });
		}
	});
}


export function notas_test(req, res){
	// AgregarHeaders(req, res)
	res.json({test: 'Notas home page'});
}
