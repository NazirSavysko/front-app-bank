import { useState } from 'react';
import './App.css';
import { LoginForm } from './log-in/LoginForm';
import { RegisterForm } from './RegisterForm';
import { VerifyEmailForm } from './VerifyEmailForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

/**
 * Top level application component. Controls navigation between login,
 * registration, email verification and password reset screens.
 * After a successful login redirects user by role.
 */
function App() {
    type Page = 'login' | 'register' | 'verify' | 'forgot' | 'user' | 'admin';
    const [page, setPage] = useState<Page>('login');
    const [emailToVerify, setEmailToVerify] = useState('');

    /**
     * After a successful login we receive the user's role from the login form.
     * Depending on the role we redirect to different dashboards.
     */
    const handleLoginSuccess = (role: string) => {
        if (role && role.toUpperCase().includes('ADMIN')) {
            setPage('admin');
        } else {
            setPage('user');
        }
    };

    const handleRegisterComplete = (email: string) => {
        setEmailToVerify(email);
        setPage('verify');
    };

    const handleVerificationSuccess = () => {
        setPage('login');
    };

    const handleResetSuccess = () => {
        setPage('login');
    };

    return (
        <>
            {page === 'login' && (
                <LoginForm
                    onLogin={handleLoginSuccess}
                    onRegisterLink={() => setPage('register')}
                    onForgotLink={() => setPage('forgot')}
                />
            )}
            {page === 'register' && (
                <RegisterForm
                    onRegisterComplete={handleRegisterComplete}
                    onBack={() => setPage('login')}
                />
            )}
            {page === 'verify' && (
                <VerifyEmailForm
                    email={emailToVerify}
                    onVerified={handleVerificationSuccess}
                    onBack={() => setPage('login')}
                />
            )}
            {page === 'forgot' && (
                <ForgotPasswordForm
                    onBack={() => setPage('login')}
                    onReset={handleResetSuccess}
                />
            )}
            {page === 'user' && (
                <div className="welcome-message">
                    <h1>👋 Вітаємо! Ви увійшли як користувач</h1>
                </div>
            )}
            {page === 'admin' && (
                <div className="welcome-message">
                    <h1>🔐 Вітаємо! Ви увійшли як адміністратор</h1>
                    <p>Тут може бути адміністративна панель.</p>
                </div>
            )}
        </>
    );
}

export default App;
