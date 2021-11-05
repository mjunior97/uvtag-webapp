// Instanciando a conexão com o banco

const db = require('./db')
// const Sequelize = require('sequelize')

const Leitura = db.sequelize.define('leitura', {
    id:{
        type: db.Sequelize.INTEGER,
        primaryKey: true, // limite de caracteres
    },
    controlador_id: {
        type: db.Sequelize.STRING
    },
    dispositivo_id: {
        type: db.Sequelize.STRING
    },
    indice_uv: {
        type: db.Sequelize.STRING
    },
    dispositivo_distancia: {
        type: db.Sequelize.STRING
    }
})

// Criando a tabela

// Post.sync({force:true})

module.exports = Leitura