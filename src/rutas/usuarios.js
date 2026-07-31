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


function AccessHeadersAuth(req, res){
	const origin = req.headers.origin;
	if (allowedOrigins.includes(origin)) {
		res.header('Access-Control-Allow-Origin', origin);
	}
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function GenerarToken(usuario, user_rol, user_email, user_fecha_alta){
	
	let rol = 'user'
	if(usuario.length > 4){ rol = 'admin'}
	if(usuario.length > 5){ rol = 'super'}
		
	const payload = { sub: 'subrol', 
		role: user_rol, 
		user:usuario, 
		email:user_email, 
		fechaalta: user_fecha_alta };
		
	const secret = process.env.JWT_SECRET;

	const token = jwt.sign(payload, secret, {
	  expiresIn: '150m'
	});
	
	return token;	
}


async function connectDB() {
    try {
        await client.connect();
        //     console.log(' Conectado con éxito a MongoDB');
        db = client.db(dbName);
    } catch (error) {
        console.error(' Error al conectar a MongoDB:', error);
        process.exit(1); // Detener la app si no hay base de datos
    }
}

async function  buscar_usuarios(filtro){
	try {
		const usuarios = db.collection('usuarios').find(filtro).toArray();
		return usuarios;
	}catch(error){		
		return 'Error : ' + error;
	}
}

async function insertar_usuario(datos){
	//post
	try{		
		const usuarios = basedatos.db.collection('usuarios').insertOne(datos);
		return usuarios;
	}catch(error){
		return 'Error : ' + error;
	}
}

async function actualizar_usuario(filtro, actualizacion){
	try { 
		const usuarios = basedatos.db.collection('usuarios').updateOne(filtro, actualizacion);
		return usuarios;
	}catch(error){		
		return {'Error':  error};
	}
}

export function actulizar_clave(req, res, params){
	
	let resultados = {};
	let ok = 0;
	
	basedatos.connectDB().then(() => {
		try{
			
			const params = req.params; 	
			
			let filtro = {id:0};
			let valores = {clave:'', role:'user',fecha_ultimamodificacion:''};
			
			var nuevaclave = params['nuevaclave'];
			var valor = params['valor'];
			
			let contar = 0;
			if(params.id != undefined){
				const id = parseInt(params.id);
				filtro.id = parseInt(id);
				contar++;
			}
			
			if(params.user != undefined){
				const user = params.user.trim();
				filtro.user = user;
				contar++;
			}
			 
			if(params.clave != undefined){
				const clave = params.clave.trim();
				valores.clave = clave;
				contar++;
			}
			
			if(params.role != undefined){
				const role = params.role.trim();
				valores.role = role; 
			}
	
			
			if(contar > 1){			
			
				//// console.log({'update':'actulizar_clave', filtro:filtro, valores:valores});
				
				let fecha = new Date();
				valores.fecha_ultimamodificacion = fecha;
				
				let actualizacion = {$set: valores };
				
				actualizar_usuario(filtro, actualizacion).then(
					data => {
						if(data.modifiedCount == 0){
							resultados = {'error':'Credenciales invalidas, No se modifico, Revise los datos ', 'filtro' :filtro, 'actualizacion' :actualizacion };
							res.status(400).json( resultados );
						}else{
							resultados = {mensaje:'Exito password actualizada',
								'data':data, 
								'filtro' :filtro, 
								'actualizacion' :actualizacion };
								
							AgregarHeaders(req, res);
							res.status(200).json( resultados );
						}
					}
				);
				
			}else{
				//res.status(500).json({ error: 'Error al actualizar clave usuario, faltan parametros' });
				resultados = { error: 'Error al actualizar clave usuario, faltan parametros' };
				res.status(500).json( resultados );
			}
			
		}catch(error){
			//res.status(500).json({ error: 'Error al actualizar clave usuario' });
			resultados = { error: 'Error al actualizar clave usuario' };
			res.status(500).json( resultados );
		}
	});
	
}
			
export function usuario_nuevo(req, res, params){
	
	basedatos.connectDB().then(() => {
		try{
			
			let contar = 0;
			let usuario = {};
			
			let datos = {
				id: 0,
				user: "",
				clave: "",
				email: "",
				role: "",
				fecha_alta: "",
				bloqueado: 0
			};
			
			
			if(params.id != undefined){
				const id = parseInt(params.id);
				datos.id = id;
				contar++;
			}

			if(params.user != undefined){
				const user = params.user.trim();
				datos.user = user;
				datos.email = user + '@rutas.net';
				contar++;
			}
			
			if(params.clave != undefined){
				const clave = params.clave.trim();
				datos.clave = clave;
				contar++;
			}
			
			if(params.role != undefined){
				const role = params.role.trim();
				datos.role = role; 
			}
			
			if(contar > 2){			
				let fecha = new Date();
				datos.fecha_alta = fecha;
				
				insertar_usuario(datos).then(
					data => {
						//res.json(data);
						usuario = data;
						return usuario;
					}
				);
			}else{
					
				//// console.log({func:'fin usuario nuevo', cantidad:contar, usuario:usuario});
				res.status(500).json({ error: 'Error al insert usuario, faltan parametros' });
				return usuario;
			}
		}catch(error){
			res.status(500).json({ error: 'Error al insert usuario' });
		}
	});
}

export function usuarios_get(req, res){
	connectDB().then(() => {
		try{			
			let filtro = {};
			buscar_usuarios( filtro ).then(
				data => {
					//// console.log(' data:', data);
					AgregarHeaders(req, res);
					res.json(data);
				}
			);			
		}catch(error){
			res.status(500).json({ error: 'Error al obtener usuarios' });
		}
	});
};


export function usuarios_buscar(req, res){
	connectDB().then(() => {
		try{
			
			const  params  = req.params;
			
			let filtro = {};
			
			if(params.user != undefined){
				const user = params.user.trim();
				filtro.user = user; 
			}
			
			buscar_usuarios(filtro).then(
				data => {
					//s// console.log({' data': data});
					AgregarHeaders(req, res);
					res.json(data);
				}
			);			
			
		}catch(error){
			res.status(500).json({ error: 'Error al obtener usuarios' });
		}
	});
};


export function usuarios_login(req, res){
	
	const  params  = req.params;
			
	connectDB().then(() => {	
		try{
	
			// console.log('testeando login');
			// console.log(params);
			
			const usuario = params.user.trim();
			// console.log('testeando param user ' + usuario);
			const clave = params.clave.trim();
			// console.log('testeando param clave ' + clave);
			 
			let resultado = {error:'sin datos'};
			let errores = 0;
			let filtro = {};
	
			//AgregarHeaders(req, res);
	
			if(usuario == undefined){
				
				resultado = { error: 'Error login usuario'};
				errores++;
			}else{
				const user = usuario.trim();
				filtro.user = user; 				
				// console.log('login usuario', {'filtro': filtro});
				
			}
			
			// console.log('paso 1', clave);
			
			if(clave == undefined){
				resultado = { error: 'Error login clave'};
				errores++;
			}else{
				const pass = clave.trim(); 
				// console.log('login clave', {'pass': pass});
			}
			
			// console.log('login pass 2', filtro, errores);
			
			if(errores == 0){
				
					//// console.log({params:params, filtro:filtro});
					buscar_usuarios(filtro).then(
						data => {
							
							// console.log({' data': data});
							resultado = {data:data };
							
							if( data.length == 1 ){
								
								let user_clave = data[0].clave;
								let user_rol = data[0].role;
								let user_bloqueado = parseInt(data[0].bloqueado);
								let user_email = data[0].email;
								let user_fecha_alta = data[0].fecha_alta;
								
								if(user_bloqueado == 0){
									
									resultado = {validando:'validando'};
									
									bcrypt.compare(clave, user_clave, (err, result) => {
										if (err) {
											// Handle error 
											resultado = {error:'Error comparing passwords:', mensaje: err};
										}else{								 
											if (result) {
												// Passwords match, authentication successful OK 	
												let token = GenerarToken(usuario, user_rol, user_email, user_fecha_alta);
												
												resultado = {resultado:'exito', 
													token: token,
													mensaje:'Passwords OK! Usuario autenticado.',
													message:'Passwords match! User authenticated.'};
											} else {
												// Passwords don't match, authentication failed 
												resultado = {error:'Error pass fallo autenticacion', 
													message : 'Passwords do not match! Authentication failed.'};
											}
										}
										
										// console.log(resultado)
										res.json({resultado:resultado});
								
									});
								}else{
									resultado = {error:'Usuario Bloquedo', bloqueado:user_bloqueado };
									// AgregarHeaders(req, res);
									res.status(200).json({resultado:resultado, rol:user_rol, bloqueado:user_bloqueado});
								
								}
								
									
							}else{
								//res.json(data);
								res.status(500).json({ error: 'Error login' });
							}
						}
					);		
			}else{
				res.status(500).json(resultado);
			}
		}catch(err){
			res.status(500).json({ error:err, mensaje: 'Error al obtener usuarios', parametros: params });
		}
	});
};

export function usuarios_test(req, res){
	AgregarHeaders(req, res)
	res.send('Users home page');
};
