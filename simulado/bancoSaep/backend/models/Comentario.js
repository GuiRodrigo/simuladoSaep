const Sequelize = require("sequelize");
const database = require("../db");
const Curso = require("./Curso");
const Usuario = require("./Usuario");

const Comentario = database.define(
  "comentario",
  {
    id_comentario: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    curso_id: {
      type: Sequelize.INTEGER,
      references: {
        model: Curso,
        key: "id_curso",
      },
    },
    usuario_id: {
      type: Sequelize.INTEGER,
      references: {
        model: Usuario,
        key: "id",
      },
    },
    mensagem: {
      type: Sequelize.TEXT,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = Comentario;
