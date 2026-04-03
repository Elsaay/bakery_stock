import ProductCard from './ProductCard';

function ProductList({ products, onEdit, onDelete }) {
  if (products.length === 0) {
    return <p className="empty-state">Aucun produit enregistré</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={() => onEdit(product)}
          onDelete={() => onDelete(product.id)}
        />
      ))}
    </div>
  );
}

export default ProductList;
