'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface Formation {
  id: number;
  title: string;
  theme: string;
}

interface Student {
  id: number;
  name: string;
  formations?: number[];
}

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const router = useRouter();

  useEffect(() => {
    const studentData = localStorage.getItem('student');
    if (!studentData) {
      router.push('/login');
      return;
    }
    
    setStudent(JSON.parse(studentData));
    fetchFormations();
  }, [router]);

  const fetchFormations = async () => {
    try {
      const res = await axios.get('http://localhost:8000/formations/');
      setFormations(res.data);
    } catch (err) {
      toast.error('Failed to load formations');
    }
  };

  const handleEnroll = async (formationId: number) => {
    if (!student) return;
    
    try {
      await axios.post(`http://localhost:8000/students/${student.id}/enroll/${formationId}`);
      toast.success('Enrolled successfully!');
      
      // Update local student data
      const updatedStudent = {
        ...student,
        formations: [...(student.formations || []), formationId]
      };
      localStorage.setItem('student', JSON.stringify(updatedStudent));
      setStudent(updatedStudent);
    } catch (err) {
      toast.error('Enrollment failed');
    }
  };

  if (!student) return <div>Loading...</div>;

  return (
    <>
      <div className="container">
        <h1>Available Formations</h1>
        <div className="grid">
          {formations.map(formation => (
            <div key={formation.id} className="card">
              <h2>{formation.title}</h2>
              <p>{formation.theme}</p>
              <button
                onClick={() => handleEnroll(formation.id)}
                disabled={student.formations?.includes(formation.id)}
                className={student.formations?.includes(formation.id) ? 'btn disabled' : 'btn'}
              >
                {student.formations?.includes(formation.id) ? 'Already Enrolled' : 'Enroll Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: 2rem auto;
          padding: 0 1rem;
        }

        h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1rem 1.25rem;
          box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        p {
          color: #555;
          margin-bottom: 1.25rem;
          flex-grow: 1;
        }

        .btn {
          padding: 0.5rem 1rem;
          font-size: 1rem;
          background-color: #2563eb; /* blue-600 */
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          align-self: flex-start;
        }

        .btn:hover:not(.disabled) {
          background-color: #1d4ed8; /* blue-700 */
        }

        .btn.disabled {
          background-color: #cbd5e1; /* gray-300 */
          cursor: not-allowed;
          color: #6b7280; /* gray-500 */
        }
      `}</style>
    </>
  );
}
