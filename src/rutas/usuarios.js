import { MongoClient } from 'mongodb';
import { config } from 'dotenv';


config(); 
// Configuración de MongoDB
const url = process.env.DB_URI;
const client = new MongoClient(url);
const dbName = 'mundial';
let db;

async function connectDB() {
    try {
        await client.connect();
        // console.log(' Conectado con éxito a MongoDB');
        db = client.db(dbName);
    } catch (error) {
        console.error(' Error al conectar a MongoDB:', error);
        process.exit(1); // Detener la app si no hay base de datos
    }
}

async function  buscar_paises(){
	try {
		const paises = db.collection('paises').find({}).toArray();
		return paises;
	}catch(error){		
		return 'Error : ' + error;
	}
}

export function paises_get(req, res){

	connectDB().then(() => {
		try{
			
			buscar_paises().then(
				data => {
					//console.log(' data:', data);
					res.json(data);
				}
			);			
		}catch(error){
			res.status(500).json({ error: 'Error al obtener paises' });
		}
	});
};

export function usuarios_get(req, res){
	  res.send('Users home page');
	};


export function add(a, b) { return a + b;}