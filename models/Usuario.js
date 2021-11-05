// Instanciando a conexão com o banco

const db = require('./db')
// const Sequelize = require('sequelize')

const Usuario = db.sequelize.define('usuario', {
    id:{
        type: db.Sequelize.INTEGER,
        primaryKey: true
    },
    email: {
        type: db.Sequelize.STRING
    },
    nome: {
        type: db.Sequelize.STRING
    },
    senha: {
        type: db.Sequelize.STRING
    }
})

module.exports = Usuario