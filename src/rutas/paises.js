import * as basedatos from './basedatos.js';


const allowedOrigins = ['http://localhost:8080', 'https://expressmundial.onrender.com'];

function AgregarHeaders(req, res){
	const origin = req.headers.origin;
	if (allowedOrigins.includes(origin)) {
		res.header('Access-Control-Allow-Origin', origin);
	}
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}



async function filtra_paises(filtro){
	const paises = basedatos.db.collection('paises').find(filtro).toArray();
	return paises;
}

async function filtra_paises_diez(filtro){
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

function AgregarHeadersTotal() {

  let headers = new Headers();

  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');

  headers.append('Access-Control-Allow-Origin', 'http://localhost:8080');
  headers.append('Access-Control-Allow-Credentials', 'true');

  headers.append('GET', 'POST', 'OPTIONS');

  let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdWJyb2wiLCJyb2xlIjoidXNlciIsInVzZXIiOiJqb3NlIiwiZW1haWwiOiJqb3NlQHJ1dGFzLm5ldCIsImZlY2hhYWx0YSI6IjIwMjYtMDctMjVUMjI6Mjg6MTcuNTkwWiIsImlhdCI6MTc4NTE2NjYzOCwiZXhwIjoxNzg1MTc1NjM4fQ.iIz7fCZjZnyrtt8Jj8vJA-t4kYRG3DcOP_7XivLQYR0';
  headers.append('Authorization', 'Bearer ' + token);
  
  return headers;

		/*
		fetch(url, { credentials: 'include', method: 'GET',
			headers: AgregarHeaders()}).then(response => response.json()).then(json => console.log(json));
		
		  fetch(url, {
			  //mode: 'no-cors',
			  credentials: 'include',
			  method: 'GET',
			  headers: headers
			})
			.then(response => response.json())
			.then(json => console.log(json))
			.catch(error => console.log('Authorization failed : ' + error.message));
		*/	
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

export function paises_filtro_diez(req, res){
    try {
        
		const params  = req.params;
		let filtro = {'id':1};
		
		if(params.id != undefined){
			const id = parseInt(params.id);
			filtro = {'id':id};
		}
	
		let resultados = [];
		
		filtra_paises(filtro).then(
			data => {
				res.json(data);
			}
		);
		
		//HeadersAuth(req, res);
		const origin = req.headers.origin;
		if (allowedOrigins.includes(origin)) {
			res.header('Access-Control-Allow-Origin', origin);
		}
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		
		//console.log('header', res.header);
		
		res.json(resultados);
		
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener paises' });
    }
	
};

export function paises_get(req, res){

	basedatos.connectDB().then(() => {
		try{			
			buscar_paises().then(				
				data => {
					AgregarHeaders(req, res);
					res.json(data);
				}
			);
		}catch(error){
			res.status(500).json({ error: 'Error al obtener paises' });
		}
	});
};