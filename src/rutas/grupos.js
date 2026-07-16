import * as basedatos from './basedatos.js';

async function filtra_grupos(filtro){
	const grupos = basedatos.db.collection('grupos').find(filtro).toArray();
	return grupos;
}

async function  buscar_grupos(){
	try {
		const grupos = basedatos.db.collection('grupos').find({}).toArray();
		return grupos;
	}catch(error){		
		return 'Error : ' + error;
	}
}

async function actualizar_partido(filtro, actualizacion){
	try { 
		const grupos = basedatos.db.collection('grupos').updateOne(filtro, actualizacion);
		return grupos;
	}catch(error){		
		return {'Error':  error};
	}
}

export function grupo_actualizar(req, res){

	const params = req.params; 	
	let filtro = {id:0};
	let valores = {grupo:''};
	
	if(params.id != undefined){
		const id = parseInt(params.id);
		filtro = {'id':id};
	}
	
	if(params.grupo != undefined){
		const grupo = params.grupo.trim();
		valores = { 'grupo': grupo };
	}
	
			
	basedatos.connectDB().then(() => {
		try{			
			let fecha = new Date();
			valores.ultima_actualizacion = fecha;			
			let actualizacion = {$set: valores };
			
			actualizar_partido(filtro, actualizacion).then(				
				data => {
					res.json(data);
				}
			);
		}catch(error){
			res.status(500).json({ error: 'Error al obtener grupos' });
		}
	});
};

export function grupos_filtro(req, res){

	basedatos.connectDB().then(() => {
		try{			
			const params  = req.params;
			let filtro = {'id':1};
			
			if(params.id != undefined){
				const id = parseInt(params.id);
				filtro = {'id':id};
			}
			
			if(params.pais != undefined){
				const pais = params.pais.trim();
				filtro = { 'pais': { $regex: pais } };
			}
			
			// console.log('id . pais', filtro);
			// let fecha = Date.now();
			//console.log('date', Date(fecha).toString());
			
			filtra_grupos(filtro).then(
				data => {
					res.json(data);
				}
			);
		}catch(error){
			res.status(500).json({ error: 'Error al obtener grupos', mensaje: error });
		}
	});
};

export function grupos_get(req, res){

	basedatos.connectDB().then(() => {
		try{			
			buscar_grupos().then(				
				data => {
					res.json(data);
				}
			);
		}catch(error){
			res.status(500).json({ error: 'Error al obtener grupos' });
		}
	});
};