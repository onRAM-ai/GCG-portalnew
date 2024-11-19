"use client";

import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  opacity: number;
  fadeDirection: 'in' | 'out';
  fadeSpeed: number;
  lifespan: number;
  maxLifespan: number;
}

export function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  const createParticle = (x?: number, y?: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.2 + 0.1;
    const maxLifespan = Math.random() * 300 + 200;

    return {
      x: x ?? Math.random() * dimensions.width,
      y: y ?? Math.random() * dimensions.height,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      size: Math.random() * 2 + 1,
      opacity: 0,
      fadeDirection: 'in',
      fadeSpeed: Math.random() * 0.005 + 0.002,
      lifespan: 0,
      maxLifespan
    };
  };

  const initParticles = () => {
    const particleCount = Math.floor((dimensions.width * dimensions.height) / 20000);
    particlesRef.current = Array.from({ length: particleCount }, () => createParticle());
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.size
    );
    
    gradient.addColorStop(0, `rgba(255, 215, 0, ${particle.opacity})`);
    gradient.addColorStop(0.4, `rgba(255, 200, 0, ${particle.opacity * 0.6})`);
    gradient.addColorStop(1, `rgba(255, 170, 0, 0)`);

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.8})`;
    ctx.fill();
  };

  const updateParticle = (particle: Particle): Particle | null => {
    particle.x += particle.dx;
    particle.y += particle.dy;

    if (particle.fadeDirection === 'in') {
      particle.opacity += particle.fadeSpeed;
      if (particle.opacity >= 0.7) {
        particle.fadeDirection = 'out';
      }
    } else {
      particle.opacity -= particle.fadeSpeed * 0.5;
    }

    particle.lifespan++;

    if (
      particle.opacity <= 0 ||
      particle.x < -50 ||
      particle.x > dimensions.width + 50 ||
      particle.y < -50 ||
      particle.y > dimensions.height + 50 ||
      particle.lifespan >= particle.maxLifespan
    ) {
      return createParticle();
    }

    return particle;
  };

  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    particlesRef.current = particlesRef.current
      .map(particle => updateParticle(particle))
      .filter((particle): particle is Particle => particle !== null);

    particlesRef.current.forEach(particle => {
      drawParticle(ctx, particle);
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      
      const { innerWidth: width, innerHeight: height } = window;
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      setDimensions({ width, height });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      initParticles();
      animate();
      setIsLoaded(true);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'linear-gradient(to bottom, #0f0f1a, #1a1a2e)',
      }}
    />
  );
}