// Carrega variáveis do .env
require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Modelos do MongoDB
const Usuario = require('./models/Usuario');
const Produto = require('./models/Produto');

// Porta do ambiente (Render) ou local
const PORT = process.env.PORT || 3000;

// Verifica se a variável de conexão está presente
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("❌ ERRO: MONGO_URI não está definida no arquivo .env");
  process.exit(1);
}

// Conexão com MongoDB Atlas
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("🟢 Conectado ao MongoDB Atlas");
}).catch((err) => {
  console.error("🔴 Erro ao conectar ao MongoDB:", err);
});

// Middleware para tratar JSON e arquivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// =======================
// ROTAS DE AUTENTICAÇÃO
// =======================

app.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;
  try {
    const encontrado = await Usuario.findOne({ usuario, senha });
    if (encontrado) {
      res.json({ sucesso: true });
    } else {
      res.json({ sucesso: false, mensagem: 'Usuário ou senha incorretos' });
    }
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor' });
  }
});

app.post('/registrar', async (req, res) => {
  const { usuario, senha } = req.body;
  try {
    const jaExiste = await Usuario.findOne({ usuario });
    if (jaExiste) {
      return res.status(400).json({ sucesso: false, mensagem: 'Usuário já existe' });
    }

    const novoUsuario = new Usuario({ usuario, senha });
    await novoUsuario.save();
    res.status(201).json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao registrar' });
  }
});

// ==================
// ROTAS DE ESTOQUE
// ==================

app.get('/api/estoque', async (req, res) => {
  try {
    const produtos = await Produto.find();
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro ao buscar produtos' });
  }
});

app.post('/api/estoque', async (req, res) => {
  const { nome, preco, quantidade, tamanho, cor } = req.body;
  try {
    const novoProduto = new Produto({ nome, preco, quantidade, tamanho, cor });
    await novoProduto.save();
    res.status(201).json(novoProduto);
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro ao adicionar produto' });
  }
});

app.put('/api/estoque/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, preco, quantidade, tamanho, cor } = req.body;
  try {
    await Produto.findByIdAndUpdate(id, { nome, preco, quantidade, tamanho, cor });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro ao atualizar produto' });
  }
});

app.delete('/api/estoque/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Produto.findByIdAndDelete(id);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro ao deletar produto' });
  }
});

// =======================
// INICIA O SERVIDOR
// =======================

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
