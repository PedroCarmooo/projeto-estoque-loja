const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  preco: { type: Number, required: true },
  quantidade: { type: Number, required: true },
  tamanho: { type: String, required: true },
  cor: { type: String, required: false }
});

// Adiciona um campo virtual "id" para substituir "_id" no front-end
produtoSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Produto', produtoSchema);
