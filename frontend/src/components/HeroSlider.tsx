import React, { useState, useEffect, useRef } from 'react';

interface Banner {
  image: string;
  link?: string;
}

interface HeroSliderProps {
  banners: Banner[];
  autoPlayInterval?: number;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ banners, autoPlayInterval = 4000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const activeBanners = Array.isArray(banners) ? banners.filter(b => b.image) : [];
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    if (activeBanners.length <= 1 || isHovered || isSwiping) return;

    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === activeBanners.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => {
      resetTimeout();
    };
  }, [currentIndex, activeBanners.length, isHovered, isSwiping, autoPlayInterval]);

  if (activeBanners.length === 0) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
    resetTimeout();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const distance = touchStartX.current - touchEndX;
    
    if (distance > 50) {
      setCurrentIndex((prevIndex) =>
        prevIndex === activeBanners.length - 1 ? 0 : prevIndex + 1
      );
    } else if (distance < -50) {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? activeBanners.length - 1 : prevIndex - 1
      );
    }

    touchStartX.current = null;
    setIsSwiping(false);
  };

  return (
    <div 
      className="rounded-2xl relative overflow-hidden h-[160px] cursor-grab active:cursor-grabbing w-full bg-gray-100 dark:bg-gray-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      dir="rtl"
    >
      <div 
        className="flex h-full will-change-transform"
        style={{ 
          transform: `translate3d(${currentIndex * (100 / activeBanners.length)}%, 0, 0)`,
          width: `${activeBanners.length * 100}%`,
          transition: isSwiping ? 'none' : 'transform 600ms cubic-bezier(0.25, 0.8, 0.25, 1)'
        }}
      >
        {activeBanners.map((banner, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div 
              key={idx} 
              className="flex-shrink-0 h-full px-1" 
              style={{ 
                width: `${100 / activeBanners.length}%`,
                transition: 'opacity 600ms ease, transform 600ms ease',
                opacity: isActive ? 1 : 0.4,
                transform: isActive ? 'scale(1)' : 'scale(0.95)'
              }}
            >
              {banner.link ? (
                <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full focus:outline-none">
                  <img src={banner.image} alt="Banner" className="w-full h-full object-cover rounded-2xl shadow-sm" loading={isActive ? "eager" : "lazy"} />
                </a>
              ) : (
                <img src={banner.image} alt="Banner" className="w-full h-full object-cover rounded-2xl shadow-sm" loading={isActive ? "eager" : "lazy"} />
              )}
            </div>
          );
        })}
      </div>
      
      {activeBanners.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10" dir="ltr">
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === idx 
                  ? 'w-4 bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)]' 
                  : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
