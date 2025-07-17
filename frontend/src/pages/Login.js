"use client"

import { useState } from "react"
import "./Login.css"
import { toast } from "react-toastify"

const Login = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState("login")
  const [formData, setFormData] = useState({
    tenantName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error("Please enter valid credentials")
      return
    }

    if (activeTab === "register") {
      if (!formData.tenantName) {
        toast.error("Tenant name is required")
        return
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match")
        return
      }
    }

    const endpoint =
      activeTab === "login"
        ? "http://ralf.com.ng/api/auth"
        : "http://ralf.com.ng/api/register"

    try {
      const payload =
        activeTab === "login"
          ? {
              email: formData.email,
              password: formData.password,
            }
          : {
              tenantName: formData.tenantName,
              email: formData.email,
              password: formData.password,
            }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed")
      }

      if (data.token) {
        localStorage.setItem("token", data.token)
        onLogin()
      } else {
        toast.error("No token received from server")
      }
    } catch (error) {
      console.error("Auth error:", error)
      toast.error("Login/Register failed: " + error.message)
    }
  }

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <div className="logo">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21h18l-9-18-9 18z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <h1 className="login-title">FinTech Pro</h1>
          <p className="login-subtitle">Advanced financial management platform for modern businesses and individuals</p>
        </div>

        <div className="login-main">
          <div className="features-grid">
            {/* Features omitted for brevity */}
          </div>

          <div className="auth-form-container">
            <div className="auth-card">
              <div className="auth-header">
                <h2>Welcome Back</h2>
                <p>Sign in to your account or create a new one</p>
              </div>

              <div className="auth-tabs">
                <button
                  className={`tab-button ${activeTab === "login" ? "active" : ""}`}
                  onClick={() => setActiveTab("login")}
                >
                  Login
                </button>
                <button
                  className={`tab-button ${activeTab === "register" ? "active" : ""}`}
                  onClick={() => setActiveTab("register")}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                {activeTab === "register" && (
                  <div className="form-group">
                    <label htmlFor="tenantName">Tenant Name</label>
                    <input
                      type="text"
                      id="tenantName"
                      name="tenantName"
                      value={formData.tenantName}
                      onChange={handleInputChange}
                      placeholder="Enter your tenant name"
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={activeTab === "login" ? "Enter your password" : "Create a password"}
                    required
                  />
                </div>

                {activeTab === "register" && (
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                )}

                <button type="submit" className={`submit-button ${activeTab}`}>
                  {activeTab === "login" ? "Sign In" : "Create Account"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
