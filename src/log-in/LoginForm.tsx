import React, { useState } from "react";
import "./LoginForm.css";

export const LoginForm: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`http://localhost:8080/api/v1/log-in`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.message?.includes("Пароль") || data.message?.includes("електронної пошти")) {
                    setError(data.message);
                } else if (data.message?.includes("Некоректний пароль")) {
                    setError("❌ Невірний пароль або пошта");
                } else {
                    setError("❌ Помилка входу");
                }
                return;
            }

            localStorage.setItem("accessToken", data.token);
            localStorage.setItem("role", data.role);
            onLogin();
        } catch {
            setError("❌ Помилка з’єднання з сервером");
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <div className="avatar-icon" />
                <h2>Увійти в акаунт</h2>

                {error && <div className="error-text">{error}</div>}

                <input
                    type="email"
                    placeholder="Електронна пошта"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <div className="actions">
                    <a href="/forgot-password">Забули пароль?</a>
                </div>

                <button type="submit">УВІЙТИ</button>

                <div className="register-link">
                    <span>Немає акаунту?</span>
                    <a href="/register">Зареєструватися</a>
                </div>
            </form>
        </div>
    );
};
