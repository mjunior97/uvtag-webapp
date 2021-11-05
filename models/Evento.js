// Instanciando a conexão com o banco

const db = require('./db')
// const Sequelize = require('sequelize')

const Evento = db.sequelize.define('tabela_evento', {
    id:{
        type: db.Sequelize.INTEGER,
        primaryKey: true, // limite de caracteres
    },
    id_controlador: {
        type: db.Sequelize.INTEGER
    },
    id_usuario: {
        type: db.Sequelize.INTEGER
    },
    controlador: {
        type: db.Sequelize.STRING
    },
    evento: {
        type: db.Sequelize.STRING
    },
    data: {
        type: db.Sequelize.STRING
    },
    hora: {
        type: db.Sequelize.STRING
    }
})

// Criando a tabela

// Post.sync({force:true})

module.exports = Evento