import * as basedatos from './basedatos.js';

async function filtra_paises(filtro){
	const paises = basedatos.db.collection('paises').find(filtro).toArray();
	return paises;
}

async function  buscar_paises(){
	try {
		const paises = basedatos.db.collection('paises').find({}).toArray();
		return paises;
	}catch(error){		
		return 'Error : ' + error;
	}
}

export function paises_filtro(req, res){

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
			
			filtra_paises(filtro).then(
				data => {
					res.json(data);
				}
			);
		}catch(error){
			res.status(500).json({ error: 'Error al obtener paises', mensaje: error });
		}
	});
};

export function paises_get(req, res){

	basedatos.connectDB().then(() => {
		try{			
			buscar_paises().then(				
				data => {
					res.json(data);
				}
			);
		}catch(error){
			res.status(500).json({ error: 'Error al obtener paises' });
		}
	});
};