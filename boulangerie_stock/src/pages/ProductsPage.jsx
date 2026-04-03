import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';
import ProductList from '../components/products/ProductList';
import Modal from '../components/common/Modal';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', image: '', stock: 0 });
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    const res = await getProducts();
    setProducts(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim()) {
      alert('Le nom du produit est requis');
      return;
    }
    
    try {
      if (editing) {
        await updateProduct(editing.id, newProduct);
      } else {
        await createProduct(newProduct);
      }
      setNewProduct({ name: '', image: '', stock: 0 });
      setEditing(null);
      setShowModal(false);
      load();
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await deleteProduct(id);
        load();
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const startEdit = (p) => {
    setEditing(p);
    setNewProduct({ name: p.name, image: p.image, stock: p.stock });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditing(null);
    setNewProduct({ name: '', image: '', stock: 0 });
  };

  const handleAddNew = () => {
    setEditing(null);
    setNewProduct({ name: '', image: '', stock: 0 });
    setShowModal(true);
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <h2>📦 Gestion des Produits</h2>
        <button className="btn btn-primary" onClick={handleAddNew}>
          ➕ Ajouter un produit
        </button>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <p>Aucun produit enregistré. Commencez par en ajouter un ! 🥐</p>
        </div>
      ) : (
        <ProductList 
          products={products}
          onEdit={startEdit}
          onDelete={handleDelete}
        />
      )}

      {showModal && (
        <Modal onClose={handleCloseModal}>
          <div className="product-form">
            <h3>{editing ? '✏️ Modifier le produit' : '➕ Ajouter un nouveau produit'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="product-name">Nom du produit</label>
                <input 
                  id="product-name"
                  type="text"
                  placeholder="Ex: Croissant, Pain de mie..."
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="product-image">URL de l'image</label>
                <input 
                  id="product-image"
                  type="url"
                  placeholder="https://..."
                  value={newProduct.image}
                  onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                />
                {newProduct.image && (
                  <div className="image-preview">
                    <img 
                      src={newProduct.image} 
                      alt="Aperçu"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x150?text=Image+invalide';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="product-stock">Quantité en stock</label>
                <input 
                  id="product-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={newProduct.stock}
                  onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editing ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ProductsPage;
