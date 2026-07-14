import express from 'express';
import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

config(); 
// Configuración de MongoDB
const url = process.env.DB_URI;
const client = new MongoClient(url);
const dbName = 'mundial';
let db;


const app = express();

const PORT = process.env.PORT;

async function connectDB() {
    try {
        await client.connect();
        console.log(' Conectado con éxito a MongoDB');
        db = client.db(dbName);
    } catch (error) {
        console.error(' Error al conectar a MongoDB:', error);
        process.exit(1); // Detener la app si no hay base de datos
    }
}

////////////////////////////////////////////////

app.get('/grupos', async (req, res) => {
    try {
        const grupos = await db.collection('grupos').find({}).toArray();
        res.json(grupos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener grupos' });
    }
});

////////////////////////////////////////////////

app.get('/paises', async (req, res) => {
    try {
        const paises = await db.collection('paises').find({}).toArray();
        res.json(paises);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener paises' });
    }
});

app.get('/paises/:id', async (req, res) => {
    try {
		
		const  params  = req.params;
		const id = parseInt(params.id);
		console.log('paises . id', id);
		
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

app.get('/partidos/orden/:pais/:ord', async (req, res) => {
    try {
		
		const  params  = req.params;
		const ord = parseInt(params.ord);
		const pais = params.pais;
		
        const partidos = await db.collection('partidos').find({paislocal: pais}).sort({ numeral: ord }).toArray();
        res.json(partidos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener partidos' });
    }
});

app.get('/partidos', async (req, res) => {
    try {
        const partidos = await db.collection('partidos').find({}).toArray();
        res.json(partidos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener partidos' });
    }
});

app.get('/partidos/:numeral', async (req, res) => {
    try {
		const  params  = req.params;
		const numeral = parseInt(params.numeral);
		
		const partidos = await db.collection('partidos').find({'numeral':numeral}).toArray();
        res.json(partidos);
		
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener partidos' });
    }
});

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
  res.send('Servidor simple');
});

app.get('/about', (req, res) => {
  res.send('About page');
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
    });
});
