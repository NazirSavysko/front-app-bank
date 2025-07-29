import React, { useState } from "react";
import "./log-in/LoginForm.css";

/**
 * Password reset form. Users provide the email associated with their account and
 * a new password. On success the parent may navigate back to login.
 */
export interface ForgotPasswordFormProps {
    /** Navigate back to the login screen */
    onBack: () => void;
    /** Called when password has been successfully reset */
    onReset: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack, onReset }) => {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        try {
            const baseUrl: string = (import.meta as any).env.VITE_API_URL || "";
            const res = await fetch(`${baseUrl}customers/forgot-password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: newPassword }),
            });
            if (!res.ok) {
                let data: any = {};
                try {
                    data = await res.json();
                } catch {
                    // ignore parse errors
                }
                const msg = data.message || "Не вдалося скинути пароль";
                setError(`❌ ${msg}`);
                setLoading(false);
                return;
            }
            setMessage("✅ Пароль успішно змінено, тепер ви можете увійти");
            // Notify parent after short delay
            setTimeout(() => {
                onReset();
            }, 1500);
        } catch {
            setError("❌ Помилка з’єднання з сервером");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleReset}>
                <div className="avatar-icon" />
                <h2>Відновлення пароля</h2>
                {error && <div className="error-text">{error}</div>}
                {message && <div className="error-text" style={{ color: '#4caf50', borderColor: '#4caf50' }}>{message}</div>}
                <input
                    type="email"
                    placeholder="Електронна пошта"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Новий пароль (8-15 символів)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Зміна..." : "ЗМІНИТИ ПАРОЛЬ"}
                </button>
                <div className="register-link">
                    <a
                        onClick={(e) => {
                            e.preventDefault();
                            onBack();
                        }}
                    >
                        Назад
                    </a>
                </div>
            </form>
        </div>
    );
};
