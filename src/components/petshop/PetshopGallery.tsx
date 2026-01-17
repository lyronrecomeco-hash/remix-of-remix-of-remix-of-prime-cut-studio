import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

import gallery1 from '@/assets/petshop/gallery-1.jpg';
import gallery2 from '@/assets/petshop/gallery-2.jpg';
import gallery3 from '@/assets/petshop/gallery-3.jpg';
import gallery4 from '@/assets/petshop/gallery-4.jpg';
import serviceGrooming from '@/assets/petshop/service-grooming.jpg';
import serviceVet from '@/assets/petshop/service-vet.jpg';
import serviceDaycare from '@/assets/petshop/service-daycare.jpg';
import heroBg from '@/assets/petshop/hero-dog-bath.jpg';

const PetshopGallery = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const images = [
    { src: gallery1, alt: 'Shih Tzu após tosa' },
    { src: gallery2, alt: 'Gatinho no veterinário' },
    { src: gallery3, alt: 'Bulldog francês fofo' },
    { src: gallery4, alt: 'Yorkshire no banho' },
    { src: serviceGrooming, alt: 'Serviço de tosa' },
    { src: serviceVet, alt: 'Consulta veterinária' },
    { src: serviceDaycare, alt: 'Creche para pets' },
    { src: heroBg, alt: 'Banho em golden retriever' },
  ];

  const handlePrev = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
    }
  };

  const handleNext = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === images.length - 1 ? 0 : selectedImage + 1);
    }
  };

  return (
    <section id="galeria" className="py-20 bg-petshop-cream" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-block bg-petshop-orange/10 text-petshop-orange px-4 py-2 rounded-full text-sm font-medium mb-4">
            Galeria
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-petshop-dark mb-4">
            Nossos <span className="text-petshop-orange">xodós</span> em ação
          </h2>
          <p className="text-petshop-gray text-lg">
            Veja alguns dos pets que passaram pelo nosso cuidado e saíram ainda mais lindos e felizes!
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={() => setSelectedImage(index)}
              className={`relative cursor-pointer group overflow-hidden rounded-2xl ${
                index === 0 || index === 7 ? 'row-span-2' : ''
              }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover aspect-square group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-petshop-dark/0 group-hover:bg-petshop-dark/40 transition-colors duration-300 flex items-center justify-center">
                <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Ver mais
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Instagram CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-10"
        >
          <a
            href="https://instagram.com/seuxodo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Siga-nos no Instagram
          </a>
        </motion.div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <img
            src={images[selectedImage].src}
            alt={images[selectedImage].alt}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </section>
  );
};

export default PetshopGallery;
