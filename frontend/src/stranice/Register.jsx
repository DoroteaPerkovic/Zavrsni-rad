import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Lozinke se ne poklapaju");
      return;
    }

    const response = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        username,
        password,
      }),
    });
    const data = await response.json();
    if (data.success){
      navigate("/");
    }else{
      setError(data.message);
    }

  };

  const handlePrijava = async () => {
    navigate("/");
  };

  return (
    <div>
      <input
        placeholder="Korisničko ime"
        onChange={(e) => setUsername(e.target.value)}
      />

      <input type="Email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />

      <input
        type="password"
        placeholder="Lozinka"
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Potvrdi lozinku"
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button onClick={handleRegister}>Registriraj se</button>

      <p>
        Imate račun?
        <button onClick={handlePrijava}>Prijavite se</button>
      </p>
      <p>{error}</p>
    </div>
  );
}

export default Register;
