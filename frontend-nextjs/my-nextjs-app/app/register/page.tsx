'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Department {
  id: number;
  name: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department_id: ''
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const router = useRouter();

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://localhost:8000/departments/');
      setDepartments(res.data);
    } catch (err) {
      toast.error('Failed to load departments');
      console.error('Error fetching departments:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/students/', {
        ...formData,
        department_id: Number(formData.department_id)
      });
      localStorage.setItem('student', JSON.stringify(res.data));
      router.push('/formations');
      toast.success('Registration successful!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed');
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="register-container">
      <h1 className="register-title">Student Registration</h1>
      <form onSubmit={handleRegister} className="register-form">
        <div>
          <label>Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Department</label>
          <select
            value={formData.department_id}
            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Register</button>
      </form>
      <p className="register-link">
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
}