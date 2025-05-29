const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
  nome: String,
  preco: Number,
  quantidade: Number,
  tamanho: String,
  cor: String
});

module.exports = mongoose.model('Produto', produtoSchema);
