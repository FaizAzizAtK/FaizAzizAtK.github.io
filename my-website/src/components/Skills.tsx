import React from 'react';
import { useIntersectionObserver } from './utils/AnimationUtils';

interface SkillCategoryProps {
  title: string;
  skills: string[];
}

const SkillCategory: React.FC<SkillCategoryProps> = ({ title, skills }) => {
  return (
    <>
      <h3 className="subheading animate">{title}</h3>
      <div className="skills-grid">
        {skills.map((skill, index) => (
          <div key={index} className="skill-tag animate">{skill}</div>
        ))}
      </div>
    </>
  );
};

const Skills: React.FC = () => {
  // Use the intersection observer hook for animations
  useIntersectionObserver();
  
  const technicalSkills = [
    "Python", "Java", "HTML", "CSS", "TypeScript", "React", "Next.js", 
    "Tailwind", "Hadoop / Spark", "Webflow", "Figma", "Git & GitHub", 
    "OOP", "Data Structures & Algorithms"
  ];
  
  const languages = ["English (Fluent)", "French (Fluent)", "Urdu (Conversational)"];

  return (
    <section id="skills" className="section">
      <div className="container">
        <h2 className="animate">Skills & Languages</h2>
        <div className="skills-container">
          <SkillCategory title="Technical Skills" skills={technicalSkills} />
          <SkillCategory title="Spoken Languages" skills={languages} />
        </div>
      </div>
    </section>
  );
};

export default Skills;