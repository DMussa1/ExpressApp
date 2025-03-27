// Importamos las librerías requeridas
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

// Inicializamos la aplicación Express
const app = express();

// Creamos un parser para application/json
const jsonParser = bodyParser.json();

// Abre la base de datos de SQLite
let db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado a la base de datos SQLite.');

    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Tabla tareas creada o ya existente.');
        }
    });
});

// Endpoint para agregar una tarea
app.post('/agrega_todo', jsonParser, function (req, res) {
    const { todo } = req.body;
   
    if (!todo) {
        res.status(400).json({ message: 'Falta información necesaria' });
        return;
    }

    const created_at = Math.floor(Date.now() / 1000);  // Obtener el Unix timestamp
    const stmt = db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, ?)');
    stmt.run(todo, created_at, function (err) {
        if (err) {
            console.error("Error:", err);
            res.status(500).json({ message: 'Error al agregar tarea' });
            return;
        }
        res.status(201).json({ message: 'Tarea agregada', id: this.lastID });
    });

    stmt.finalize();
});

// Endpoint para listar todas las tareas
app.get('/listar_todos', (req, res) => {
    db.all('SELECT * FROM todos', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(200).json({ tareas: rows });
    });
});

// Endpoint de prueba para verificar que el servidor está corriendo
app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.json({ status: 'ok' });
});

// Endpoint de login (de ejemplo)
app.post('/login', jsonParser, function (req, res) {
    console.log(req.body);
    res.setHeader('Content-Type', 'application/json');
    res.json({ status: 'ok' });
});

// Corremos el servidor en el puerto 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Aplicación corriendo en http://localhost:${port}`);
});