import { MongoClient, ObjectId  } from 'mongodb'; 
import * as basedatos from './basedatos.js';

async function buscar_id(id){
	//const usuario = await Usuario.findById(req.params.id);
	const paises = basedatos.db.collection('paises').find({'_ID':id}).toArray();
	return paises;	
}

async function filtra_partidos(filtro){
	const partidos = basedatos.db.collection('partidos').find(filtro).sort({'numeral':-1}).toArray();
	return partidos;
}

async function  buscar_partidos(){
	try {
		const partidos = basedatos.db.collection('partidos').find({}).sort({'numeral':-1}).toArray();
		return partidos;
	}catch(error){		
		return 'Error : ' + error;
	}
}

async function insertar_partido(datos){
	//post
	try{
		const partidos = basedatos.db.collection('partidos').insertOne(datos);
		return partidos;
	}catch(error){
		return 'Error : ' + error;
	}
}

async function actualizar_partido(filtro, actualizacion){
	try { 
		const partidos = basedatos.db.collection('partidos').updateOne(filtro, actualizacion);
		return partidos;
	}catch(error){		
		return {'Error':  error};
	}
}


async function actualizar_muchos_partido(filtro, actualizacion){
	try { 
		const partidos = basedatos.db.collection('partidos').updateMany(filtro, actualizacion);
		return partidos;
	}catch(error){		
		return {'Error':  error};
	}
}

export function partido_insertar(req, res){
	//post
	basedatos.connectDB().then(() => {
		try{
			const  params  = req.params; 
			let contar = 0;
			
			let datos = {
				numeral: 0,
				paislocal: "",
				goleslocal: 0,
				paisvisita: "",
				golesvisita: 0,
				grupo: "" ,
				golespenallocal: 0,
				golespenalvisita: 0,
				activa: true,
				fecha: "",
				ultima_actualizacion:"" 
			};
			
			if(params.numeral != undefined){
				const numeral = parseInt(params.numeral);
				datos.numeral = numeral;
				contar++;
			}

			if(params.paislocal != undefined){
				const paislocal = params.paislocal.trim();
				datos.paislocal = paislocal;
				contar++;
			}
			
			if(params.paisvisita != undefined){
				const paisvisita = params.paisvisita.trim();
				datos.paisvisita = paisvisita;
				contar++;
			}
			
			if(params.grupo != undefined){
				const grupo = params.grupo.trim();
				datos.grupo = grupo;
				contar++;
			}
			
			if(params.fecha != undefined){
				const fecha = params.fecha.trim();
				datos.fecha = fecha;
				contar++;
			}
			
			if(contar == 5){
			
				let fecha = new Date();
				datos.ultima_actualizacion = fecha;
				
				
				insertar_partido(datos).then(
					data => {
						res.json(data);
					}
				);
			}
			
		}catch(error){
			res.status(500).json({ error: 'Error al actualizar partido' });
		}
	});
}

export function partido_actualizar_ids(req, res){
	
	basedatos.connectDB().then(() => {
		try{		
		
			///:pais/:paisid
			const  params  = req.params; 
			
			let filtro = {paislocal:'Argentina'};
			let valores = {paislocal_id:'6a46ddf9b13182a7fa0f2d2f', ultima_actualizacion:''}; 
			
			let filtro_visita = {paisvisita:'Argentina'};
			let valores_visita = {paisvisita_id:'6a46ddf9b13182a7fa0f2d2f', ultima_actualizacion:''}; 
			
			
			//console.log(params);			
			
			
			let contar = 0;
			
				if(params.pais != undefined){
					const pais = params.pais.trim();
					filtro.paislocal = pais;
					filtro_visita.paisvisita = pais;
					contar++;
				}
				
				console.log('1.local', contar ,filtro, filtro_visita);
			
				//6a46ddf8b13182a7fa0f2d29 params.paisid
				//console.log('2.id', "6a46ddf8b13182a7fa0f2d29" );
				
				let pais = '';
				
				buscar_id(params.paisid).then(
					pais => {	
						/// console.log('pais', pais);
					}
				);
				
				
				if (!ObjectId.isValid(params.paisid)) {
					/// console.log({ error: 'Pais _ID inválido' });
				}else{
					var object_id = ObjectId(paisid);
					/// console.log('Pais_ID', object_id);
				}
				
				if(params.paisid != undefined){
					
					const paisid = params.paisid;
					
					valores.paislocal_id = ObjectId(paisid);
					valores_visita.paisvisita_id = ObjectId(paisid);
					contar++;
				}
				
				/// console.log('1.visita', contar, valores, valores_visita);

			
			/// console.log('local',filtro, valores);
			/// console.log('visita', filtro_visita, valores_visita);
			
			// res.json(params);
			
			
			if(contar == 2){
			
				let fecha = new Date();
				valores.ultima_actualizacion = fecha;
				valores_visita.ultima_actualizacion = fecha;
				
				let actualizacion = {$set: valores }; 
				let actualizacion_visita = {$set: valores_visita };
				
				actualizar_muchos_partido(filtro, actualizacion).then(
					data => {	
						/// console.log(data);
					}
				);
				
				actualizar_muchos_partido(filtro_visita, actualizacion_visita).then(
					data => {
						res.json(data);
					}							
				);
				
			}
			
		}catch(error){
			res.status(500).json({ error: 'Error Actualizar partido Ids', mensaje:error });
		}
	});
}



export function partido_actualizar_clave_valor(req, res){
	
	basedatos.connectDB().then(() => {
		try{		
		
			const params = req.params; 	
			
			//console.log(params);
			let filtro = {numeral:0};
			let valores = {};
			//var str = '';
			
			for (const property in params) {
			  console.log(`${property}: ${params[property]}`); 
			}
			
			var campo = params['campo'];
			var valor = params['valor'];
			
			let contar = 0;
			if(params['numeral'] != undefined){
				const numeral = params['numeral'];
				filtro.numeral = parseInt(numeral);
				contar++;
			}
			
			if(params['campo'] != undefined){
				campo = params['campo']; 
				contar++;
			}
			if(params['valor'] != undefined){
				valor = params['valor']; 
				contar++;
				
				if(campo == 'paislocal'){valores.paislocal = valor; }
				if(campo == 'paisvisita'){valores.paisvisita = valor; }
				if(campo == 'grupo'){valores.grupo = valor; }
				if(campo == 'fecha'){valores.fecha = valor; }
			}
			
			if(contar == 3){
			
				let fecha = new Date();
				valores.ultima_actualizacion = fecha;
				
				let actualizacion = {$set: valores }
				
				actualizar_partido(filtro, actualizacion).then(
					data => {
						res.json( {'data':data, 'filtro' :filtro, 'actualizacion' :actualizacion } );
					}
				);
			}
			
		}catch(error){
			res.status(500).json({ error: 'Error Actualizar partido clave valor', mensaje:error });
		}
	} );
	
}

export function partido_actualizar(req, res){
	
	basedatos.connectDB().then(() => {
		try{
		
			const  params  = req.params; 
			
			let filtro = {numeral:0};
			let valores = {goleslocal:0, 
				golesvisita:0, 
				golespenallocal:0, 
				golespenalvisita:0,
				ultima_actualizacion:0};
				
			let contar = 0;
			//numeral, goleslocal, golesvisita, golespenallocal, golespenalvisita
			if(params.numeral != undefined){
				const numeral = parseInt(params.numeral);
				filtro.numeral = numeral;
				contar++;
			}
			
			if(params.goleslocal != undefined){
				const goleslocal = parseInt(params.goleslocal);
				valores.goleslocal = goleslocal;
				contar++;
			}
			
			if(params.golesvisita != undefined){
				const golesvisita = parseInt(params.golesvisita);
				valores.golesvisita = golesvisita;
				contar++;
			}
			
			if(params.golespenallocal != undefined){
				const golespenallocal = parseInt(params.golespenallocal);
				valores.golespenallocal = golespenallocal;
			}
			
			if(params.golespenalvisita != undefined){
				const golespenalvisita = parseInt(params.golespenalvisita);
				valores.golespenalvisita = golespenalvisita;
			}
			
			if(contar == 3){
			
				let fecha = new Date();
				valores.ultima_actualizacion = fecha;
				
				let actualizacion = {$set: valores }
				
				actualizar_partido(filtro, actualizacion).then(
					data => {
						res.json(data);
					}
				);
			}
						
		}catch(error){
			res.status(500).json({ error: 'Error al actualizar partido ', info: error });
		}
	});
};


export function partidos_filtro(req, res){

	basedatos.connectDB().then(() => {
		try{
			const  params  = req.params; 
			
			let filtro = {};
			let pais = '';
			
			if(params.numeral != undefined){
				const numeral = parseInt(params.numeral);
				filtro = {'numeral':numeral};
			}
			
			if(params.pais != undefined){
				pais = params.pais.trim();
				
				filtro =  { $or: [ 
					{ 'paislocal': { $regex: pais } },
					{ 'paisvisita': { $regex: pais } }
					]
				};
			}
			
			filtra_partidos(filtro).then(
				data => {
					var golesafavor=0;
					var golesencontra=0;
					var golespenallocal=0;
					var golespenalvisita=0;
					var partidosganados=0;
					var partidosperdidos=0;
					var partidosempatados=0;
					var puntos=0;
					var paisvisita='';
					
					for (const property in data) {
					  
					  let item = data[property];
					  
					  // console.log(`${property}: ${data[property]}`);
					  // console.log('informacion' ,data[property], pais);
					  var glfavor = 0;
					  var gplfavor = 0;
					  
					  var glvisita = 0;
					  var gpvisita = 0;
					  
					  if(item.paislocal == pais){
						glfavor = parseInt(item.goleslocal);
						gplfavor = parseInt(item.golespenallocal);
						
						glvisita = parseInt(item.golesvisita);
						gpvisita = parseInt(item.golespenalvisita);
						
						paisvisita += item.paisvisita+'.';
					  }
					 
					 if(item.paisvisita == pais){
						glfavor = parseInt(item.golesvisita);
						gplfavor = parseInt(item.golespenalvisita);
						
						glvisita = parseInt(item.goleslocal);
						gpvisita = parseInt(item.golespenallocal);

						paisvisita += item.paislocal+'.';
					  }
					  
						golesafavor += parseInt(glfavor);
						golespenallocal += parseInt(gplfavor);

						golesencontra += parseInt(glvisita);
						golespenalvisita += parseInt(gpvisita);

						if(glfavor == glvisita){partidosempatados++; puntos++;}
						else if(glfavor > glvisita){partidosganados++;puntos+=3;}
						else if(glfavor < glvisita){partidosperdidos++;}

					  
					}
					
					const allowedOrigins = ['http://localhost:8080', 'https://expressmundial.onrender.com'];
					const origin = req.headers.origin;
					if (allowedOrigins.includes(origin)) {
						res.header('Access-Control-Allow-Origin', origin);
					}
					res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
					res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
					
					res.json({'data':data, 
							'goles': {
								'golesafavor': golesafavor,
								'golesencontra': golesencontra,
								'golespenallocal': golespenallocal,
								'golespenalvisita': golespenalvisita,
								'partidosganados': partidosganados,
								'partidosperdidos': partidosperdidos,
								'partidosempatados': partidosempatados,
								'puntos':puntos,
								'pais':pais,
								'paisvisita':paisvisita
							}
						});
				}
			);
			
		}catch(error){
			res.status(500).json({ error: 'Error al filtro partidos' });
		}
	});
};


export function partidos_get(req, res){

	basedatos.connectDB().then(() => {
		try{			
			buscar_partidos().then(
				data => {
					res.json(data);
				}
			);
		}catch(error){
			res.status(500).json({ error: 'Error al get partidos' });
		}
	});
};


export function partidos_get_linea(req, res){

	basedatos.connectDB().then(() => {
		try{			
			buscar_partidos().then(
				data => {
					res.json(data);
				}
			);
		}catch(error){
			res.status(500).json({ error: 'Error al get partidos' });
		}
	});
};