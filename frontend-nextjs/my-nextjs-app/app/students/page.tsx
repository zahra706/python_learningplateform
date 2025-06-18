'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Student {
  id: number;
  name: string;
  email: string;
  department_id: number;
  department: string | null;
}

interface Department {
  id: number;
  name: string;
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({ name: '', email: '', department_id: '' });

  useEffect(() => {
    axios.get('http://localhost:8000/students/').then(res => setStudents(res.data));
    axios.get('http://localhost:8000/departments/').then(res => setDepartments(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/students/', {
        ...form,
        department_id: Number(form.department_id),
      });
      setStudents([...students, { ...form, id: Date.now(), department: departments.find(d => d.id === Number(form.department_id))?.name || null }]);
      setForm({ name: '', email: '', department_id: '' });
      alert('Student added successfully');
    } catch (error: any) {
      alert('Error adding student: ' + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Students</h2>
      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded shadow">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 mr-2"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border p-2 mr-2"
          required
        />
        <select
          value={form.department_id}
          onChange={(e) => setForm({ ...form, department_id: e.target.value })}
          className="border p-2 mr-2"
          required
        >
          <option value="">Select Department</option>
          {departments.map(dep => (
            <option key={dep.id} value={dep.id}>{dep.name}</option>
          ))}
        </select>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Add Student</button>
      </form>
      <ul>
        {students.map(student => (
          <li key={student.id} className="p-2 border-b">
            <a href={`/student/${student.id}`} className="text-blue-600 hover:underline">
              {student.name} ({student.email}) - {student.department}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}