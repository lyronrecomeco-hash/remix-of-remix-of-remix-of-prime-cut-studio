import { memo, useEffect, useRef } from 'react';

/**
 * Genesis IA Interactive Background - Modern animated particles with connections
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
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 20000);

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2.5 + 1,
          opacity: Math.random() * 0.4 + 0.15,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    let time = 0;

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.008;

      // Get primary color from CSS
      const primary = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary')
        .trim();

      // Draw ambient glow orbs
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.2,
        canvas.height * 0.3,
        0,
        canvas.width * 0.2,
        canvas.height * 0.3,
        canvas.width * 0.4
      );
      gradient1.addColorStop(0, `hsl(${primary} / 0.06)`);
      gradient1.addColorStop(0.5, `hsl(${primary} / 0.02)`);
      gradient1.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.8,
        canvas.height * 0.7,
        0,
        canvas.width * 0.8,
        canvas.height * 0.7,
        canvas.width * 0.5
      );
      gradient2.addColorStop(0, `hsl(${primary} / 0.04)`);
      gradient2.addColorStop(0.5, `hsl(${primary} / 0.015)`);
      gradient2.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Pulsing opacity
        const pulse = Math.sin(time + particle.pulsePhase) * 0.15 + 0.85;
        const currentOpacity = particle.opacity * pulse;

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${primary} / ${currentOpacity})`;
        ctx.fill();

        // Add subtle glow to larger particles
        if (particle.radius > 2) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${primary} / ${currentOpacity * 0.15})`;
          ctx.fill();
        }

        // Draw connections
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            const alpha = 0.08 * (1 - distance / 120);
            ctx.strokeStyle = `hsl(${primary} / ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

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
      style={{ opacity: 0.6 }}
    />
  );
});

GenesisBackground.displayName = 'GenesisBackground';

export default GenesisBackground;
