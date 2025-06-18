'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.get(`http://localhost:8000/students/?email=${email}&name=${name}`);
      if (res.data.length > 0) {
        localStorage.setItem('student', JSON.stringify(res.data[0]));
        router.push('/formations');
        toast.success('Login successful!');
      } else {
        toast.error('Student not found');
      }
    } catch (err) {
      toast.error('Login failed');
    }
  };

  return (
    <>
      <div className="login-container">
        <h1 className="login-title">Student Login</h1>
        <form onSubmit={handleLogin} className="login-form">
          <div>
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
        <p className="login-link">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>

      <style jsx>{`
        .login-container {
          max-width: 400px;
          margin: 3rem auto;
          padding: 2rem;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .login-title {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .login-form label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .login-form input {
          width: 100%;
          padding: 0.6rem;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 16px;
          box-sizing: border-box;
        }

        .login-form input:focus {
          border-color: #007bff;
          outline: none;
        }

        .login-form button {
          width: 100%;
          background-color: #007bff;
          color: white;
          padding: 0.75rem;
          font-size: 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .login-form button:hover {
          background-color: #0056b3;
        }

        .login-link {
          margin-top: 1rem;
          text-align: center;
          font-size: 14px;
        }

        .login-link a {
          color: #007bff;
          text-decoration: none;
        }

        .login-link a:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
