import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './ComentariosModal.css'

export function ComentariosModal({ cursoId, onClose }) {
    const [comentarios, setComentarios] = useState([]);
    const [novoComentario, setNovoComentario] = useState('');

    useEffect(() => {
        // Busca os comentários do curso
        axios.get(`http://localhost:3001/api/comentarios?cursoId=${cursoId}`)
            .then(response => setComentarios(response.data))
            .catch(error => console.error('Erro ao carregar comentários:', error));
    }, [cursoId]);

    const handleAdicionarComentario = () => {
        if (novoComentario.trim() === '') return;

        axios.post('http://localhost:3001/api/comentarios', {
            cursoId,
            mensagem: novoComentario,
        })
            .then(response => {
                setComentarios([...comentarios, response.data]);
                setNovoComentario('');
            })
            .catch(error => console.error('Erro ao adicionar comentário:', error));
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Comentários</h2>
                <button onClick={onClose}>Fechar</button>
                <div className="comentarios-list">
                    {comentarios.map(comentario => (
                        <div key={comentario.id_comentario} className="comentario">
                            <p>{comentario.mensagem}</p>
                        </div>
                    ))}
                </div>
                <div className="novo-comentario">
                    <textarea
                        value={novoComentario}
                        onChange={(e) => setNovoComentario(e.target.value)}
                        placeholder="Adicione um comentário..."
                    />
                    <button onClick={handleAdicionarComentario}>Enviar</button>
                </div>
            </div>
        </div>
    );
}
