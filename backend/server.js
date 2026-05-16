const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  autoSelectFamily: false
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'member' }
});
const User = mongoose.model('User', userSchema);

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, default: 'pending' },
  assignedTo: String,
  project: String,
  dueDate: String,
  createdBy: String
});
const Task = mongoose.model('Task', taskSchema);

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.post('/api/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    await User.create({ name, email, password: hashed, role });
    res.json({ message: 'Signup successful' });
  } catch {
    res.status(400).json({ message: 'Email already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET
  );
  res.json({ token, role: user.role, name: user.name });
});

app.get('/api/users', auth, async (req, res) => {
  const users = await User.find({}, 'name email role');
  res.json(users);
});

app.post('/api/tasks', auth, async (req, res) => {
  const task = await Task.create({ ...req.body, createdBy: req.user.name });
  res.json(task);
});

app.get('/api/tasks', auth, async (req, res) => {
  const tasks =
    req.user.role === 'admin'
      ? await Task.find()
      : await Task.find({ assignedTo: req.user.name });
  res.json(tasks);
});

app.put('/api/tasks/:id', auth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(task);
});

app.delete('/api/tasks/:id', auth, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

app.listen(process.env.PORT || 5000, () => {
  console.log('Server running on port 5000');
});