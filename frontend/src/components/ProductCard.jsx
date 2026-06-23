import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product._id}`}
      className="bg-surface rounded overflow-hidden hover:ring-2 hover:ring-coral transition block"
    >
      <div className="aspect-square bg-surface-light flex items-center justify-center text-muted text-sm">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          "No image"
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-cream truncate">{product.title}</h3>
        <p className="text-muted text-xs uppercase tracking-wider font-semibold mt-1 truncate">
          {product.category}
        </p>
        <p className="font-mono text-coral text-lg font-medium mt-2">₹{product.price}</p>
        {product.stock === 0 && (
          <p className="text-coral text-xs font-semibold mt-1">Out of stock</p>
        )}
      </div>
    </Link>
  );
}

export default ProductCard;