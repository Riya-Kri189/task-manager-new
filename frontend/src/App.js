import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member'
  });
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(localStorage.getItem('name') || '');
  const [task, setTask] = useState({
    title: '',
    description: '',
    status: 'pending',
    assignedTo: '',
    project: '',
    dueDate: ''
  });
  const [tasks, setTasks] = useState([]);

  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTaskChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const url = isLogin
        ? 'http://localhost:5000/api/login'
        : 'http://localhost:5000/api/signup';

      const payload = isLogin
        ? { email: form.email, password: form.password }
        : form;

      const res = await axios.post(url, payload);
      setMessage(res.data.message || `Welcome ${res.data.name}`);

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('name', res.data.name);
        setUser(res.data.name);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  
  const createTask = async () => {
    try {
      await axios.post('http://localhost:5000/api/tasks', task, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Task created');
      setTask({
        title: '',
        description: '',
        status: 'pending',
        assignedTo: '',
        project: '',
        dueDate: ''
      });
      const res = await axios.get('http://localhost:5000/api/tasks', {
  headers: { Authorization: `Bearer ${token}` }
});
setTasks(res.data);
    } catch (err) {
      setMessage('Task creation failed');
    }
  };
  
  const updateTaskStatus = async (id, newStatus) => {
  try {
    await axios.put(
      `http://localhost:5000/api/tasks/${id}`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const res = await axios.get('http://localhost:5000/api/tasks', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTasks(res.data);
  } catch (err) {
    setMessage('Status update failed');
  }
};

const deleteTask = async (id) => {
  try {
    await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const res = await axios.get('http://localhost:5000/api/tasks', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTasks(res.data);
  } catch (err) {
    setMessage('Delete failed');
  }
};

  const logout = () => {
    localStorage.clear();
    setUser('');
    setTasks([]);
    setMessage('Logged out');
  };

 useEffect(() => {
  const loadTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (user) {
    loadTasks();
  }
}, [user, token]);

  if (user) {
    return (
      <div style={{ padding: '40px', fontFamily: 'Arial' }}>
        <h1>Welcome, {user}</h1>
        <p>You are logged in to the Task Manager dashboard.</p>

        <h2>Create Task</h2>

        <input
          type="text"
          name="title"
          placeholder="Title"
          value={task.title}
          onChange={handleTaskChange}
          style={{ display: 'block', marginBottom: '10px', width: '300px', padding: '10px' }}
        />

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={task.description}
          onChange={handleTaskChange}
          style={{ display: 'block', marginBottom: '10px', width: '300px', padding: '10px' }}
        />

        <input
          type="text"
          name="assignedTo"
          placeholder="Assigned To"
          value={task.assignedTo}
          onChange={handleTaskChange}
          style={{ display: 'block', marginBottom: '10px', width: '300px', padding: '10px' }}
        />

        <input
          type="text"
          name="project"
          placeholder="Project"
          value={task.project}
          onChange={handleTaskChange}
          style={{ display: 'block', marginBottom: '10px', width: '300px', padding: '10px' }}
        />

        <input
          type="date"
          name="dueDate"
          value={task.dueDate}
          onChange={handleTaskChange}
          style={{ display: 'block', marginBottom: '10px', width: '300px', padding: '10px' }}
        />

        <button onClick={createTask} style={{ marginBottom: '20px' }}>
          Create Task
        </button>

        <h2>Your Tasks</h2>
       {tasks.map((t) => (
  <div
    key={t._id}
    style={{
      border: '1px solid #ccc',
      padding: '10px',
      marginBottom: '10px',
      width: '400px'
    }}
  >
    <h3>{t.title}</h3>
    <p>{t.description}</p>
    <p>Status: {t.status}</p>
    <p>Assigned To: {t.assignedTo}</p>
    <p>Project: {t.project}</p>
    <p>Due Date: {t.dueDate}</p>

    <button
      onClick={() =>
        updateTaskStatus(t._id, t.status === 'pending' ? 'completed' : 'pending')
      }
    >
      Mark {t.status === 'pending' ? 'Completed' : 'Pending'}
    </button>

    <button
      onClick={() => deleteTask(t._id)}
      style={{ marginLeft: '10px' }}
    >
      Delete
    </button>
  </div>
))}

        <button onClick={logout}>Logout</button>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'Arial' }}>
      <h2>{isLogin ? 'Login' : 'Signup'}</h2>

      {!isLogin && (
        <>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '10px' }}
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '10px' }}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </>
      )}

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '10px' }}
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '10px' }}
      />

      <button onClick={handleSubmit} style={{ padding: '10px 20px', marginRight: '10px' }}>
        {isLogin ? 'Login' : 'Signup'}
      </button>

      <button onClick={() => setIsLogin(!isLogin)}>
        Switch to {isLogin ? 'Signup' : 'Login'}
      </button>

      <p>{message}</p>
    </div>
  );
}

export default App;