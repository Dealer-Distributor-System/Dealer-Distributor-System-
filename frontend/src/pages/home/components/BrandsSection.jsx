import React from 'react';

const brands = [
  { name: 'Astral', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Astral_Pipes_Logo.svg' },
  { name: 'Finolex', url: 'https://companieslogo.com/img/orig/FINCABLES.NS-4b2a8d1e.png' },
  { name: 'Supreme', url: 'https://companieslogo.com/img/orig/SUPREMEIND.NS-90c422c5.png' },
  { name: 'Ashirvad', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVYv0YvW7jJ0v0aN0rJ2yY_p7w0i_J-9P_9w&s' },
  { name: 'Prince', url: 'https://companieslogo.com/img/orig/PRINCEPIPE.NS-1b9c9f2d.png' }
];

const BrandsSection = () => {
  return (
    <section className="py-12 bg-background border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold text-text-light uppercase tracking-widest mb-8">
          Trusted by Top Manufacturers
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {brands.map((brand, idx) => (
            <div key={idx} className="flex items-center justify-center h-12 w-24 md:w-32 transition-transform hover:scale-110">
              {/* Fallback to text if image fails or for generic look */}
              <span className="text-xl font-extrabold text-text-muted">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
