import React, { useState, useEffect } from "react";
import axios from "axios";

import "./ComentariosModal.css";

export function ComentariosModal({ cursoId, onClose, user }) {
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [edicaoComentarioId, setEdicaoComentarioId] = useState("");

  useEffect(() => {
    // Busca os comentários do curso
    axios
      .get(`http://localhost:3001/api/comentarios?cursoId=${cursoId}`)
      .then((response) => setComentarios(response.data))
      .catch((error) => console.error("Erro ao carregar comentários:", error));
  }, [cursoId]);

  const handleAdicionarComentario = () => {
    if (novoComentario.trim() === "") return;

    axios
      .post("http://localhost:3001/api/comentarios", {
        cursoId,
        mensagem: novoComentario,
        userId: user.id,
      })
      .then((response) => {
        setComentarios([...comentarios, response.data]);
        setNovoComentario("");
      })
      .catch((error) => console.error("Erro ao adicionar comentário:", error));
  };

  const handleEditarComentario = (comentario) => {
    setNovoComentario(comentario.mensagem);
    setEdicaoComentarioId(comentario.id_comentario); // Guardar ID para identificar o comentário a ser editado
  };

  const handleSalvarEdicao = () => {
    axios
      .put(`http://localhost:3001/api/comentarios/${edicaoComentarioId}`, {
        usuarioId: user.id,
        mensagem: novoComentario,
      })
      .then((response) => {
        setComentarios((prevComentarios) =>
          prevComentarios.map((comentario) =>
            comentario.id_comentario === edicaoComentarioId
              ? response.data
              : comentario
          )
        );
        setNovoComentario("");
        setEdicaoComentarioId(null); // Resetar estado de edição
      })
      .catch((error) => console.error("Erro ao editar comentário:", error));
  };

  const handleDeletarComentario = (id_comentario) => {
    axios
      .delete(`http://localhost:3001/api/comentarios/${id_comentario}`, {
        data: { usuarioId: user.id },
      })
      .then(() => {
        setComentarios((prevComentarios) =>
          prevComentarios.filter(
            (comentario) => comentario.id_comentario !== id_comentario
          )
        );
      })
      .catch((error) => console.error("Erro ao deletar comentário:", error));
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Comentários</h2>
        <div className="comentarios-list">
          {comentarios.map((comentario) => {
            return (
              <div key={comentario.id_comentario} className="comentario">
                <div className="comentarioText">
                  <p>
                    <strong>{comentario.nome_usuario}</strong>
                  </p>{" "}
                  <p>{comentario.mensagem}</p>
                </div>
                {user?.id === comentario.usuario_id && ( // Apenas o autor pode editar/deletar
                  <div>
                    <img
                      src="./lapis_editar.svg"
                      alt="editar"
                      onClick={() => handleEditarComentario(comentario)}
                    />
                    <img
                      src="./lixeira_deletar.svg"
                      alt="deletar"
                      onClick={() =>
                        handleDeletarComentario(comentario.id_comentario)
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="novo-comentario">
          <textarea
            className="input"
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            placeholder="Adicione um comentário..."
          />
          <button
            onClick={
              edicaoComentarioId
                ? handleSalvarEdicao
                : handleAdicionarComentario
            }
          >
            {edicaoComentarioId ? "Atualizar" : "Enviar"}
          </button>

          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
