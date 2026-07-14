import { MongoClient } from 'mongodb';
import { config } from 'dotenv';


config(); 
// Configuración de MongoDB
const url = process.env.DB_URI;
const client = new MongoClient(url);
const dbName = 'mundial';
let db = null;


export async function connectDB() {
    try {
        await client.connect();
        // console.log(' Conectado con éxito a MongoDB');
        db = client.db(dbName);
    } catch (error) {
        console.error(' Error al conectar a MongoDB : ', error);
        process.exit(1); // Detener la app si no hay base de datos
    }
};

export {db};
