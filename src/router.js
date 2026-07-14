import express from 'express';
import { config } from 'dotenv';
import { usersRouter } from './rutas/usuarios';

config(); 
const app = express();
const PORT = process.env.PORT;

app.use('/users', usersRouter);

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
  res.send('Router index express');
});

app.get('/about', (req, res) => {
  res.send('About page');
});

app.all('/4', (req, res) => {
  res.status(404).send('404 - Page not found');
});


app.listen(PORT, () => {
	console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});
