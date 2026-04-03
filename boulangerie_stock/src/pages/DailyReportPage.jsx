import { useState } from 'react';
import { getProducts, recordDailyReport } from '../api';

function DailyReportPage() {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  const loadProducts = async () => {
    const res = await getProducts();
    setProducts(res.data);
  };

  // Charger les produits au premier affichage
  useState(() => { loadProducts(); }, []);

  const addUsage = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await recordDailyReport(items);
    alert('Bilan de la journée enregistré');
    setItems([]);
  };

  return (
    <div>
      <h2>📦 Bilan de la journée</h2>
      <form onSubmit={handleSubmit}>
        {items.map((it, i) => (
          <div key={i}>
            <select required
              value={it.product_id}
              onChange={(e) => {
                const copy = [...items];
                copy[i].product_id = e.target.value;
                setItems(copy);
              }}
            >
              <option value="">-- Produit --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input
              type="number"
              min="1"
              value={it.quantity}
              onChange={(e) => {
                const copy = [...items];
                copy[i].quantity = Number(e.target.value);
                setItems(copy);
              }}
            />
          </div>
        ))}
        <button type="button" onClick={addUsage}>+ Ajouter</button>
        <button type="submit">Soumettre</button>
      </form>
    </div>
  );
}

export default DailyReportPage;
