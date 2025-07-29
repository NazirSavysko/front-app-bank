import React, { useState } from "react";
import "./LoginForm.css";

/**
 * Login form component. It accepts callbacks for a successful login as well
 * as handlers for navigating to registration and password reset screens.
 */
export interface LoginFormProps {
    /** Called when the user has successfully logged in */
    onLogin: () => void;
    /** Navigate to the registration form */
    onRegisterLink: () => void;
    /** Navigate to the forgot password form */
    onForgotLink: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onRegisterLink, onForgotLink }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            // Use VITE_API_URL to build the endpoint base. Fallback to root if undefined.
            const baseUrl: string = import.meta.env.VITE_API_URL || "";
            const res = await fetch(`${baseUrl}log-in`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Show specific error messages based on backend response
                if (data.message?.includes("Пароль") || data.message?.includes("електронної пошти")) {
                    setError(data.message);
                } else if (data.message?.includes("Некоректний пароль")) {
                    setError("❌ Невірний пароль або пошта");
                } else {
                    setError("❌ Помилка входу");
                }
                return;
            }

            // Save token and role for future requests
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
                    {/* Trigger navigation to forgot password form */}
                    <a
                        onClick={(e) => {
                            e.preventDefault();
                            onForgotLink();
                        }}
                    >
                        Забули пароль?
                    </a>
                </div>

                <button type="submit">УВІЙТИ</button>

                <div className="register-link">
                    <span>Немає акаунту?</span>
                    {/* Trigger navigation to registration form */}
                    <a
                        onClick={(e) => {
                            e.preventDefault();
                            onRegisterLink();
                        }}
                    >
                        Зареєструватися
                    </a>
                </div>
            </form>
        </div>
    );
};
