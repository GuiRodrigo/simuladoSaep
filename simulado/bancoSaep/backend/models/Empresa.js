const Sequelize = require('sequelize')
const database = require('../db')

const Empresa = database.define('empresa', {
    id_empresa: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    nome: {
        type: Sequelize.TEXT
    },
    logo: {
        type: Sequelize.TEXT
    },
}, {
    freezeTableName: true,
    timestamps: false
})

module.exports = Empresa