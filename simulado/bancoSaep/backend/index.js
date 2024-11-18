const express = require('express');
const cors = require('cors');
const database = require('./db');
const Usuario = require('./models/Usuario');
const Comentario = require('./models/Comentario');
const Curso = require('./models/Curso');
const Inscricao = require('./models/Inscricao');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

Curso.hasMany(Comentario, { foreignKey: 'curso_id' });
Comentario.belongsTo(Curso, { foreignKey: 'curso_id' });

Curso.hasMany(Inscricao, { foreignKey: 'curso_id' });
Inscricao.belongsTo(Curso, { foreignKey: 'curso_id' });

Usuario.hasMany(Inscricao, { foreignKey: 'usuario_id' });
Inscricao.belongsTo(Usuario, { foreignKey: 'usuario_id' });

(async () => {
    try {
        await database.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');

        await database.sync();

        app.get('/api/usuarios', async (req, res) => {
            const listaUsuarios = await Usuario.findAll();
            res.json(listaUsuarios);
        });

        app.post('/api/login', async (req, res) => {
            const { nickname, senha } = req.body;

            try {
                const usuario = await Usuario.findOne({ where: { nickname, senha } });

                if (usuario) {
                    res.json({
                        success: true,
                        user: {
                            nome: usuario.nome,
                            id: usuario.id,
                            perfilImg: usuario.foto // Substitua pela URL real da imagem do perfil no banco
                        }
                    });
                } else {
                    res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
                }
            } catch (error) {
                console.error('Erro no login:', error);
                res.status(500).json({ success: false, message: 'Erro no servidor.' });
            }
        });

        app.get('/api/cursos', async (req, res) => {
            const { usuarioId } = req.query;

            try {
                const cursos = await Curso.findAll({
                    include: [
                        {
                            model: Comentario,
                            attributes: [], // Apenas para contagem
                        },
                        {
                            model: Inscricao,
                            attributes: ['usuario_id'],
                        },
                    ],
                });

                const cursosDetalhados = cursos.map(curso => {
                    // Garantir que "inscricoes" é uma array válida
                    const inscricoes = curso.inscricaos || [];
                    const isInscrito = inscricoes.some(inscricao => inscricao.usuario_id === parseInt(usuarioId));
                    return {
                        id: curso.id_curso,
                        nome: curso.nome_curso,
                        foto: curso.foto,
                        instituicao: curso.instituicao,
                        qtdComentarios: curso.comentarios?.length || 0,
                        qtdInscricoes: inscricoes.length,
                        isInscrito,
                    };
                });

                res.json(cursosDetalhados);
            } catch (error) {
                console.error('Erro ao buscar cursos:', error);
                res.status(500).json({ message: 'Erro ao buscar cursos.' });
            }
        });


        app.post('/api/inscricao', async (req, res) => {
            const { usuarioId, cursoId } = req.body;

            if (!usuarioId || !cursoId) {
                return res.status(400).json({ message: 'Os campos usuarioId e cursoId são obrigatórios.' });
            }

            try {
                const inscricaoExistente = await Inscricao.findOne({
                    where: { usuario_id: usuarioId, curso_id: cursoId },
                });

                if (inscricaoExistente) {
                    return res.status(400).json({ message: 'Usuário já inscrito neste curso.' });
                }

                await Inscricao.create({ usuario_id: usuarioId, curso_id: cursoId });
                res.status(201).json({ message: 'Inscrição realizada com sucesso!' });
            } catch (error) {
                console.error('Erro ao realizar inscrição:', error);
                res.status(500).json({ message: 'Erro ao realizar inscrição.' });
            }
        });

        app.get('/api/comentarios', async (req, res) => {
            const { cursoId } = req.query;

            try {
                const comentarios = await Comentario.findAll({
                    where: { curso_id: cursoId },
                    attributes: ['id_comentario', 'mensagem'],
                });

                res.json(comentarios);
            } catch (error) {
                console.error('Erro ao buscar comentários:', error);
                res.status(500).json({ message: 'Erro ao buscar comentários.' });
            }
        });

        app.post('/api/comentarios', async (req, res) => {
            const { cursoId, mensagem } = req.body;

            if (!cursoId || !mensagem) {
                return res.status(400).json({ message: 'Os campos cursoId e mensagem são obrigatórios.' });
            }

            try {
                const novoComentario = await Comentario.create({
                    curso_id: cursoId,
                    mensagem,
                });

                res.status(201).json(novoComentario);
            } catch (error) {
                console.error('Erro ao adicionar comentário:', error);
                res.status(500).json({ message: 'Erro ao adicionar comentário.' });
            }
        });


        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });

    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
    }
})();