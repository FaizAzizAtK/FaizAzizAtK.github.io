import React from 'react';
import { useIntersectionObserver } from './utils/AnimationUtils';

interface ProjectProps {
  title: string;
  highlight: string;
  githubLink: string;
  description: string[];
  techStack: string;
}

const ProjectCard: React.FC<ProjectProps> = ({ title, highlight, githubLink, description, techStack }) => {
  return (
    <div className="project-card animate">
      <h3>{title}</h3>
      <p className="highlight">{highlight}</p>
      <a 
        href={githubLink} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="github-icon-link"
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="40" width="40" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.85 10.96c.58.1.79-.25.79-.56v-2.01c-3.2.7-3.87-1.54-3.87-1.54a3.05 3.05 0 0 0-1.29-1.7c-1.05-.72.08-.71.08-.71a2.42 2.42 0 0 1 1.76 1.18 2.47 2.47 0 0 0 3.38.96 2.45 2.45 0 0 1 .73-1.53c-2.55-.29-5.23-1.28-5.23-5.7a4.47 4.47 0 0 1 1.18-3.1 4.18 4.18 0 0 1 .11-3.06s.96-.31 3.14 1.18a10.86 10.86 0 0 1 5.7 0c2.18-1.49 3.14-1.18 3.14-1.18a4.18 4.18 0 0 1 .11 3.06 4.47 4.47 0 0 1 1.18 3.1c0 4.43-2.69 5.41-5.25 5.69a2.75 2.75 0 0 1 .78 2.13v3.15c0 .31.21.66.79.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
        </svg>
      </a>
      <ul>
        {description.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
        <li><strong>Tech Stack:</strong> {techStack}</li>
      </ul>
    </div>
  );
};

const Projects: React.FC = () => {
  // Use the intersection observer hook for animations
  useIntersectionObserver();
  
  const projects = [
    {
      title: "SPART",
      highlight: "Streamlined Prompt Automation and Recommender Tool",
      githubLink: "https://github.com/FaizAzizAtK/SPART",
      description: [
        "Built a Python package for prompt engineering that automates prompt generation, evaluation, and optimization for LLM workflows through input-output examples.",
        "Developed a semantic and syntactic similarity evaluator leveraging metrics like ROUGE scores and embedding models to assess prompt effectiveness.",
        "Built a unified, token-aware interface for interacting with multiple LLM providers (OpenAI, Hugging Face, Cohere), enabling flexible model integration."
      ],
      techStack: "Python, LangChain, Pandas"
    },
    {
      title: "NovaTrade",
      highlight: "Prototype Social Crypto Trading Platform",
      githubLink: "https://github.com/FaizAzizAtK/NovaTrade-Trading-Application",
      description: [
        "Novatrade is a social cryptocurrency trading platform where users can buy, sell, and manage digital assets while interacting through a built-in social feed.",
        "The platform supports beginner and advanced traders with features like educational resources, simplified UI, stop loss, take profit, and limit orders.",
        "It includes secure user authentication, portfolio management, a support ticket system, and an admin panel for managing the platform."
      ],
      techStack: "Next.js, Prisma, Node.js, PostgreSQL"
    },
    {
      title: "Personal Portfolio Website",
      highlight: "You're looking at it!",
      githubLink: "https://github.com/FaizAzizAtK/FaizAzizAtK.github.io.git",
      description: [
        "Designed and developed a responsive portfolio with custom animations and scroll-based interactivity.",
        "Incorporates custom JavaScript explosion animation, progressive section reveals, and mobile-friendly design."
      ],
      techStack: "React, TypeScript, CSS"
    }
  ];

  return (
    <section id="projects" className="section">
      <div className="container">
        <h2 className="animate">Projects</h2>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <ProjectCard 
              key={index}
              title={project.title}
              highlight={project.highlight}
              githubLink={project.githubLink}
              description={project.description}
              techStack={project.techStack}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;