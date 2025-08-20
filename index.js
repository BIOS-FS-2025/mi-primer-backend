const { PrismaClient } = require("./generated/prisma");
const express = require("express");
const dotenv = require("dotenv");
const crypto = require("crypto");

const prisma = new PrismaClient();

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;

const encryptPassword = (password) => {
  const hmac = crypto.createHmac("sha256", SECRET_KEY);
  hmac.update(password);
  return hmac.digest("hex");
};

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({
      data: users,
      message: "Usuarios obtenidos correctamente",
    });
  } catch (error) {
    console.error("Error al obtener los usuarios:", error); //CloudWatch AWS
    res.status(500).json({
      message: "Error al obtener los usuarios",
    });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    res.status(200).json({
      data: user,
      message: "Usuario encontrado correctamente",
    });
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    res.status(500).json({
      message: "Error al obtener el usuario",
    });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Ese usuario con ese correo ya existe" });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: encryptPassword(password),
      },
    });

    const { password: _, ...userResponse } = newUser;
    res.status(201).json({
      data: userResponse,
      message: "Usuario creado correctamente",
    });
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    res.status(500).json({
      message: "Error al crear el usuario",
    });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password } = req.body;

    const dataToUpdate = {};

    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (password) dataToUpdate.password = encryptPassword(password);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    const { password: _, ...userResponse } = updatedUser;

    res.status(200).json({
      data: userResponse,
      message: 'Usuario actualizado correctamente'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar el usuario'
    })
  }
})

app.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await prisma.user.delete({
      where: { id: userId }
    })

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      })
    }

    res.status(500).json({
      message: 'Error al eliminar el usuario'
    })
  }
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
