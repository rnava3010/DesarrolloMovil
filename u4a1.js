//Importamos las librarías requeridas
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

//Documentación en https://expressjs.com/en/starter/hello-world.html
const app = express();

//Creamos un parser de tipo application/json
//Documentación en https://expressjs.com/en/resources/middleware/body-parser.html
const jsonParser = bodyParser.json();


// Abre la base de datos de SQLite
const db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
        return;
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

//Creamos un endpoint llamado "agrega_todo" que reciba datos usando POST.
app.post('/agrega_todo', jsonParser, (req, res) => {
    //Imprimimos el contenido del campo todo
    const { todo } = req.body;

    if (!todo) {
        return res.status(400).send('Falta información necesaria');
    }

    const stmt = db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, CURRENT_TIMESTAMP)');
    stmt.run(todo, (err) => {
        if (err) {
            console.error("Error ejecutando la declaración:", err);
            return res.status(500).send(err);
        }
        console.log("Insert was successful!");
        stmt.finalize();
        res.status(201).send();
    });
});

// Definimos el endpoint raíz para responder a solicitudes GET
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok' }));
});

// Definimos el endpoint '/todos' para obtener todos los elementos en formato JSON
app.get('/todos', (req, res) => {
    db.all('SELECT * FROM todos ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send(err);
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(rows);
    });
});

// Iniciamos el servidor en el puerto 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Application running at http://localhost:${port}`);
});
