const express = require('express'); 
const path = require('path');
const fs = require('fs');
const app = express();

// Aceita a porta dinâmica do Render ou usa 3000 localmente
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Caminho para os arquivos
const dadosPath = path.join(__dirname, 'dados.json');
const usuariosPath = path.join(__dirname, 'usuarios.json');

// Utilitários para o estoque
function lerDados() {
  try {
    const data = fs.readFileSync(dadosPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function salvarDados(dados) {
  fs.writeFileSync(dadosPath, JSON.stringify(dados, null, 2));
}

// Utilitários para usuários
function lerUsuarios() {
  try {
    const data = fs.readFileSync(usuariosPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function salvarUsuarios(usuarios) {
  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
}

// Login
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;
  const usuarios = lerUsuarios();
  const encontrado = usuarios.find(u => u.usuario === usuario && u.senha === senha);

  if (encontrado) {
    res.json({ sucesso: true });
  } else {
    res.json({ sucesso: false, mensagem: 'Usuário ou senha incorretos' });
  }
});

// Registro
app.post('/registrar', (req, res) => {
  const { usuario, senha } = req.body;
  const usuarios = lerUsuarios();

  const jaExiste = usuarios.find(u => u.usuario === usuario);
  if (jaExiste) {
    return res.status(400).json({ sucesso: false, mensagem: 'Usuário já existe' });
  }

  usuarios.push({ usuario, senha });
  salvarUsuarios(usuarios);
  res.status(201).json({ sucesso: true });
});

// Listar produtos
app.get('/api/estoque', (req, res) => {
  const produtos = lerDados();
  res.json(produtos);
});

// Adicionar produto (agora inclui tamanho)
app.post('/api/estoque', (req, res) => {
  const produtos = lerDados();
  const { nome, preco, quantidade, tamanho } = req.body;
  const novoProduto = {
    id: Date.now().toString(),
    nome,
    preco,
    quantidade,
    tamanho
  };
  produtos.push(novoProduto);
  salvarDados(produtos);
  res.status(201).json(novoProduto);
});

// Editar produto (agora inclui tamanho)
app.put('/api/estoque/:id', (req, res) => {
  let produtos = lerDados();
  const id = req.params.id;
  const { nome, preco, quantidade, tamanho } = req.body;
  produtos = produtos.map(prod =>
    prod.id === id ? { id, nome, preco, quantidade, tamanho } : prod
  );
  salvarDados(produtos);
  res.sendStatus(200);
});

// Remover produto
app.delete('/api/estoque/:id', (req, res) => {
  let produtos = lerDados();
  const id = req.params.id;
  produtos = produtos.filter(prod => prod.id !== id);
  salvarDados(produtos);
  res.sendStatus(200);
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
