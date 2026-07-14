import * as basedatos from './basedatos.js';

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

export function partidos_filtro(req, res){

	basedatos.connectDB().then(() => {
		try{
			const  params  = req.params; 
			
			let filtro = {};
			
			if(params.numeral != undefined){
				const numeral = parseInt(params.numeral);
				filtro = {'numeral':numeral};
			}
			
			if(params.pais != undefined){
				const pais = params.pais.trim();
				
				filtro =  { $or: [ 
					{ 'paislocal': { $regex: pais } },
					{ 'paisvisita': { $regex: pais } }
					]
				};
			}
			
			
			
			filtra_partidos(filtro).then(
				data => {
					res.json(data);
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