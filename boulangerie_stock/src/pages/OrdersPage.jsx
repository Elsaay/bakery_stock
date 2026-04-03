import { useState, useEffect } from 'react';
import { getOrders, createOrder, getProducts } from '../api';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    supplier_email: '',
    message: '',
    items: []
  });

  const load = async () => {
    const [ordersRes, productsRes] = await Promise.all([getOrders(), getProducts()]);
    setOrders(ordersRes.data);
    setProducts(productsRes.data);
  };

  useEffect(() => { load(); }, []);

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { product_id: '', quantity: 1 }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createOrder(form);
    setForm({ supplier_email: '', message: '', items: [] });
    load();
  };

  return (
    <div>
      <h2>🧾 Commandes fournisseurs</h2>

      {/* Formulaire */}
      <form onSubmit={handleSubmit}>
        <input required placeholder="Email fournisseur"
          value={form.supplier_email}
          onChange={e => setForm({ ...form, supplier_email: e.target.value })}/>
        <textarea placeholder="Message"
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}/>
        <h4>Produits :</h4>
        {form.items.map((item, idx) => (
          <div key={idx}>
            <select required
              value={item.product_id}
              onChange={e => {
                const copy = [...form.items];
                copy[idx].product_id = e.target.value;
                setForm({ ...form, items: copy });
              }}>
              <option value="">--Choisir--</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" min="1"
              value={item.quantity}
              onChange={e => {
                const copy = [...form.items];
                copy[idx].quantity = Number(e.target.value);
                setForm({ ...form, items: copy });
              }}/>
          </div>
        ))}
        <button type="button" onClick={addItem}>+ Ajouter produit</button>
        <button type="submit">Créer commande</button>
      </form>

      {/* Liste des commandes */}
      <h3>Commandes existantes</h3>
      {orders.map(o => (
        <div key={o.id} style={{ background:'#f8f8f8', margin:'1rem 0', padding:'1rem' }}>
          <p><b>ID:</b> {o.id}</p>
          <p><b>Fournisseur:</b> {o.supplier_email}</p>
          <p><b>Message:</b> {o.message}</p>
          <p><b>Date:</b> {new Date(o.created_at).toLocaleString()}</p>
          {o.items.length > 0 ? (
            <ul>
              {o.items.map((i, ix) => (
                <li key={ix}>{i.product_name} — {i.quantity}</li>
              ))}
            </ul>
          ) : <em>Aucun article</em>}
        </div>
      ))}
    </div>
  );
}

export default OrdersPage;
