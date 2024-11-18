import './Perfil.css';

export function Perfil({ perfilImg, perfilName, perfilInsc, onLoginClick, onLogoutClick, isLoggedIn }) {
    return (
        <div className='perfil'>
            <button
                className='button'
                onClick={isLoggedIn ? onLogoutClick : onLoginClick} // Muda a ação com base no estado
            >
                {isLoggedIn ? 'Sair' : 'Entrar'} {/* Muda o texto */}
            </button>
            <img className='perfilImg' src={perfilImg} alt="logo da empresa" />
            <span className='perfilName'>
                {perfilName}
            </span>
            <span className='perfilInsc'>
                Inscrições: {perfilInsc}
            </span>
        </div>
    );
}
