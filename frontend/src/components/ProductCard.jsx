import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product._id}`}
      className="bg-white border border-[#E4E4EA] rounded-lg overflow-hidden hover:shadow-md transition block"
    >
      <div className="aspect-square bg-[#F5F4FA] flex items-center justify-center text-[#6B6B76] text-sm">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          "No image"
        )}
      </div>
      <div className="p-3">
        <h3 className="text-[13px] font-semibold text-[#1A1A22] truncate">
          {product.title}
        </h3>
        <p className="text-[11px] text-[#6B6B76] uppercase tracking-wide mt-0.5 truncate">
          {product.category}
        </p>
        <p className="text-[#1A1A22] text-base font-bold mt-1.5">
          ₹{product.price}
        </p>
        {product.stock === 0 && (
          <p className="text-[#C0392B] text-[11px] font-semibold mt-1">
            Out of stock
          </p>
        )}
      </div>
    </Link>
  );
}

export default ProductCard;