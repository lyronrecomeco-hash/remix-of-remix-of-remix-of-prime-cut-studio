import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

interface MousePosition {
  x: number;
  y: number;
}

export const InteractiveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<MousePosition>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const colors = [
    'hsl(200, 80%, 60%)',  // Primary blue
    'hsl(190, 80%, 50%)',  // Cyan
    'hsl(210, 70%, 55%)',  // Blue variant
    'hsl(220, 60%, 50%)',  // Darker blue
  ];

  const initParticles = useCallback((width: number, height: number) => {
    // Reduzir partículas para mobile (melhora performance)
    const isMobile = width < 768;
    const particleCount = isMobile 
      ? Math.min(Math.floor((width * height) / 30000), 25) 
      : Math.min(Math.floor((width * height) / 15000), 60);
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (isMobile ? 0.15 : 0.3),
        vy: (Math.random() - 0.5) * (isMobile ? 0.15 : 0.3),
        size: Math.random() * (isMobile ? 1.5 : 2) + 1,
        opacity: Math.random() * 0.3 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    
    particlesRef.current = particles;
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx) {
      animationFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const particles = particlesRef.current;
    const mouse = mouseRef.current;
    const isMobile = width < 768;
    const connectionDistance = isMobile ? 80 : 120;
    const mouseInfluenceRadius = isMobile ? 100 : 150;

    // Update and draw particles
    particles.forEach((particle, i) => {
      // Mouse influence (subtle push/pull)
      const dx = mouse.x - particle.x;
      const dy = mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < mouseInfluenceRadius && distance > 0) {
        const force = (mouseInfluenceRadius - distance) / mouseInfluenceRadius * 0.02;
        particle.vx -= (dx / distance) * force;
        particle.vy -= (dy / distance) * force;
      }

      // Apply velocity with friction
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.99;
      particle.vy *= 0.99;

      // Bounce off edges
      if (particle.x < 0 || particle.x > width) {
        particle.vx *= -1;
        particle.x = Math.max(0, Math.min(width, particle.x));
      }
      if (particle.y < 0 || particle.y > height) {
        particle.vy *= -1;
        particle.y = Math.max(0, Math.min(height, particle.y));
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color.replace(')', `, ${particle.opacity})`).replace('hsl', 'hsla');
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j];
        const cdx = particle.x - other.x;
        const cdy = particle.y - other.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        
        if (cdist < connectionDistance) {
          const opacity = (1 - cdist / connectionDistance) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `hsla(200, 80%, 60%, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDimensions({ width, height });
      
      if (canvasRef.current) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
      
      initParticles(width, height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [animate, initParticles]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Canvas for particles */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
      />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--primary)/0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(217,91%,60%,0.06),transparent_50%)]" />
      
      {/* Grid pattern - subtle */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--muted)/0.15)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted)/0.15)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_70%,transparent_100%)]" />
      
      {/* Floating orbs - static on mobile for performance, animated on desktop */}
      <div className="absolute top-20 right-1/4 w-[200px] h-[200px] md:w-[500px] md:h-[500px] bg-primary/[0.05] rounded-full blur-[60px] md:blur-[100px]" />
      <div className="absolute bottom-20 left-1/4 w-[150px] h-[150px] md:w-[350px] md:h-[350px] bg-primary/[0.04] rounded-full blur-[50px] md:blur-[80px]" />
      <div className="hidden md:block absolute top-1/2 right-1/3 w-[250px] h-[250px] bg-primary/[0.04] rounded-full blur-[70px]" />
    </div>
  );
};

export default InteractiveBackground;
