import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Education from './components/Education';
import Skills from './components/Skills';
import Certifications from './components/Certifications';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { animateShapesExplosion } from './components/utils/AnimationUtils';

const App: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const heroRef = useRef<HTMLDivElement>(null); // reference to Hero container
  const mouseRef = useRef<HTMLDivElement>(null); // reference to the fake mouse

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(progress);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate').forEach(el => observer.observe(el));
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.querySelectorAll('.animate').forEach(el => observer.unobserve(el));
    };
  }, []);

  // Simulate mouse click and explosion on page load
  useEffect(() => {
    if (mouseRef.current && heroRef.current) {
      const nameElement = heroRef.current.querySelector('.name-wave') as HTMLElement;
      if (!nameElement) return;

      const nameBox = nameElement.getBoundingClientRect();
      const targetX = nameBox.left - 20;
      const targetY = nameBox.top - 30;
      
      // STEP 1: Initialize and position mouse at starting point
      mouseRef.current.style.transition = 'none'; // Disable transition for instant positioning
      mouseRef.current.style.opacity = '1';
      mouseRef.current.style.left = '0';
      mouseRef.current.style.top = '0';
      
      // Small delay to ensure initial positioning is complete
      setTimeout(() => {
        if (!mouseRef.current) return;
        
        // STEP 2: Move mouse to target with animation
        mouseRef.current.style.transition = 'left 2s cubic-bezier(0.25, 0.8, 0.25, 1), top 2s cubic-bezier(0.25, 0.8, 0.25, 1)';
        mouseRef.current.style.left = `${targetX}px`;
        mouseRef.current.style.top = `${targetY}px`;
        
        // Wait for mouse to reach target position
        setTimeout(() => {
          if (!heroRef.current || !mouseRef.current) return;
          
          // STEP 3: Trigger explosion but keep mouse visible
          animateShapesExplosion(heroRef.current, targetX, targetY);
          
          // STEP 4: Wait a moment then fade out the mouse
          setTimeout(() => {
            if (mouseRef.current) {
              mouseRef.current.style.transition = 'opacity 1.5s ease-out';
              mouseRef.current.style.opacity = '0';
            }
          }, 1000); // Wait 1 second after explosion before fading out
        }, 2000); // Time for mouse to move to target position (now 2s for smoothness)
      }, 100); // Small delay before starting movement
    }
  }, []);

  // Handle user click to trigger explosion
  const handleExplosion = (e: React.MouseEvent) => {
    if (heroRef.current) {
      // Use page coordinates (include scroll position)
      const heroRect = heroRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      const centerX = e.pageX - window.pageXOffset;
      const centerY = e.pageY - scrollTop;
      
      animateShapesExplosion(heroRef.current, centerX, centerY);
    }
  };

  return (
    <div className="app">
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }}></div>
      <Navbar />
      {/* Pass refs and click handler */}
      <Hero ref={heroRef} mouseRef={mouseRef} onClick={handleExplosion} />
      <main className="content">
        <About />
        <Experience />
        <Projects />
        <Education />
        <Skills />
        <Certifications />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;
