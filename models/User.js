const { Model } = require('sequelize/types');
const db = require('./db')

class User extends Model{}
User.init({
    id: db.Sequelize.INTEGER,
    email: db.Sequelize.STRING,
    senha: db.Sequelize.STRING
}), {modelname: 'User'}

module.exports = User