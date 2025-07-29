import React, { useEffect, useState } from 'react';
import './UserDashboard.css';

interface Account {
    accountNumber: string;
    balance: number;
    currency: string;
    status: string;
    card: {
        cardNumber: string;
        expirationDate: string;
        cvv: string;
    };
    transactions: Transaction[];
    payments: Payment[];
}

interface Transaction {
    sender: { firstName: string; lastName: string };
    receiver: { firstName: string; lastName: string };
    amount: number;
    description: string;
    transactionDate: string;
    transactionType: string;
    currencyCode: string;
    status: string;
}

interface Payment {
    concurrency: string;
    amount: string;
    beneficiaryName: string;
    purpose: string;
}

interface CustomerData {
    accounts: Account[];
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

interface AccountCardProps {
    account: Account;
    onCopy?: (message: string) => void;
}

/**
 * Account card: shows masked/unmasked card number, CVV and account number.
 * Copies numbers to clipboard on click, auto-hides after 5 seconds.
 */
const AccountCard: React.FC<AccountCardProps> = ({ account, onCopy }) => {
    const [showCvv, setShowCvv] = useState(false);
    const [showNumber, setShowNumber] = useState(false);
    const [showAccountNumber, setShowAccountNumber] = useState(false);
    const { card } = account;

    const formatCardNumber = (num: string) => num.replace(/(\d{4})(?=\d)/g, '$1 ');
    const maskCardNumber = (num: string) => `**** **** **** ${num.slice(-4)}`;
    const formatExpDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${month}/${year}`;
    };
    const maskAccountNumber = (num: string) => {
        if (num.length <= 8) return num;
        return `${num.slice(0, 4)}****${num.slice(-4)}`;
    };

    // Effects to auto-hide after 5 seconds
    useEffect(() => {
        if (!showCvv) return;
        const timer = window.setTimeout(() => setShowCvv(false), 5000);
        return () => window.clearTimeout(timer);
    }, [showCvv]);

    useEffect(() => {
        if (!showNumber) return;
        const timer = window.setTimeout(() => setShowNumber(false), 5000);
        return () => window.clearTimeout(timer);
    }, [showNumber]);

    useEffect(() => {
        if (!showAccountNumber) return;
        const timer = window.setTimeout(() => setShowAccountNumber(false), 5000);
        return () => window.clearTimeout(timer);
    }, [showAccountNumber]);

    // Toggle and copy card number
    const handleNumberClick = () => {
        setShowNumber(!showNumber);
        navigator.clipboard.writeText(card.cardNumber)
            .then(() => onCopy?.('Номер картки скопійовано'))
            .catch(() => console.error('Не вдалося скопіювати номер картки'));
    };

    // Toggle and copy account number
    const handleAccountClick = () => {
        setShowAccountNumber(!showAccountNumber);
        navigator.clipboard.writeText(account.accountNumber)
            .then(() => onCopy?.('Номер рахунку скопійовано'))
            .catch(() => console.error('Не вдалося скопіювати номер рахунку'));
    };

    return (
        <div className="account-card">
            <div className="card-display">
                <div className="bank-name">Bank</div>
                <div
                    className="card-number-display"
                    onClick={handleNumberClick}
                >
                    {showNumber ? formatCardNumber(card.cardNumber) : maskCardNumber(card.cardNumber)}
                </div>
                <div className="card-footer">
                    <div style={{ marginLeft: 'auto' }}>
                        <span style={{ fontSize: '8px', display: 'block', opacity: 0.8 }}>VALID THRU</span>
                        <span style={{ fontSize: '14px' }}>{formatExpDate(card.expirationDate)}</span>
                    </div>
                </div>
                <div
                    className="card-cvv-display"
                    onClick={() => setShowCvv(!showCvv)}
                >
                    CVV: {showCvv ? card.cvv : '***'}
                </div>
            </div>
            <div className="card-info">
                <div className="card-balance">Баланс: {account.balance.toLocaleString()} {account.currency}</div>
                <div className="card-status">Статус: {account.status}</div>
                <div
                    className="account-number"
                    onClick={handleAccountClick}
                >
                    Номер рахунку: {showAccountNumber ? account.accountNumber : maskAccountNumber(account.accountNumber)}
                </div>
            </div>
        </div>
    );
};

/**
 * Main User Dashboard component.
 * Manages accounts, transactions with filters, payments, transfers, and profile panel.
 */
export const UserDashboard: React.FC = () => {
    const [customer, setCustomer] = useState<CustomerData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedTab, setSelectedTab] =
        useState<'accounts' | 'transactions' | 'payments' | 'transfers'>('accounts');
    const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [newAccountType, setNewAccountType] = useState('UAH');
    const [accountCreating, setAccountCreating] = useState(false);
    const [accountError, setAccountError] = useState('');
    const [copyMessage, setCopyMessage] = useState('');

    // Filter state
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'sent' | 'received'>('all');

    // Hide copy toast automatically
    useEffect(() => {
        if (!copyMessage) return;
        const timer = setTimeout(() => setCopyMessage(''), 3000);
        return () => clearTimeout(timer);
    }, [copyMessage]);

    // Fetch user data
    const fetchCustomerData = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/customers/customer', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Bearer ${token}` : '',
                },
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({} as { message?: string }));
                const msg = body.message || 'Не вдалося отримати дані користувача';
                setError(`❌ ${msg}`);
                setLoading(false);
                return;
            }
            const data: CustomerData = await res.json();
            setCustomer(data);
            setSelectedAccountIndex(0);
        } catch {
            setError('❌ Помилка з’єднання з сервером');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerData();
    }, []);

    // Create new account
    const handleAddAccount = async () => {
        setAccountCreating(true);
        setAccountError('');
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/accounts/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({ accountType: newAccountType }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({} as { message?: string }));
                const msg = body.message || 'Не вдалося створити рахунок';
                setAccountError(`❌ ${msg}`);
                setAccountCreating(false);
                return;
            }
            setShowAddModal(false);
            await fetchCustomerData();
        } catch {
            setAccountError('❌ Помилка з’єднання з сервером');
        } finally {
            setAccountCreating(false);
        }
    };

    // Render accounts horizontally
    const renderAccounts = () => {
        if (!customer) return null;
        return (
            <div className="accounts-list">
                {customer.accounts.map((acc, idx) => (
                    <div
                        key={idx}
                        className={`account-wrapper ${idx === selectedAccountIndex ? 'selected' : ''}`}
                        onClick={() => setSelectedAccountIndex(idx)}
                    >
                        <AccountCard
                            account={acc}
                            onCopy={(msg) => setCopyMessage(msg)}
                        />
                    </div>
                ))}
                <div className="account-wrapper add-card" onClick={() => setShowAddModal(true)}>
                    <div className="account-card add-account">
                        <div className="plus-icon">+</div>
                        <div>Додати рахунок</div>
                    </div>
                </div>
            </div>
        );
    };

    // Render transactions with date/type filters and account selector
    const renderTransactions = () => {
        if (!customer) return null;
        // Select currently viewed account
        const acc = customer.accounts[selectedAccountIndex];

        // Filter transactions based on date range and type
        let filtered = [...acc.transactions];
        if (filterStartDate) {
            filtered = filtered.filter(tr =>
                new Date(tr.transactionDate) >= new Date(filterStartDate)
            );
        }
        if (filterEndDate) {
            filtered = filtered.filter(tr =>
                new Date(tr.transactionDate) <= new Date(filterEndDate)
            );
        }
        if (filterType !== 'all') {
            filtered = filtered.filter(tr => {
                const isSent =
                    tr.sender.firstName === customer.firstName &&
                    tr.sender.lastName === customer.lastName;
                return filterType === 'sent' ? isSent : !isSent;
            });
        }
        // Sort descending by date
        filtered.sort(
            (a, b) =>
                new Date(b.transactionDate).getTime() -
                new Date(a.transactionDate).getTime()
        );

        return (
            <div className="transactions-list">
                <div className="transactions-filter">
                    {/* New account selector to choose which account to view transactions for */}
                    <select
                        value={selectedAccountIndex}
                        onChange={(e) => setSelectedAccountIndex(Number(e.target.value))}
                    >
                        {customer.accounts.map((acc, idx) => (
                            <option key={idx} value={idx}>
                                {acc.accountNumber.slice(-4)}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                    />
                    <input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                    />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as 'all' | 'sent' | 'received')}
                    >
                        <option value="all">Всі</option>
                        <option value="sent">Витрати</option>
                        <option value="received">Надходження</option>
                    </select>
                </div>
                <div className="account-transactions">
                    <h3>Транзакції для рахунку {acc.accountNumber.slice(-4)}</h3>
                    {filtered.length > 0 ? (
                        <ul>
                            {filtered.map((tr, idx) => (
                                <li key={idx} className="transaction-item">
                                    <span>{new Date(tr.transactionDate).toLocaleString()}</span>
                                    <span>{tr.amount.toLocaleString()} {tr.currencyCode}</span>
                                    <span>{tr.description}</span>
                                    <span>{tr.status}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Немає транзакцій за вибраними параметрами</p>
                    )}
                </div>
            </div>
        );
    };

    // Render payments
    const renderPayments = () => {
        if (!customer) return null;
        const acc = customer.accounts[selectedAccountIndex];
        return (
            <div className="payments-list">
                <div className="account-payments">
                    <h3>Платежі для рахунку {acc.accountNumber.slice(-4)}</h3>
                    {acc.payments.length > 0 ? (
                        <ul>
                            {acc.payments.map((p, idx) => (
                                <li key={idx} className="payment-item">
                                    <span>{p.amount} {p.concurrency}</span>
                                    <span>{p.beneficiaryName}</span>
                                    <span>{p.purpose}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Немає платежів</p>
                    )}
                </div>
            </div>
        );
    };

    // Placeholder for transfers
    const renderTransfers = () => (
        <div className="transfers-placeholder">
            <p>Функція переказів буде доступна незабаром.</p>
        </div>
    );

    return (
        <>
            <header className="top-bar">
                <div
                    className="user-avatar"
                    onClick={() => setShowProfile(!showProfile)}
                >
                    {customer ? `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase() : ''}
                </div>
            </header>

            <div className="dashboard-container">
                <aside className="nav-sidebar">
                    <button className={selectedTab === 'accounts' ? 'active' : ''} onClick={() => setSelectedTab('accounts')}>Акаунти</button>
                    <button className={selectedTab === 'transactions' ? 'active' : ''} onClick={() => setSelectedTab('transactions')}>Транзакції</button>
                    <button className={selectedTab === 'payments' ? 'active' : ''} onClick={() => setSelectedTab('payments')}>Платежі</button>
                    <button className={selectedTab === 'transfers' ? 'active' : ''} onClick={() => setSelectedTab('transfers')}>Перекази</button>
                </aside>
                <main className="content-area">
                    {loading && <p>Завантаження...</p>}
                    {error && <p className="error-text">{error}</p>}
                    {!loading && !error && (
                        <>
                            {selectedTab === 'accounts' && renderAccounts()}
                            {selectedTab === 'transactions' && renderTransactions()}
                            {selectedTab === 'payments' && renderPayments()}
                            {selectedTab === 'transfers' && renderTransfers()}
                        </>
                    )}
                </main>
            </div>

            <div className={`profile-panel ${showProfile ? 'show' : ''}`}>
                <div className="profile-avatar">
                    {customer ? `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase() : ''}
                </div>
                <h3>Мої дані</h3>
                {customer && (
                    <>
                        <p><strong>Ім’я:</strong> {customer.firstName}</p>
                        <p><strong>Прізвище:</strong> {customer.lastName}</p>
                        <p><strong>Email:</strong> {customer.email}</p>
                        <p><strong>Телефон:</strong> {customer.phoneNumber}</p>
                    </>
                )}
                <button className="close-profile" onClick={() => setShowProfile(false)}>Закрити</button>
            </div>

            {/* Toast */}
            {copyMessage && <div className="copy-toast">{copyMessage}</div>}

            {/* Modal for adding account */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="add-account-modal">
                        <h3>Створити рахунок</h3>
                        <label>
                            Тип валюти:
                            <select value={newAccountType} onChange={(e) => setNewAccountType((e.target as HTMLSelectElement).value)}>
                                <option value="UAH">UAH</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </label>
                        {accountError && <p className="error-text">{accountError}</p>}
                        <div className="modal-buttons">
                            <button onClick={handleAddAccount} disabled={accountCreating}>
                                {accountCreating ? 'Створення...' : 'Створити'}
                            </button>
                            <button onClick={() => setShowAddModal(false)}>Скасувати</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
