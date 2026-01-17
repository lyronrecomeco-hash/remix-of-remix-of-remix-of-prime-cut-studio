import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Camera } from 'lucide-react';

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
  const [likedImages, setLikedImages] = useState<Set<number>>(new Set());

  const images = [
    { src: gallery1, alt: 'Shih Tzu após tosa', caption: 'Luna - Shih Tzu' },
    { src: gallery2, alt: 'Gatinho no veterinário', caption: 'Mimi - Persa' },
    { src: gallery3, alt: 'Bulldog francês fofo', caption: 'Thor - Bulldog' },
    { src: gallery4, alt: 'Yorkshire no banho', caption: 'Mel - Yorkshire' },
    { src: serviceGrooming, alt: 'Serviço de tosa', caption: 'Bob - Golden' },
    { src: serviceVet, alt: 'Consulta veterinária', caption: 'Nina - Poodle' },
    { src: serviceDaycare, alt: 'Creche para pets', caption: 'Rex - Labrador' },
    { src: heroBg, alt: 'Banho em golden retriever', caption: 'Max - Golden' },
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

  const toggleLike = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLiked = new Set(likedImages);
    if (newLiked.has(index)) {
      newLiked.delete(index);
    } else {
      newLiked.add(index);
    }
    setLikedImages(newLiked);
  };

  return (
    <section id="galeria" className="py-24 bg-petshop-cream" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-petshop-orange/10 text-petshop-orange px-5 py-2.5 rounded-full text-sm font-semibold mb-6">
            <Camera className="w-4 h-4" />
            Galeria
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-petshop-dark mb-6 leading-tight">
            Nossos <span className="text-petshop-orange">xodós</span> em ação
          </h2>
          <p className="text-petshop-gray text-lg md:text-xl leading-relaxed">
            Veja alguns dos pets que passaram pelo nosso cuidado e saíram ainda mais lindos e felizes!
          </p>
        </motion.div>

        {/* Gallery Grid - Masonry Style */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {images.map((image, index) => {
            const isLarge = index === 0 || index === 5;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                onClick={() => setSelectedImage(index)}
                className={`relative cursor-pointer group overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 ${
                  isLarge ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <div className={`relative ${isLarge ? 'aspect-square' : 'aspect-square'}`}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-petshop-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  
                  {/* Like Button */}
                  <button
                    onClick={(e) => toggleLike(index, e)}
                    className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      likedImages.has(index) 
                        ? 'bg-red-500 text-white scale-100' 
                        : 'bg-white/90 text-petshop-gray opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${likedImages.has(index) ? 'fill-current' : ''}`} />
                  </button>
                  
                  {/* Caption */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-semibold text-lg">{image.caption}</p>
                    <p className="text-white/80 text-sm">Clique para ampliar</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-14 flex flex-wrap justify-center gap-8 md:gap-16"
        >
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-petshop-orange">5.000+</p>
            <p className="text-petshop-gray mt-1">Pets atendidos</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-petshop-orange">8 anos</p>
            <p className="text-petshop-gray mt-1">De experiência</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-petshop-orange">4.9★</p>
            <p className="text-petshop-gray mt-1">No Google</p>
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <motion.img
            key={selectedImage}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={images[selectedImage].src}
            alt={images[selectedImage].alt}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Image Info */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
            <p className="text-white font-medium">{images[selectedImage].caption}</p>
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default PetshopGallery;
