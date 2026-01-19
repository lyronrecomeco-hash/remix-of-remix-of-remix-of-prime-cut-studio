import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Camera, Heart, ChevronLeft, ChevronRight, X } from 'lucide-react';

// Using Mon Petit gallery images as placeholder
import gallery1 from '@/assets/petshop-mon/gallery-1.jpeg';
import gallery2 from '@/assets/petshop-mon/gallery-2.jpeg';
import gallery3 from '@/assets/petshop-mon/gallery-3.jpeg';
import gallery4 from '@/assets/petshop-mon/gallery-4.jpeg';
import gallery5 from '@/assets/petshop-mon/gallery-5.jpeg';
import gallery6 from '@/assets/petshop-mon/gallery-6.jpeg';
import gallery7 from '@/assets/petshop-mon/gallery-7.jpeg';

const CasapetGallery = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const images = [
    { src: gallery1, alt: 'Pet feliz', caption: 'Nosso xodó' },
    { src: gallery2, alt: 'Atendimento', caption: 'Cuidado especial' },
    { src: gallery3, alt: 'Pet shop', caption: 'Produtos de qualidade' },
    { src: gallery4, alt: 'Consulta', caption: 'Atendimento veterinário' },
    { src: gallery5, alt: 'Pet saudável', caption: 'Saúde em dia' },
    { src: gallery6, alt: 'Produtos', caption: 'Variedade completa' },
    { src: gallery7, alt: 'Amor', caption: 'Muito amor' },
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
    <>
      <section ref={ref} id="galeria" className="py-12 sm:py-20 px-4 bg-gradient-to-b from-white to-emerald-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-8 sm:mb-12"
          >
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 border border-emerald-500/20">
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Galeria
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 mb-3 sm:mb-4">
              Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">clientes</span>
            </h2>
            <p className="text-gray-500 text-sm sm:text-lg px-4">
              Veja alguns dos pets que cuidamos com muito amor 🐾
            </p>
          </motion.div>

          {/* Gallery Grid - 7 imagens */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 max-w-5xl mx-auto">
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                onClick={() => setSelectedImage(index)}
                className={`relative cursor-pointer group overflow-hidden rounded-xl sm:rounded-2xl aspect-square shadow-lg hover:shadow-2xl transition-all duration-300 ${
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-semibold text-xs sm:text-sm flex items-center gap-1">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-rose-400" />
                    {image.caption}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-md mx-auto"
          >
            {[
              { value: '5.000+', label: 'Pets atendidos' },
              { value: '10 anos', label: 'Experiência' },
              { value: '4.9★', label: 'No Google' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">{stat.value}</p>
                <p className="text-gray-500 text-[10px] sm:text-sm mt-0.5 sm:mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }} 
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
            className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <img 
            src={images[selectedImage].src} 
            alt={images[selectedImage].alt} 
            className="max-w-full max-h-[80vh] object-contain rounded-xl" 
            onClick={(e) => e.stopPropagation()} 
          />
          <button 
            onClick={(e) => { e.stopPropagation(); handleNext(); }} 
            className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              {images[selectedImage].caption}
            </p>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default CasapetGallery;
