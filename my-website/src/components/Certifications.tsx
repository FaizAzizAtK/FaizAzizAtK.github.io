import React from 'react';
import { useIntersectionObserver } from './utils/AnimationUtils';

interface CertificationProps {
  year: string;
  title: string;
  issuer: string;
}

const CertificationItem: React.FC<CertificationProps> = ({ year, title, issuer }) => {
  return (
    <div className="cert-item animate">
      <span className="cert-year">{year}</span>
      <div className="cert-content">
        <h3>{title}</h3>
        <p>{issuer}</p>
      </div>
    </div>
  );
};

const Certifications: React.FC = () => {
  // Use the intersection observer hook for animations
  useIntersectionObserver();
  
  const certifications = [
    {
      year: "2024",
      title: "IBM Quantum Conversations",
      issuer: "Credly"
    },
    {
      year: "2024",
      title: "IBM Watsonx Essentials",
      issuer: "Credly"
    },
    {
      year: "2023",
      title: "Web Development Experience",
      issuer: "Forage"
    },
    {
      year: "2019",
      title: "DELF B2",
      issuer: "DELF DALF Suisse"
    }
  ];

  return (
    <section id="certifications" className="section alt-bg">
      <div className="container">
        <h2 className="animate">Certifications</h2>
        <div className="cert-grid">
          {certifications.map((cert, index) => (
            <CertificationItem 
              key={index}
              year={cert.year}
              title={cert.title}
              issuer={cert.issuer}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;