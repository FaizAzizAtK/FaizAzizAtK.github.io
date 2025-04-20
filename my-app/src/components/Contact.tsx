import React from 'react';
import { useIntersectionObserver } from './utils/AnimationUtils';

interface ContactItemProps {
  icon: string;
  text: string;
  link?: string;
}

const ContactItem: React.FC<ContactItemProps> = ({ icon, text, link }) => {
  if (link) {
    return (
      <a href={link} target={link.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="contact-item animate">
        <span className="contact-icon">{icon}</span>
        <span>{text}</span>
      </a>
    );
  }
  
  return (
    <div className="contact-item animate">
      <span className="contact-icon">{icon}</span>
      <span>{text}</span>
    </div>
  );
};

const Contact: React.FC = () => {
  // Use the intersection observer hook for animations
  useIntersectionObserver();
  
  const contactInfo = [
    {
      icon: "📧",
      text: "faizazizatk@gmail.com",
      link: "mailto:faizazizatk@gmail.com"
    },
    {
      icon: "📍",
      text: "London, UK"
    },
    {
      icon: "💼",
      text: "GitHub: FaizAzizAtK",
      link: "https://github.com/FaizAzizAtK"
    }
  ];

  return (
    <section id="contact" className="section">
      <div className="container">
        <h2 className="animate">Contact</h2>
        <div className="contact-grid">
          {contactInfo.map((item, index) => (
            <ContactItem 
              key={index}
              icon={item.icon}
              text={item.text}
              link={item.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contact;