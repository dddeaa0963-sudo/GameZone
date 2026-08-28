import React from 'react';
type Product = any;

interface WishlistViewProps {
  wishlist: string[];
  products: Record<string, Product[]>;
  onProductClick: (id: string) => void;
  currencySymbol: string;
  onToggleWishlist: (id: string) => void;
  onBack: () => void;
}

const WishlistView: React.FC<WishlistViewProps> = ({ wishlist, products, onProductClick, currencySymbol, onToggleWishlist, onBack }) => {
  // Flatten all products
  const allProducts = Object.values(products).flat();
  const wishlistedProducts = allProducts.filter(p => wishlist.includes(p._id || p.id));

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-[#0f172a] text-white p-4 sticky top-0 z-50 shadow-lg shadow-black/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h2 className="text-xl font-bold font-cairo">المفضلة</h2>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="p-4">
        {wishlistedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {wishlistedProducts.map(prod => (
              <div 
                key={prod._id || prod.id}
                onClick={() => onProductClick(prod._id || prod.id)}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow relative group"
              >
                {/* Heart Icon */}
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleWishlist(prod._id || prod.id); }}
                  className="absolute top-2 left-2 z-10 p-2 rounded-full bg-black/40 backdrop-blur-md text-[#ef4444] hover:bg-black/60 transition-all shadow-md active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
                
                <div className="aspect-[4/3] relative overflow-hidden bg-slate-50">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none" />
                  {prod.image ? (
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                  )}
                  {prod.discount && prod.discount > 0 ? (
                    <div className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10">
                      خصم {prod.discount}%
                    </div>
                  ) : null}
                  <div className="absolute bottom-2 right-2 left-2 z-20">
                    <h3 className="font-bold text-white text-sm line-clamp-1 drop-shadow-md">{prod.name}</h3>
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex flex-col">
                      <span className="text-[#0f172a] font-black text-sm">
                        {prod.price} {currencySymbol}
                      </span>
                      {prod.originalPrice && prod.originalPrice > prod.price && (
                        <span className="text-slate-400 text-[10px] line-through">
                          {prod.originalPrice} {currencySymbol}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onProductClick(prod._id || prod.id); }}
                      className="w-8 h-8 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 text-slate-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <h3 className="text-lg font-bold text-slate-600 mb-2">المفضلة فارغة</h3>
            <p className="text-sm">لم تقم بإضافة أي منتجات إلى المفضلة بعد.</p>
            <button 
              onClick={onBack}
              className="mt-6 bg-[#0ea5e9] text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-[#0284c7] transition-colors"
            >
              تصفح المنتجات
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistView;
