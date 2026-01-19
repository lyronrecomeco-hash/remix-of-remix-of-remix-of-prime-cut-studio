import { memo, useEffect, useRef } from 'react';

/**
 * Genesis IA Interactive Background - Enhanced animated particles with mesh network effect
 */
const GenesisBackground = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
      pulsePhase: number;
      hue: number;
    }> = [];

    let floatingOrbs: Array<{
      x: number;
      y: number;
      radius: number;
      speed: number;
      angle: number;
      opacity: number;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      floatingOrbs = [];
      
      // More particles for denser effect
      const particleCount = Math.floor((canvas.width * canvas.height) / 12000);

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          radius: Math.random() * 2.5 + 0.8,
          opacity: Math.random() * 0.5 + 0.2,
          pulsePhase: Math.random() * Math.PI * 2,
          hue: Math.random() * 40 - 20, // Slight color variation
        });
      }

      // Add floating orbs for ambient effect
      for (let i = 0; i < 5; i++) {
        floatingOrbs.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 200 + 150,
          speed: Math.random() * 0.0005 + 0.0002,
          angle: Math.random() * Math.PI * 2,
          opacity: Math.random() * 0.04 + 0.02,
        });
      }
    };

    let time = 0;

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      // Get primary color from CSS
      const primary = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary')
        .trim();

      // Draw floating orbs with smooth movement
      floatingOrbs.forEach((orb) => {
        orb.angle += orb.speed;
        const offsetX = Math.sin(orb.angle) * 100;
        const offsetY = Math.cos(orb.angle * 0.7) * 80;

        const gradient = ctx.createRadialGradient(
          orb.x + offsetX,
          orb.y + offsetY,
          0,
          orb.x + offsetX,
          orb.y + offsetY,
          orb.radius
        );
        gradient.addColorStop(0, `hsl(${primary} / ${orb.opacity * 1.5})`);
        gradient.addColorStop(0.4, `hsl(${primary} / ${orb.opacity * 0.5})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Draw subtle grid lines
      ctx.strokeStyle = `hsl(${primary} / 0.03)`;
      ctx.lineWidth = 0.5;
      const gridSize = 80;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw connections between particles (no mouse interaction)
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            const alpha = 0.12 * (1 - distance / 150);
            ctx.strokeStyle = `hsl(${primary} / ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        });
      });

      // Draw and update particles
      particles.forEach((particle) => {
        // Apply velocity with damping (no mouse interaction)
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Pulsing opacity
        const pulse = Math.sin(time * 2 + particle.pulsePhase) * 0.2 + 0.8;
        const currentOpacity = particle.opacity * pulse;

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${primary} / ${currentOpacity})`;
        ctx.fill();

        // Add glow to larger particles
        if (particle.radius > 1.8) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${primary} / ${currentOpacity * 0.1})`;
          ctx.fill();
        }
      });

      // Draw central glow effect
      const centerGradient = ctx.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.3,
        0,
        canvas.width * 0.5,
        canvas.height * 0.3,
        canvas.width * 0.6
      );
      centerGradient.addColorStop(0, `hsl(${primary} / 0.05)`);
      centerGradient.addColorStop(0.5, `hsl(${primary} / 0.02)`);
      centerGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    resizeCanvas();
    createParticles();
    drawParticles();

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
});

GenesisBackground.displayName = 'GenesisBackground';

export default GenesisBackground;