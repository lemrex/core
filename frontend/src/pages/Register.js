// src/pages/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [tenantName, setTenantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://ralf.com.ng/api/register', { tenantName, email, password });
      toast.success('Registration successful. Please login.');
      navigate('/');
    } catch (err) {
      toast.error('Registration failed');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Tenant Registration</h2>
      <form onSubmit={handleRegister} className="mx-auto col-md-4 mt-4">
        <div className="mb-3">
          <label>Tenant Name</label>
          <input type="text" className="form-control" required value={tenantName} onChange={(e) => setTenantName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input type="email" className="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input type="password" className="form-control" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-success w-100">Register</button>
        <div className="text-center mt-3">
          <Link to="/">Already have an account? Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
