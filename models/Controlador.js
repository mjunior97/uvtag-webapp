// Instanciando a conexão com o banco

const db = require('./db')
// const Sequelize = require('sequelize')

const Controlador = db.sequelize.define('controladore', {
    id:{
        type: db.Sequelize.INTEGER,
        primaryKey: true
    },
    user_id: {
        type: db.Sequelize.INTEGER
    },
    nome: {
        type: db.Sequelize.STRING
    },
    flag_uv: {
        type: db.Sequelize.STRING
    }
})


module.exports = Controlador