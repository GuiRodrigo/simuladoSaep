const Sequelize = require("sequelize");
const database = require("../db");
const Curso = require("./Curso");
const Usuario = require("./Usuario");

const Inscricao = database.define(
  "inscricao",
  {
    id_inscricao: {
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
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = Inscricao;
