import { useEffect } from 'react';

export const createShapes = (container: HTMLElement, count: number = 20) => {
  const shapes = ['circle', 'square', 'triangle'];
  const colors = ['rgba(0, 195, 255, 0.6)', 'rgba(0, 102, 255, 0.5)', 'rgba(0, 76, 190, 0.6)'];

  for (let i = 0; i < count; i++) {
    const shape = document.createElement('div');
    const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
    shape.className = `shape ${shapeType}`;

    const size = Math.floor(Math.random() * 40) + 10;
    shape.style.width = `${size}px`;
    shape.style.height = `${size}px`;

    const moveX = (Math.random() - 0.5) * 200;
    const moveY = (Math.random() - 0.5) * 200;

    shape.style.setProperty('--move-x', `${moveX}px`);
    shape.style.setProperty('--move-y', `${moveY}px`);

    if (shapeType !== 'triangle') {
      shape.style.background = colors[Math.floor(Math.random() * colors.length)];
    } else {
      shape.style.borderBottomColor = colors[Math.floor(Math.random() * colors.length)];
    }

    container.appendChild(shape);
    setTimeout(() => shape.classList.add('exploding'), Math.random() * 200);
  }
};

export const animateShapesExplosion = (container: HTMLElement, centerX: number, centerY: number) => {
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const shapeX = ((centerX - rect.left) / rect.width) * 100;
  const shapeY = ((centerY - rect.top) / rect.height) * 100;

  createShapes(container, 30);
  const lastShapes = container.querySelectorAll('.shape:not(.positioned)');

  lastShapes.forEach((shape) => {
    (shape as HTMLElement).style.left = `${shapeX}%`;
    (shape as HTMLElement).style.top = `${shapeY}%`;
    shape.classList.add('positioned');
  });
};

export const useIntersectionObserver = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate').forEach(el => observer.observe(el));

    return () => {
      document.querySelectorAll('.animate').forEach(el => observer.unobserve(el));
    };
  }, []);
};