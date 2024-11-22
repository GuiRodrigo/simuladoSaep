import React, { useState } from "react";
import axios from "axios";
import "./LoginModal.css";

export function LoginModal({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:3001/api/login", {
        email,
        senha,
      });

      console.log(response);

      if (response.data.success) {
        onLoginSuccess(response.data.user);
        onClose();
      }
    } catch (err) {
      setError("Credenciais inválidas ou erro no servidor.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button onClick={handleLogin}>Entrar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}
