const Sequelize = require('sequelize');
const database = require('../db');
const Curso = require('./Curso');

const Comentario = database.define('comentario', {
    id_comentario: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    curso_id: {
        type: Sequelize.INTEGER,
        references: {
            model: Curso,
            key: 'id_curso',
        },
    },
    mensagem: {
        type: Sequelize.TEXT,
    },
}, {
    freezeTableName: true,
    timestamps: false,
});

module.exports = Comentario;
