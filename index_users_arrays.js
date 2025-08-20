const express = require("express");
const dotenv = require('dotenv')
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;

const encryptPassword = (password) => {
  const hmac = crypto.createHmac('sha256', SECRET_KEY)
  hmac.update(password);
  return hmac.digest('hex');
}

let users = [
  { id: uuidv4(), name: 'Juan Perez', email: 'juan.perez@example.com', password: encryptPassword('claveJuan') },
  { id: uuidv4(), name: 'Ana Garcia', email: 'ana.garcia@example.com', password: encryptPassword('claveAna') },
  { id: uuidv4(), name: 'Luis Martinez', email: 'luis.martinez@example.com', password: encryptPassword('claveLuis') },
]

app.get('/users', (req, res) => {
  res.json(users);
})

app.get('/users/:id', (req, res) => {
  const userId = req.params.id;

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

  const existingUser = users.find(user => user.email === req.body.email);

  if (existingUser) {
    return res.status(400).json({
      message: 'Ese usuarios con ese correo ya existe'
    })
  }

  const newUser = {
    id: uuidv4(),
    name: req.body.name,
    email: req.body.email,
    password: encryptPassword(req.body.password)
  }

  if (!newUser.name || !newUser.email) {
    return res.status(400).json({
      message: 'El nombre y el email son requeridos'
    })
  }

  users.push(newUser);

  res.status(201).json({
    data: newUser,
    message: 'Usuario creado correctamente'
  })
})

app.put('/users/:id', (req, res) => {
  const user = users.find(user => user.id === req.params.id); 

  if (!user) {
    return res.status(404).json({
      message: 'Usuario no encontrado'
    })
  }

  const { name, email } = req.body;

  if (email && email !== user.email) {
    const emailExists = users.some(user => user.email === email);
    if (emailExists) {
      return res.status(400).json({
        message: 'El correo ya está en uso'
      })
    }
  }

  if (name) {
    user.name = name;
  }

  if (email) {
    user.email = email;
  }

  res.json({
    data: user,
    message: 'Usuario actualizado correctamente'
  })
})

app.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  const userIndex = users.findIndex(user => user.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({
      message: 'Usuario no encontrado'
    })
  }

  users.splice(userIndex, 1);

  res.status(204).send();
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})