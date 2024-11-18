// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// function App() {
//     const [usuarios, setUsuarios] = useState([]);

//     useEffect(() => {
//         // Faz uma requisição GET para o backend para buscar a lista de usuários
//         axios.get('http://localhost:3001/api/usuarios')
//             .then(response => setUsuarios(response.data))
//             .catch(error => console.error("Erro ao buscar usuários:", error));
//     }, []);

//     return (
//         <div className="App">
//             <h1>Lista de Usuários</h1>
//             {usuarios.map((usuario) => (
//                 <p key={usuario.idUsuario}>{usuario.nome}</p>
//             ))}
//         </div>
//     );
// }

// export default App;
import React, { useState, useEffect } from 'react';
import { Perfil } from './Perfil';
import { Postagem } from './Postagem';
import { LoginModal } from './LoginModal';
import { ComentariosModal } from './ComentariosModal';
import axios from 'axios';

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [cursos, setCursos] = useState([]);
    const [isComentarioslOpen, setIsComentariosOpen] = useState(false);
    const [cursoSelecionado, setCursoSelecionado] = useState(null);

    const handleLoginSuccess = (userData) => {
        setUser(userData); // Define o usuário logado
    };

    const handleLogout = () => {
        setUser(null); // Remove o usuário logado
    };

    const handleVerComentarios = (cursoId) => {
        setCursoSelecionado(cursoId);
        setIsComentariosOpen(true);
    };

    const handleInscricao = (cursoId) => {
        if (!user || !user.id) {
            console.error('Usuário não está logado ou ID do usuário está indefinido.');
            alert('Você precisa estar logado para se inscrever.');
            return;
        }

        axios.post('http://localhost:3001/api/inscricao', {
            usuarioId: user.id,
            cursoId: cursoId,
        })
            .then(() => {
                setCursos(prevCursos =>
                    prevCursos.map(curso =>
                        curso.id === cursoId
                            ? { ...curso, isInscrito: true, qtdInscricoes: curso.qtdInscricoes + 1 }
                            : curso
                    )
                );
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    alert(error.response.data.message);
                } else {
                    console.error('Erro ao realizar inscrição:', error);
                }
            });
    };

    // Carregar os cursos do backend
    useEffect(() => {
        axios.get('http://localhost:3001/api/cursos')
            .then(response => { console.log(response.data); setCursos(response.data) })
            .catch(error => console.error('Erro ao carregar cursos:', error));
    }, [user]);

    useEffect(() => {
        if (user) {
            axios.get(`http://localhost:3001/api/cursos?usuarioId=${user.id}`)
                .then(response => setCursos(response.data))
                .catch(error => console.error('Erro ao carregar cursos:', error));
        }
    }, [user]);


    return (
        <div className="App">
            <div className="header">
                <h1>{user ? user.nome : 'FaculHub - O Curso Certo Para Você'}</h1>
                <div className="icons">
                    <img className="iconHeader" src="./instagram.webp" alt="instagram" />
                    <img className="iconHeader" src="./twitter.png" alt="twitter" />
                </div>
            </div>
            <div className="container">
                <Perfil
                    perfilImg={user ? user.perfilImg : 'logo_faculhub.png'}
                    perfilInsc="7"
                    perfilName={user ? user.nome : 'FaculHub'}
                    isLoggedIn={!!user}
                    onLoginClick={() => setIsModalOpen(true)}
                    onLogoutClick={handleLogout}
                />
                <div className="main">
                    <div className="titleDiv">
                        <h2 className="title">Cursos</h2>
                    </div>
                    {cursos.map(curso => (
                        <Postagem
                            user={user}
                            openLogin={() => setIsModalOpen(true)}
                            key={curso.id}
                            curso={curso.nome}
                            imgCurso={curso.foto}
                            qtdInscricacao={curso.qtdInscricoes}
                            qtdMensagem={curso.qtdComentarios}
                            isInscrito={curso.isInscrito}
                            onInscrever={() => handleInscricao(curso.id)}
                            onVerComentarios={() => handleVerComentarios(curso.id)}
                        />
                    ))}
                </div>
            </div>
            {isModalOpen && (
                <LoginModal
                    onClose={() => setIsModalOpen(false)}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}

            {isComentarioslOpen && (
                <ComentariosModal
                    cursoId={cursoSelecionado}
                    onClose={() => setIsComentariosOpen(false)}
                />
            )}
        </div>
    );
}

export default App;
