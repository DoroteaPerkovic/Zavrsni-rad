import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        navigate("/home");
      } else {
        alert(data.message || "Neispravno korisničko ime ili lozinka");
      }
    } catch (err) {
      console.error(err);
      alert("Greška prilikom prijave");
    }
  };

  const handleNvigateRegister = async () => {
    navigate("/register");
  };

  const handleGuest = async () => {
    try {
      const response = await fetch("http://localhost:5000/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        navigate("/home");
      } else {
        alert(data.message || "Greška prilikom guest prijave");
      }
    } catch (err) {
      console.error(err);
      alert("Greška prilikom guest prijave");
    }
  };

  return (
    <div>
      <div className="loginForm">
        <input
          placeholder="Korisničko ime ili Email"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="password"
          placeholder="lozinka"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Prijava</button>

        <p>
          Nemate račun?
          <button onClick={handleNvigateRegister}>Registrirajte se</button>
        </p>

        <button onClick={handleGuest}>Prijavi se kao Guest</button>
      </div>
    </div>
  );
}

export default Login;
