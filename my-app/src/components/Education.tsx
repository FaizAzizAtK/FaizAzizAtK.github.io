import React from 'react';
import { useIntersectionObserver } from './utils/AnimationUtils';

interface EducationItemProps {
  institution: string;
  degree: string;
  period: string;
  grade: string;
  honors?: string;
  details: string[];
}

const EducationCard: React.FC<EducationItemProps> = ({ 
  institution, 
  degree, 
  period, 
  grade, 
  honors, 
  details 
}) => {
  return (
    <div className="card animate">
      <h3>{institution}</h3>
      <p className="highlight">{degree} ({period})</p>
      <div className="edu-info">
        <p>{grade}</p>
        {honors && <p>Honorable Mentions: {honors}</p>}
        {details.map((detail, index) => (
          <p key={index}>{detail}</p>
        ))}
      </div>
    </div>
  );
};

const Education: React.FC = () => {
  // Use the intersection observer hook for animations
  useIntersectionObserver();
  
  const educationItems = [
    {
      institution: "Queen Mary University of London",
      degree: "BSc Computer Science",
      period: "2022–2025",
      grade: "Expected: First (A)",
      honors: "Awarded best software engineering prototype",
      details: [
        "Key modules: Algorithms & Data Structures, Software Engineering, Big Data, Web Programming, GUIs, Neural Networks & Deep Learning and OOP"
      ]
    },
    {
      institution: "Institut International de Lancy",
      degree: "International Baccalaureate Diploma",
      period: "2020 - 2022",
      grade: "Final Grade: 39/45",
      honors: "Valedictorian",
      details: [
        "Higher: Mathematics AA (7/7), Physics (7/7), Visual Arts (5/7)",
        "Standard: English Lit. (6/7), Economics (5/7), French B (7/7)"
      ]
    }
  ];

  return (
    <section id="education" className="section alt-bg">
      <div className="container">
        <h2 className="animate">Education</h2>
        <div className="education-grid">
          {educationItems.map((item, index) => (
            <EducationCard 
              key={index}
              institution={item.institution}
              degree={item.degree}
              period={item.period}
              grade={item.grade}
              honors={item.honors}
              details={item.details}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;