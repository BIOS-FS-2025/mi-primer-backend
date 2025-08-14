const express = require("express");

const app = express();

const PORT = 3000;

app.get('/', (request, response) => {
  response.send('¡Hola Mundo con Express y nodemon!');
})

let users = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
  { id: 2, name: 'Jane Doe', email: 'jane.doe@example.com' },
  { id: 3, name: 'John Smith', email: 'john.smith@example.com' },
]

app.get('/users', (req, res) => {
  res.json(users);
})

app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);

  const userIndex = users.findIndex(user => user.id === userId);
  console.log('Est es el index del usuario solicitado por params', userIndex);

  if (userIndex === -1) {
    return res.status(404).json({
      message: 'Usuario no encontrado'
    })
  }

  const user = users[userIndex]

  res.status(200).json({
    data: user,
    message: 'Usuario encontrado correctamente'
  });
})

app.post('/users', (req, res) => {
  const user = req.body;

  res.status(201).json({
    data: user,
    message: 'Usuario creado correctamente'
  })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})