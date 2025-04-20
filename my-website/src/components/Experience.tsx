import React from 'react';
import { useIntersectionObserver } from './utils/AnimationUtils';

interface TimelineItem {
  date: string;
  title: string;
  details: string[];
}

const Experience: React.FC = () => {
  useIntersectionObserver();
  
  const experiences: TimelineItem[] = [
    {
      date: "2019 - Present",
      title: "Mathematics Tutor – Tutor24",
      details: [
        "Track student progress and provide feedback to support goal setting",
        "Create personalised learning plans tailored to individual learning styles",
        "Organise group study sessions to promote collaborative learning",
        "Develop practice exams to help students prepare for assessments"
      ]
    },
    {
      date: "Jun - Sep 2024",
      title: "AI Engineer Intern – IBM",
      details: [
        "Built full-stack AI prototypes demonstrating how large language models could address client pain points across various industries.",
        "Collaborated closely with clients to understand their unique challenges, incorporating weekly feedback into improving the development of the prototype.",
        "Led front-end development and constructed data pipelines integrating LLMs, embedding models, vector databases, and API end-points.",
        "Contributed to a client prototype within the first two weeks, leading the demo that helped secure a $30,000 deal.",
        "Presented technical solutions to non-technical stakeholders, translating complex concepts into clear, actionable insights.",
        "Organized and led internal coding workshops to upskill non-technical team members and promote a culture of learning.",
        "Recognized as the \"Voice of the Interns\" for leadership, collaboration, and proactive problem-solving across teams.",
        "Tech Stack: Python, Next.js, React, TypeScript, JavaScript"
      ]
    },
    {
      date: "Jan - May 2024",
      title: "Web Developer – McCarthy & Brogan Solutions",
      details: [
        "Led the migration of the company website from Squarespace to Webflow, preserving original content while modernizing the design.",
        "Redesigned the site with a focus on clean visuals, polished layout, and engaging animations to elevate overall professionalism and user engagement.",
        "Worked directly with the co-founders, iterating on their feedback to improve UX flows, visual hierarchy, and content clarity.",
        "Presented trade-offs between aesthetics and usability to guide strategic design decisions aligned with business goals.",
        "Contributed to content refinement by suggesting ways to enhance messaging and structure for greater impact and readability."
      ]
    }
  ];

  return (
    <section id="experience" className="section alt-bg">
      <div className="container">
        <h2 className="animate">Experience</h2>
        <div className="timeline">
          {experiences.map((experience, index) => (
            <div className="timeline-item animate" key={index}>
              <div className="timeline-content">
                <span className="date">{experience.date}</span>
                <h3>{experience.title}</h3>
                <ul>
                  {experience.details.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;