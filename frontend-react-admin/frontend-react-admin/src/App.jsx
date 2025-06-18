import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [students, setStudents] = useState([]);
  const [formations, setFormations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', department_id: '' });
  const [newFormation, setNewFormation] = useState({ title: '', theme: '' });
  const [newDepartment, setNewDepartment] = useState({ name: '' });

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [studentsRes, formationsRes, departmentsRes] = await Promise.all([
          axios.get('http://localhost:8000/students/'),
          axios.get('http://localhost:8000/formations/'),
          axios.get('http://localhost:8000/departments/')
        ]);

        setStudents(studentsRes.data);
        setFormations(formationsRes.data);
        setDepartments(departmentsRes.data);
      } catch (err) {
        const errorMsg = 'Failed to fetch data: ' + err.message;
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const createStudent = () => {
    if (!newStudent.name || !newStudent.email || !newStudent.department_id) {
      toast.error('Please fill in all student fields');
      return;
    }
    axios
      .post('http://localhost:8000/students/', newStudent)
      .then(res => {
        setStudents([...students, res.data]);
        setNewStudent({ name: '', email: '', department_id: '' });
        toast.success('Student created successfully');
      })
      .catch(err => {
        const errorMsg = 'Failed to create student: ' + err.message;
        setError(errorMsg);
        toast.error(errorMsg);
      });
  };

  const createFormation = () => {
    if (!newFormation.title || !newFormation.theme) {
      toast.error('Please fill in all formation fields');
      return;
    }
    axios
      .post('http://localhost:8000/formations/', newFormation)
      .then(res => {
        setFormations([...formations, res.data]);
        setNewFormation({ title: '', theme: '' });
        toast.success('Formation created successfully');
      })
      .catch(err => {
        const errorMsg = 'Failed to create formation: ' + err.message;
        setError(errorMsg);
        toast.error(errorMsg);
      });
  };

  const createDepartment = () => {
    if (!newDepartment.name) {
      toast.error('Please enter department name');
      return;
    }
    axios
      .post('http://localhost:8000/departments/', newDepartment)
      .then(res => {
        setDepartments([...departments, res.data]);
        setNewDepartment({ name: '' });
        toast.success('Department created successfully');
      })
      .catch(err => {
        const errorMsg = 'Failed to create department: ' + err.message;
        setError(errorMsg);
        toast.error(errorMsg);
      });
  };

  if (loading) return <div className="p-6 text-gray-600 text-center">Loading...</div>;
  if (error) {
    return (
      <div className="p-6 text-red-500 text-center">
        {error}
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Admin Dashboard</h1>

      {/* Add Department Form */}
      <div className="mb-8 bg-white p-6 rounded-md shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add Department</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Department Name"
            value={newDepartment.name}
            onChange={e => setNewDepartment({ name: e.target.value })}
            className="border p-2 rounded-md flex-1"
          />
          <button
            onClick={createDepartment}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Add Department
          </button>
        </div>
      </div>

      {/* Add Student Form */}
      <div className="mb-8 bg-white p-6 rounded-md shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add Student</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Name"
            value={newStudent.name}
            onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
            className="border p-2 rounded-md flex-1"
          />
          <input
            type="email"
            placeholder="Email"
            value={newStudent.email}
            onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
            className="border p-2 rounded-md flex-1"
          />
          <select
            value={newStudent.department_id}
            onChange={e => setNewStudent({ ...newStudent, department_id: e.target.value })}
            className="border p-2 rounded-md"
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept.id || dept.name} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <button
            onClick={createStudent}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Add Student
          </button>
        </div>
      </div>

      {/* Add Formation Form */}
      <div className="mb-8 bg-white p-6 rounded-md shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add Formation</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Title"
            value={newFormation.title}
            onChange={e => setNewFormation({ ...newFormation, title: e.target.value })}
            className="border p-2 rounded-md flex-1"
          />
          <input
            type="text"
            placeholder="Theme"
            value={newFormation.theme}
            onChange={e => setNewFormation({ ...newFormation, theme: e.target.value })}
            className="border p-2 rounded-md flex-1"
          />
          <button
            onClick={createFormation}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Add Formation
          </button>
        </div>
      </div>

      {/* Departments Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">All Departments</h2>
        {departments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map(department => (
              <div
                key={department.id || department.name}
                className="border p-4 rounded-md bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="font-medium">ID: {department.id}</p>
                <p>Name: {department.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No departments found.</p>
        )}
      </div>

      {/* Students Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">All Students</h2>
        {students.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map(student => (
              <div
                key={student.id || student.email}
                className="border p-4 rounded-md bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="font-medium">ID: {student.id}</p>
                <p>Name: {student.name}</p>
                <p>Email: {student.email}</p>
                <p>Department: {
                  departments.find(d => d.id === student.department_id)?.name || 'No department'
                }</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No students found.</p>
        )}
      </div>

      {/* Formations Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">All Formations</h2>
        {formations.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {formations.map(formation => (
              <div
                key={formation.id || formation.title}
                className="border p-4 rounded-md bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="font-medium">ID: {formation.id}</p>
                <p>Title: {formation.title}</p>
                <p>Theme: {formation.theme}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No formations found.</p>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}

export default App;
