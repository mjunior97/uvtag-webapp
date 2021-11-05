// Instanciando a conexão com o banco

const db = require('./db')
// const Sequelize = require('sequelize')

const Monitor = db.sequelize.define('tabela_monitore', {
    id_leitura:{
        type: db.Sequelize.INTEGER,
        primaryKey: true
    },
    id_usuario:{
        type: db.Sequelize.INTEGER
    },
    controlador: {
        type: db.Sequelize.STRING
    },
    dispositivo: {
        type: db.Sequelize.STRING
    },
    indice:{
        type: db.Sequelize.INTEGER
    },
    dose:{
        type: db.Sequelize.INTEGER
    },
    distancia:{
        type: db.Sequelize.STRING
    },
    data: {
        type: db.Sequelize.STRING
    },
    hora: {
        type: db.Sequelize.STRING
    },
    timestamp: {
        type: db.Sequelize.DATE
    },
},{timestamps: false})

// Criando a tabela

// Post.sync({force:true})

module.exports = Monitor