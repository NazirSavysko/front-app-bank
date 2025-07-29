import { useState } from 'react';
import './App.css';
import { LoginForm } from './log-in/LoginForm';
import { RegisterForm } from './RegisterForm';
import { VerifyEmailForm } from './VerifyEmailForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { UserDashboard } from './UserDashboard';

/**
 * Top level application component. Controls navigation between login,
 * registration, email verification and password reset screens.
 * After a successful login redirects user by role.
 */
function App() {
    type Page = 'login' | 'register' | 'verify' | 'forgot' | 'user' | 'admin';
    const [page, setPage] = useState<Page>('login');
    const [emailToVerify, setEmailToVerify] = useState('');

    /** Redirect based on role from backend */
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
            {page === 'user' && <UserDashboard />}
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
