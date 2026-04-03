import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import DailyReportPage from './pages/DailyReportPage';
import './styles/index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="sidebar">
          <h1>🥐 BakeryStock</h1>
          <ul>
            <li><NavLink to="/">Tableau de bord</NavLink></li>
            <li><NavLink to="/products">Produits</NavLink></li>
            <li><NavLink to="/orders">Commandes</NavLink></li>
            <li><NavLink to="/daily-report">Bilan de la journée</NavLink></li>
          </ul>
        </nav>
        
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/daily-report" element={<DailyReportPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
