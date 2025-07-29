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
    const [step, setStep] = useState<'email' | 'code' | 'reset'>('email');
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    /**
     * Step 1: send reset code to the provided email
     */
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        try {
            const res = await fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({} as { message?: string }));
                const msg = body.message || 'Не вдалося надіслати код';
                setError(`❌ ${msg}`);
                setLoading(false);
                return;
            }
            setMessage('Код відправлено на вашу пошту');
            setStep('code');
        } catch {
            setError('❌ Помилка з’єднання з сервером');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Resend the verification code without resetting the step; used in the code step
     */
    const resendCode = async () => {
        setError("");
        setMessage("");
        setLoading(true);
        try {
            const res = await fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) {
                setError('❌ Не вдалося надіслати код ще раз');
            } else {
                setMessage('Код було повторно надіслано на пошту');
            }
        } catch {
            setError('❌ Помилка з’єднання з сервером');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Step 2: verify the code entered by the user
     */
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        try {
            const res = await fetch('/api/email/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({} as { message?: string }));
                const msg = body.message || 'Код підтвердження електронної пошти недійсний';
                setError(`❌ ${msg}`);
                setLoading(false);
                return;
            }
            setStep('reset');
        } catch {
            setError('❌ Помилка з’єднання з сервером');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Step 3: set a new password
     */
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        if (newPassword !== confirmPassword) {
            setError('❌ Паролі не співпадають');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/customers/forgot-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: newPassword }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({} as { message?: string }));
                const msg = body.message || 'Не вдалося скинути пароль';
                setError(`❌ ${msg}`);
                setLoading(false);
                return;
            }
            setMessage('✅ Пароль успішно змінено, тепер ви можете увійти');
            setTimeout(() => {
                onReset();
            }, 1500);
        } catch {
            setError('❌ Помилка з’єднання з сервером');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {step === 'email' && (
                <form className="login-form" onSubmit={handleSendCode}>
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
                    <button type="submit" disabled={loading}>
                        {loading ? 'Надсилання...' : 'Надіслати код'}
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
            )}
            {step === 'code' && (
                <form className="login-form" onSubmit={handleVerifyCode}>
                    <div className="avatar-icon" />
                    <h2>Підтвердження коду</h2>
                    {error && <div className="error-text">{error}</div>}
                    {message && <div className="error-text" style={{ color: '#4caf50', borderColor: '#4caf50' }}>{message}</div>}
                    <p style={{ color: '#cccccc', textAlign: 'center', marginBottom: '15px' }}>
                        Введіть код, що надійшов на {email}
                    </p>
                    <input
                        type="text"
                        placeholder="Код підтвердження"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Перевірка...' : 'Підтвердити'}
                    </button>
                    <div className="actions" style={{ justifyContent: 'space-between' }}>
                        <a
                            onClick={(e) => {
                                e.preventDefault();
                                resendCode();
                            }}
                        >
                            Надіслати ще раз
                        </a>
                        <a
                            onClick={(e) => {
                                e.preventDefault();
                                setStep('email');
                                setMessage('');
                            }}
                        >
                            Назад
                        </a>
                    </div>
                </form>
            )}
            {step === 'reset' && (
                <form className="login-form" onSubmit={handleResetPassword}>
                    <div className="avatar-icon" />
                    <h2>Новий пароль</h2>
                    {error && <div className="error-text">{error}</div>}
                    {message && <div className="error-text" style={{ color: '#4caf50', borderColor: '#4caf50' }}>{message}</div>}
                    <input
                        type="password"
                        placeholder="Новий пароль"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Підтвердьте новий пароль"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Зміна...' : 'Змінити пароль'}
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
            )}
        </div>
    );
};
