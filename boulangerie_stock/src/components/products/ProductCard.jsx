function ProductCard({ product, onEdit, onDelete }) {
  const stockStatus = product.stock === 0 
    ? 'out-of-stock' 
    : product.stock < 10 
      ? 'low-stock' 
      : 'in-stock';

  const isAvailable = product.stock > 0;
  const getStockLabel = () => {
    if (product.stock === 0) return 'Rupture de stock';
    if (product.stock < 5) return '⚠️ Peu disponible';
    if (product.stock < 10) return '⚡ Stock faible';
    return '✓ En stock';
  };

  return (
    <div className={`product-card ${stockStatus}`}>
      {/* Image Container */}
      <div className="product-image-wrapper">
        <img 
          src={product.image} 
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(product.name)}`;
          }}
        />
        <div className={`stock-badge ${stockStatus}`}>
          {product.stock > 0 ? `${product.stock} unités` : 'Rupture'}
        </div>
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        
        <div className="product-meta">
          <div className="stock-container">
            <span className={`stock-status ${stockStatus}`}>
              {getStockLabel()}
            </span>
            <span className={`availability-badge ${isAvailable ? 'available' : 'unavailable'}`}>
              {isAvailable ? '🟢 Disponible' : '🔴 Indisponible'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="product-actions">
        <button 
          className="btn btn-edit" 
          onClick={onEdit}
          title="Modifier le produit"
        >
          ✏️ Modifier
        </button>
        <button 
          className="btn btn-delete" 
          onClick={onDelete}
          title="Supprimer le produit"
        >
          🗑️ Supprimer
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
