import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product._id}`}
      className="bg-slate-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-indigo-500 transition block"
    >
      <div className="aspect-square bg-slate-700 flex items-center justify-center text-slate-500 text-sm">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          "No image"
        )}
      </div>
      <div className="p-4">
        <h3 className="text-white font-medium truncate">{product.title}</h3>
        <p className="text-slate-400 text-sm truncate">{product.category}</p>
        <p className="text-white font-semibold mt-1">₹{product.price}</p>
        {product.stock === 0 && (
          <p className="text-red-400 text-xs mt-1">Out of stock</p>
        )}
      </div>
    </Link>
  );
}

export default ProductCard;