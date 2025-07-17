"use client"

import { useEffect, useState, useCallback } from "react"
import { useNavigate } from 'react-router-dom';
import "./Dashboard.css"
import { toast } from "react-toastify";
import axios from 'axios';


const Dashboard = ({ onLogout }) => {
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({ total_credit: 0, total_debit: 0, total_balance: 0 })
  const [loading, setLoading] = useState(false)
  const [newAccountName, setNewAccountName] = useState("")
  const [newAccountBalance, setNewAccountBalance] = useState("")
  const [selectedAccount, setSelectedAccount] = useState("")
  const [transactionAmount, setTransactionAmount] = useState("")
  const [transactionType, setTransactionType] = useState("")
  const navigate = useNavigate();

  const token = localStorage.getItem('token');


  const fetchAllData = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [accountRes, transactionRes, summaryRes] = await Promise.all([
        axios.get('http://ralf.com.ng/api/accounts', { headers }),
        axios.get('http://ralf.com.ng/api/transaction/recent', { headers }),
        axios.get('http://ralf.com.ng/api/summary', { headers })
      ]);

      setAccounts(accountRes.data.accounts || accountRes.data || []);
      setTransactions(transactionRes.data.transactions || transactionRes.data || []);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
      fetchAllData();
    }, [fetchAllData]);

  // const handleLogout = () => {
  //   localStorage.removeItem('token');
  //   // Trigger auth state update
  //   window.dispatchEvent(new Event('authChange'));
  //   navigate('/');
  // };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleCreateAccount = async (e) => {
    e.preventDefault()
    if (!newAccountName || !newAccountBalance) return

    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("No authentication token found")
      onLogout()
      return
    }

    try {
      const response = await fetch("http://ralf.com.ng/api/accounts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newAccountName,
          balance: Number.parseFloat(newAccountBalance),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create account")
      }

      setNewAccountName("")
      setNewAccountBalance("")
      toast.success("Account created successfully!")
      await fetchAllData()
    } catch (error) {
      console.error("Error creating account:", error)
      toast.error("Failed to create account. Please try again.")
    }
  }

  const handleTransaction = async (e) => {
    e.preventDefault()
    if (!selectedAccount || !transactionAmount || !transactionType) return

    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("No authentication token found")
      onLogout()
      return
    }

    try {
      const endpoint =
        transactionType === "credit"
          ? "http://ralf.com.ng/api/transaction/credit"
          : "http://ralf.com.ng/api/transaction/debit"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_id: selectedAccount,
          amount: Number.parseFloat(transactionAmount),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process transaction")
      }

      setSelectedAccount("")
      setTransactionAmount("")
      setTransactionType("")
      toast.success("Transaction processed successfully!")
      await fetchAllData()
    } catch (error) {
      console.error("Error processing transaction:", error)
      toast.error("Failed to process transaction. Please try again.")
    }
  }

  if (loading && accounts.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your financial dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Financial Dashboard</h1>
              <p>Manage your accounts and transactions with ease</p>
            </div>
            <button onClick={onLogout} className="logout-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="16,17 21,12 16,7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="21"
                  y1="12"
                  x2="9"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card balance">
            <div className="card-content">
              <div className="card-info">
                <p className="card-label">Total Balance</p>
                <p className="card-value">{formatCurrency(summary.total_balance)}</p>
              </div>
              <div className="card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="summary-card credit">
            <div className="card-content">
              <div className="card-info">
                <p className="card-label">Total Credits</p>
                <p className="card-value">{formatCurrency(summary.total_credit)}</p>
              </div>
              <div className="card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline
                    points="22,7 13.5,15.5 8.5,10.5 2,17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="16,7 22,7 22,13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="summary-card debit">
            <div className="card-content">
              <div className="card-info">
                <p className="card-label">Total Debits</p>
                <p className="card-value">{formatCurrency(summary.total_debit)}</p>
              </div>
              <div className="card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline
                    points="22,17 13.5,8.5 8.5,13.5 2,7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="16,17 22,17 22,11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-main">
          {/* Left Column - Forms */}
          <div className="forms-section">
            {/* Create Account Form */}
            <div className="form-card">
              <div className="form-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="12"
                    y1="8"
                    x2="12"
                    y2="16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="8"
                    y1="12"
                    x2="16"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3>Create New Account</h3>
              </div>
              <form onSubmit={handleCreateAccount} className="form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Account Name</label>
                    <input
                      type="text"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                      placeholder="Enter account name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Initial Balance</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newAccountBalance}
                      onChange={(e) => setNewAccountBalance(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="form-button create">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="12"
                      y1="8"
                      x2="12"
                      y2="16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="8"
                      y1="12"
                      x2="16"
                      y2="12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Create Account
                </button>
              </form>
            </div>

            {/* Transaction Form */}
            <div className="form-card">
              <div className="form-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 1v6m0 6v6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m15.14 7.14-4.28 4.28m0 0L6.58 7.14m4.28 4.28L15.14 16.86"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3>Process Transaction</h3>
              </div>
              <form onSubmit={handleTransaction} className="form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Account</label>
                    <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} required>
                      <option value="">Select account</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name} ({formatCurrency(account.balance)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} required>
                      <option value="">Select type</option>
                      <option value="credit">Credit (+)</option>
                      <option value="debit">Debit (-)</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="form-button transaction">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line
                      x1="7"
                      y1="17"
                      x2="17"
                      y2="7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="7,7 17,7 17,17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Process Transaction
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Accounts */}
          <div className="accounts-section">
            <div className="accounts-card">
              <div className="accounts-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 12h4m4 0h4M6 16h4m4 0h4M6 8h4m4 0h4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3>Your Accounts</h3>
              </div>
              <div className="accounts-list">
                {accounts.length > 0 ? (
                  accounts.map((account) => (
                    <div key={account.id} className="account-item">
                      <div className="account-info">
                        <div className="account-name">{account.name}</div>
                        <div className="account-id">ID: {account.id}</div>
                      </div>
                      <div className="account-balance">{formatCurrency(account.balance)}</div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p>No accounts found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="transactions-section">
          <div className="transactions-card">
            <div className="transactions-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="12,6 12,12 16,14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h3>Recent Transactions</h3>
            </div>
            <div className="transactions-table">
              <table>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Account</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <tr key={transaction.transactionId}>
                        <td className="date-cell">{formatDate(transaction.created_at)}</td>
                        <td className="account-cell">Account {transaction.account_id}</td>
                        <td className="type-cell">
                          <span className={`transaction-badge ${transaction.type}`}>
                            {transaction.type === "credit" ? (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <line
                                  x1="7"
                                  y1="17"
                                  x2="17"
                                  y2="7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <polyline
                                  points="7,7 17,7 17,17"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <line
                                  x1="17"
                                  y1="7"
                                  x2="7"
                                  y2="17"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <polyline
                                  points="17,17 7,17 7,7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                            {transaction.type.toUpperCase()}
                          </span>
                        </td>
                        <td className={`amount-cell ${transaction.type}`}>
                          {transaction.type === "credit" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="reference-cell">{transaction.transactionId}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-transactions">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <polyline
                            points="12,6 12,12 16,14"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p>No transactions found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
