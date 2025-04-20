import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Faiz Aziz</p>
    </footer>
  );
};

export default Footer;