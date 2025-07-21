import { useState } from 'react';
import './App.css';
import { LoginForm } from './log-in/LoginForm'; // путь может отличаться

function App() {
    const [loggedIn, setLoggedIn] = useState(false);

    const handleLogin = () => {
        setLoggedIn(true);
    };

    return (
        <>
            {!loggedIn ? (
                <LoginForm onLogin={handleLogin} />
            ) : (
                <div className="welcome-message">
                    <h1>👋 Вітаємо! Ви увійшли в систему</h1>
                </div>
            )}
        </>
    );
}

export default App;
