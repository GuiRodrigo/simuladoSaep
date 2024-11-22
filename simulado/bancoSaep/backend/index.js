const express = require("express");
const cors = require("cors");
const database = require("./db");
const { Sequelize } = require("sequelize"); // Adicionado
const Usuario = require("./models/Usuario");
const Comentario = require("./models/Comentario");
const Curso = require("./models/Curso");
const Inscricao = require("./models/Inscricao");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

Curso.hasMany(Comentario, { foreignKey: "curso_id" });
Comentario.belongsTo(Curso, { foreignKey: "curso_id" });

Curso.hasMany(Inscricao, { foreignKey: "curso_id" });
Inscricao.belongsTo(Curso, { foreignKey: "curso_id" });

Usuario.hasMany(Inscricao, { foreignKey: "usuario_id" });
Inscricao.belongsTo(Usuario, { foreignKey: "usuario_id" });

Usuario.hasMany(Comentario, { foreignKey: "usuario_id" });
Comentario.belongsTo(Usuario, { foreignKey: "usuario_id" });

(async () => {
  try {
    await database.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso.");

    await database.sync();

    app.get("/api/usuarios", async (req, res) => {
      const listaUsuarios = await Usuario.findAll();
      res.json(listaUsuarios);
    });

    app.post("/api/login", async (req, res) => {
      const { email, senha } = req.body;

      try {
        const usuario = await Usuario.findOne({ where: { email, senha } });

        if (usuario) {
          res.json({
            success: true,
            user: {
              nome: usuario.nome,
              id: usuario.id,
              email: usuario.email,
              nickname: usuario.nickname,
              perfilImg: usuario.foto, // Substitua pela URL real da imagem do perfil no banco
            },
          });
        } else {
          res
            .status(401)
            .json({ success: false, message: "Credenciais inválidas." });
        }
      } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ success: false, message: "Erro no servidor." });
      }
    });

    app.get("/api/inscricoes/usuario/:usuarioId", async (req, res) => {
      const { usuarioId } = req.params;

      try {
        const qtdInscricoes = await Inscricao.count({
          where: { usuario_id: usuarioId },
        });

        res.json({ qtdInscricoes });
      } catch (error) {
        console.error("Erro ao buscar inscrições:", error);
        res.status(500).json({ message: "Erro ao buscar inscrições." });
      }
    });

    app.get("/api/cursos", async (req, res) => {
      const { usuarioId } = req.query;

      try {
        const cursos = await Curso.findAll({
          attributes: {
            include: [
              [
                Sequelize.fn(
                  "COUNT",
                  Sequelize.col("comentarios.id_comentario")
                ),
                "qtdComentarios",
              ],
            ],
          },
          include: [
            {
              model: Comentario,
              attributes: [], // Não trazer atributos individuais
            },
            {
              model: Inscricao,
              attributes: ["usuario_id"],
            },
          ],
          group: [
            "curso.id_curso",
            "inscricaos.id_inscricao",
            "inscricaos.usuario_id",
          ], // Adicionado agrupamento correto
        });

        const cursosDetalhados = cursos.map((curso) => {
          const inscricoes = curso.inscricaos || [];
          const isInscrito = inscricoes.some(
            (inscricao) => inscricao.usuario_id === parseInt(usuarioId)
          );

          return {
            id: curso.id_curso,
            nome: curso.nome_curso,
            foto: curso.foto,
            instituicao: curso.instituicao,
            qtdComentarios: parseInt(curso.getDataValue("qtdComentarios")) || 0, // Parseando o valor do COUNT
            qtdInscricoes: inscricoes.length,
            isInscrito,
          };
        });

        res.json(cursosDetalhados);
      } catch (error) {
        console.error("Erro ao buscar cursos:", error);
        res.status(500).json({ message: "Erro ao buscar cursos." });
      }
    });

    app.post("/api/inscricao", async (req, res) => {
      const { usuarioId, cursoId } = req.body;

      if (!usuarioId || !cursoId) {
        return res
          .status(400)
          .json({ message: "Os campos usuarioId e cursoId são obrigatórios." });
      }

      try {
        const inscricaoExistente = await Inscricao.findOne({
          where: { usuario_id: usuarioId, curso_id: cursoId },
        });

        if (inscricaoExistente) {
          return res
            .status(400)
            .json({ message: "Usuário já inscrito neste curso." });
        }

        await Inscricao.create({ usuario_id: usuarioId, curso_id: cursoId });
        res.status(201).json({ message: "Inscrição realizada com sucesso!" });
      } catch (error) {
        console.error("Erro ao realizar inscrição:", error);
        res.status(500).json({ message: "Erro ao realizar inscrição." });
      }
    });

    app.get("/api/comentarios", async (req, res) => {
      const { cursoId } = req.query;

      try {
        const comentarios = await Comentario.findAll({
          where: { curso_id: cursoId },
          include: [
            {
              model: Usuario,
              attributes: ["nome"], // Inclui apenas o nome do usuário
            },
          ],
          attributes: ["id_comentario", "mensagem", "usuario_id"],
        });

        const comentariosComDetalhes = comentarios.map((comentario) => ({
          id_comentario: comentario.id_comentario,
          mensagem: comentario.mensagem,
          nome_usuario: comentario.usuario
            ? comentario.usuario.nome
            : "Usuário desconhecido", // Nome ou fallback // Nome do usuário

          usuario_id: comentario.usuario_id ? comentario.usuario_id : null,
        }));

        res.json(comentariosComDetalhes);
      } catch (error) {
        console.error("Erro ao buscar comentários:", error);
        res.status(500).json({ message: "Erro ao buscar comentários." });
      }
    });

    app.post("/api/comentarios", async (req, res) => {
      const { cursoId, mensagem, userId } = req.body;

      if (!cursoId || !mensagem) {
        return res
          .status(400)
          .json({ message: "Os campos cursoId e mensagem são obrigatórios." });
      }

      try {
        const novoComentario = await Comentario.create({
          curso_id: cursoId,
          mensagem,
          usuario_id: userId,
        });

        res.status(201).json(novoComentario);
      } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
        res.status(500).json({ message: "Erro ao adicionar comentário." });
      }
    });

    app.delete("/api/comentarios/:id", async (req, res) => {
      const { id } = req.params;
      const { usuarioId } = req.body;

      try {
        const comentario = await Comentario.findByPk(id);

        if (!comentario) {
          return res
            .status(404)
            .json({ message: "Comentário não encontrado." });
        }

        if (comentario.usuario_id !== usuarioId) {
          return res.status(403).json({
            message: "Você não tem permissão para deletar este comentário.",
          });
        }

        await comentario.destroy();
        res.json({ message: "Comentário deletado com sucesso!" });
      } catch (error) {
        console.error("Erro ao deletar comentário:", error);
        res.status(500).json({ message: "Erro ao deletar comentário." });
      }
    });

    app.put("/api/comentarios/:id", async (req, res) => {
      const { id } = req.params;
      const { usuarioId, mensagem } = req.body;

      try {
        const comentario = await Comentario.findByPk(id);

        if (!comentario) {
          return res
            .status(404)
            .json({ message: "Comentário não encontrado." });
        }

        if (comentario.usuario_id !== usuarioId) {
          return res.status(403).json({
            message: "Você não tem permissão para editar este comentário.",
          });
        }

        comentario.mensagem = mensagem;
        await comentario.save();

        res.json(comentario);
      } catch (error) {
        console.error("Erro ao editar comentário:", error);
        res.status(500).json({ message: "Erro ao editar comentário." });
      }
    });

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
  }
})();
