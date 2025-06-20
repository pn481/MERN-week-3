import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import React, { useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function App() {
  const [count, setCount] = useState(0)


  

// ---------- Theme Context ----------
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
const useTheme = () => useContext(ThemeContext);

// ---------- Button Component ----------
const Button = ({ children, variant = 'primary', ...props }) => {
  const base = 'px-4 py-2 rounded font-semibold text-white focus:outline-none';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-600 hover:bg-gray-700',
    danger: 'bg-red-600 hover:bg-red-700',
  };
  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};

// ---------- Card Component ----------
const Card = ({ title, image, price }) => (
  <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
    <img src={image} alt={title} className="w-full h-40 object-cover" />
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-green-600 font-bold">R{price}</p>
    </div>
  </div>
);

// ---------- Navbar Component ----------
const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <nav className="bg-gray-100 dark:bg-gray-800 shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">ToolNest</h1>
      <div className="flex gap-4 items-center">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/products" className="hover:underline">Products</Link>
        <Link to="/tasks" className="hover:underline">Tasks</Link>
        <button onClick={toggleTheme} className="ml-2 px-2 py-1 border rounded">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
};

// ---------- Footer Component ----------
const Footer = () => (
  <footer className="bg-gray-100 dark:bg-gray-800 text-center py-4 mt-8">
    <p className="text-sm">&copy; {new Date().getFullYear()} ToolNest. All rights reserved.</p>
    <div className="mt-2">
      <a href="#" className="mx-2 hover:underline">Privacy Policy</a>
      <a href="#" className="mx-2 hover:underline">Terms of Service</a>
    </div>
  </footer>
);

// ---------- Pages ----------

const Home = () => (
  <div className="text-center mt-10">
    <h1 className="text-3xl font-bold mb-4">Welcome to ToolNest</h1>
    <p className="text-lg mb-6">Your one-stop online hardware store for quality tools and supplies.</p>
    <Link to="/products">
      <Button variant="primary">Shop Now</Button>
    </Link>
  </div>
);

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load products');
        setLoading(false);
      });
  }, []);

  const filtered = products.filter(product =>
    product.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Our Products</h2>
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="mb-4 p-2 border rounded w-full md:w-1/2"
      />
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.map(product => (
          <Card key={product.id} title={product.title} image={product.image} price={product.price} />
        ))}
      </div>
    </div>
  );
};

const TaskManager = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: input.trim(), completed: false }]);
    setInput('');
  };

  const toggleComplete = id => {
    setTasks(tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = id => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'All') return true;
    if (filter === 'Active') return !task.completed;
    if (filter === 'Completed') return task.completed;
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Task Manager</h2>
      <div className="flex gap-2 mb-4">
        <input
          className="flex-grow p-2 border rounded"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="New task"
          onKeyDown={e => { if (e.key === 'Enter') addTask(); }}
        />
        <Button onClick={addTask}>Add</Button>
      </div>

      <div className="mb-4">
        {['All', 'Active', 'Completed'].map(f => (
          <button
            key={f}
            className={`mr-2 px-3 py-1 rounded ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <ul>
        {filteredTasks.length === 0 && <p>No tasks found.</p>}
        {filteredTasks.map(task => (
          <li
            key={task.id}
            className="flex items-center justify-between mb-2 p-2 border rounded"
          >
            <label className={`flex-grow cursor-pointer ${task.completed ? 'line-through text-gray-500' : ''}`}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task.id)}
                className="mr-2"
              />
              {task.text}
            </label>
            <Button variant="danger" onClick={() => deleteTask(task.id)}>Delete</Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ---------- App Component ----------

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
          <Navbar />
          <main className="flex-grow p-4 max-w-6xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/tasks" element={<TaskManager />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App()
  // All hooks and logic above...
return (
  <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );


