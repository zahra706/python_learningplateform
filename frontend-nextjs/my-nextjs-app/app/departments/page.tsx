'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Department {
  id: number;
  name: string;
}

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/departments/');
        setDepartments(response.data);
      } catch (err) {
        setError('Failed to load departments');
        console.error('Error details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/departments/', form);
      setDepartments([...departments, response.data]);
      setForm({ name: '' });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add department');
      console.error('Error details:', err.response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Departments</h2>
      
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded shadow">
        <input
          type="text"
          placeholder="Department Name"
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value })}
          className="border p-2 mr-2"
          required
        />
        <button 
          type="submit" 
          className="bg-blue-600 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Department'}
        </button>
      </form>

      <ul>
        {departments.map(dep => (
          <li key={dep.id} className="p-2 border-b">{dep.name}</li>
        ))}
      </ul>
    </div>
  );
}