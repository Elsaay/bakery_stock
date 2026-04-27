import { useState, useEffect } from 'react';

function ProductForm({ product, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        stock: product.stock,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'name' ? value : Number(value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <form className="product-form" onSubmit={handleSubmit}>
        <h3>{product ? 'Modifier le produit' : 'Nouveau produit'}</h3>
        
        <div className="form-group">
          <label htmlFor="name">Nom du produit</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Ex: Croissant"
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Prix (€)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="1.20"
          />
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock initial</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            min="0"
            placeholder="50"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary">
            {product ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
