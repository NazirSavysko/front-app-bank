import { useState } from 'react';
import './App.css';
import { LoginForm } from './log-in/LoginForm';
import { RegisterForm } from './RegisterForm';
import { VerifyEmailForm } from './VerifyEmailForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

/**
 * Top level application component. Controls navigation between login,
 * registration, email verification and password reset screens. After a
 * successful login the user is greeted with a simple welcome message.
 */
function App() {
    type Page = 'login' | 'register' | 'verify' | 'forgot' | 'welcome';
    const [page, setPage] = useState<Page>('login');
    const [emailToVerify, setEmailToVerify] = useState('');

    const handleLoginSuccess = () => {
        setPage('welcome');
    };

    const handleRegisterComplete = (email: string) => {
        setEmailToVerify(email);
        setPage('verify');
    };

    const handleVerificationSuccess = () => {
        // After verifying email, direct the user back to the login form
        setPage('login');
    };

    const handleResetSuccess = () => {
        // After resetting password, return to login
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
            {page === 'welcome' && (
                <div className="welcome-message">
                    <h1>👋 Вітаємо! Ви увійшли в систему</h1>
                </div>
            )}
        </>
    );
}

export default App;
