import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import profileImg from '../assets/Profile_Bck2.png';
import EncryptedText from './EncryptedText';

// Hero component that forwards the ref and accepts mouseRef and onClick props
const Hero = forwardRef<HTMLDivElement, { mouseRef: React.RefObject<HTMLDivElement | null>, onClick: (e: React.MouseEvent) => void }>(({ mouseRef, onClick }, ref) => {
  const nameRef = useRef<HTMLHeadingElement | null>(null);

  const tags = ['Python', 'React', 'Front-end', 'Back-end', 'AI', 'Computer Science'];

  return (
    <header className="hero" ref={ref} onClick={onClick}>
      {/* Fake mouse animation */}
      <div ref={mouseRef} className="animated-mouse"></div>

      <div className="hero-content">
        <div className="hero-left">
          <h1 className="name-wave" ref={nameRef}>
            <span className="name-part">
              <span className="letter">F</span><span className="letter">A</span><span className="letter">I</span><span className="letter">Z</span>
            </span>
            <span className="name-part">
              <span className="letter">A</span><span className="letter">Z</span><span className="letter">I</span><span className="letter">Z</span>
            </span>
          </h1>
          <div className="tags-container">
            {tags.map((tag, index) => (
              <div className="tag-bubble" key={index}>
                <EncryptedText className="encrypted-text" text={tag} delay={10} speed={100} />
              </div>
            ))}
          </div>
          <p className="intro animate">
            Graduating Computer Science student who's passionate about finding the craftsmanship in problem-solving with hands-on experience in AI (IBM WatsonX, OpenAI, etc.), front-end (React, TypeScript, etc.) and back-end (Python) engineering.
          </p>
        </div>

        <div className="hero-right animate">
          <div className="profile-icon top-left">
            <a href="https://www.linkedin.com/in/faiz-aziz-01524425a/" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" height="40" width="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.76 0 5-2.239 5-5v-14c0-2.761-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.5c-.967 0-1.75-.783-1.75-1.75s.783-1.75 1.75-1.75 1.75.783 1.75 1.75-.783 1.75-1.75 1.75zm13.5 11.5h-3v-5.5c0-1.104-.896-2-2-2s-2 .896-2 2v5.5h-3v-10h3v1.57c.61-.93 1.74-1.57 3-1.57 2.206 0 4 1.794 4 4v6z"/>
              </svg>
            </a>
          </div>

          <div className="profile-icon bottom-right">
            <a href="https://github.com/FaizAzizAtK" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" height="40" width="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .5C5.65 .5 .5 5.65 .5 12a11.5 11.5 0 0 0 7.85 10.96c.58.1.79-.25.79-.56v-2.01c-3.2.7-3.87-1.54-3.87-1.54a3.05 3.05 0 0 0-1.29-1.7c-1.05-.72.08-.71.08-.71a2.42 2.42 0 0 1 1.76 1.18 2.47 2.47 0 0 0 3.38.96 2.45 2.45 0 0 1 .73-1.53c-2.55-.29-5.23-1.28-5.23-5.7a4.47 4.47 0 0 1 1.18-3.1 4.18 4.18 0 0 1 .11-3.06s.96-.31 3.14 1.18a10.86 10.86 0 0 1 5.7 0c2.18-1.49 3.14-1.18 3.14-1.18a4.18 4.18 0 0 1 .11 3.06 4.47 4.47 0 0 1 1.18 3.1c0 4.43-2.69 5.41-5.25 5.69a2.75 2.75 0 0 1 .78 2.13v3.15c0 .31.21.66.79.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
              </svg>
            </a>
          </div>

          <div className="profile-bg-layer top"></div>
          <div className="profile-bg-layer bottom"></div>
          <img src={profileImg} alt="Faiz Aziz" className="profile-img" />
        </div>
      </div>
    </header>
  );
});

export default Hero;
