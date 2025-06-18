'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface Student {
  id: number;
  name: string;
  email: string;
  department: string | null;
}

interface Formation {
  id: number;
  title: string;
  theme: string;
}

interface Favorite {
  id: string;
  userId: string;
  formationId: string;
}

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [allFormations, setAllFormations] = useState<Formation[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [selectedFormation, setSelectedFormation] = useState('');
  const [userId] = useState('user1'); // Hardcoded for demo; replace with auth

  useEffect(() => {
    axios.get(`http://localhost:8000/students/${id}`).then(res => setStudent(res.data));
    axios.get(`http://localhost:8000/students/${id}/formations`).then(res => setFormations(res.data));
    axios.get(`http://localhost:8000/formations/`).then(res => setAllFormations(res.data));
    axios.get(`http://localhost:8008/api/favorites/user/${userId}`).then(res => setFavorites(res.data));
  }, [id]);

  const handleEnroll = async () => {
    try {
      await axios.post(`http://localhost:8000/students/${id}/enroll/${selectedFormation}`);
      const res = await axios.get(`http://localhost:8000/students/${id}/formations`);
      setFormations(res.data);
      alert('Enrolled successfully');
    } catch (error: any) {
      alert('Error enrolling: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleAddFavorite = async () => {
    try {
      await axios.post('http://localhost:8008/api/favorites', { userId, formationId: selectedFormation });
      const res = await axios.get(`http://localhost:8008/api/favorites/user/${userId}`);
      setFavorites(res.data);
      alert('Added to favorites');
    } catch (error: any) {
      alert('Error adding favorite: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (!student) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{student.name}</h2>
      <p>Email: {student.email}</p>
      <p>Department: {student.department}</p>
      <h3 className="text-xl font-bold mt-4">Enrolled Formations</h3>
      <ul>
        {formations.map(f => (
          <li key={f.id} className="p-2 border-b">{f.title} - {f.theme}</li>
        ))}
      </ul>
      <div className="mt-4">
        <select
          value={selectedFormation}
          onChange={(e) => setSelectedFormation(e.target.value)}
          className="border p-2 mr-2"
        >
          <option value="">Select Formation to Enroll</option>
          {allFormations.map(f => (
            <option key={f.id} value={f.id}>{f.title}</option>
          ))}
        </select>
        <button onClick={handleEnroll} className="bg-blue-600 text-white p-2 rounded">Enroll</button>
        <button onClick={handleAddFavorite} className="bg-purple-600 text-white p-2 rounded ml-2">Add to Favorites</button>
      </div>
      <h3 className="text-xl font-bold mt-4">Favorites</h3>
      <ul>
        {favorites.map(f => (
          <li key={f.id} className="p-2 border-b">
            Formation ID: {f.formationId}
            <button
              onClick={async () => {
                try {
                  await axios.delete(`http://localhost:8008/api/favorites/${f.id}`);
                  setFavorites(favorites.filter(fav => fav.id !== f.id));
                  alert('Removed from favorites');
                } catch (error: any) {
                  alert('Error removing favorite: ' + (error.response?.data?.detail || error.message));
                }
              }}
              className="ml-2 text-red-600 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}