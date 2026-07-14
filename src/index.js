import express from 'express';
import { config } from 'dotenv';

config(); 
const app = express();

const PORT = process.env.PORT;


// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
  res.send('Servidor simple');
});

app.get('/about', (req, res) => {
  res.send('About page');
});

app.listen(PORT, () => {
	console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});