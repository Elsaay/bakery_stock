import { useState, useEffect } from 'react';
import { getProducts, getOrders } from '../api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    outOfStock: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          getProducts(),
          getOrders(),
        ]);
        
        const products = productsRes.data;
        setStats({
          totalProducts: products.length,
          lowStock: products.filter(p => p.stock > 1 && p.stock < 10).length,
          outOfStock: products.filter(p => p.stock === 0).length,
          totalOrders: ordersRes.data.length,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard">
      <h2>Tableau de bord</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.totalProducts}</span>
          <span className="stat-label">Produits</span>
        </div>
        <div className="stat-card warning">
          <span className="stat-value">{stats.lowStock}</span>
          <span className="stat-label">Stock faible</span>
        </div>
        <div className="stat-card danger">
          <span className="stat-value">{stats.outOfStock}</span>
          <span className="stat-label">Rupture de stock</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalOrders}</span>
          <span className="stat-label">Commandes</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
