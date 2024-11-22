import { useState } from "react";
import "./Postagem.css";

export function Postagem({
  user,
  curso,
  imgCurso,
  qtdInscricacao,
  qtdMensagem,
  isInscrito,
  onInscrever,
  onVerComentarios,
  openLogin,
}) {
  return (
    <div className="postagem">
      <div className="maria">
        <span>{curso}</span>
        <span> PUC-MG</span>
      </div>
      <img className="imgCurso" src={`./${imgCurso}`} alt="curso" />

      <div className="joao">
        <div className="lucas">
          <img
            src={
              isInscrito && user
                ? "./flecha_cima_cheia.svg"
                : "./flecha_cima_vazia.svg"
            }
            alt="Inscrever-se"
            onClick={!user ? openLogin : onInscrever}
            style={{ cursor: "pointer" }}
          />
          <span>{qtdInscricacao}</span>
        </div>
        <div className="lucas">
          <img
            src="./chat.svg"
            alt="Comentários"
            onClick={!user ? openLogin : onVerComentarios}
            style={{ cursor: "pointer" }}
          />
          <span>{qtdMensagem}</span>
        </div>
      </div>
    </div>
  );
}
