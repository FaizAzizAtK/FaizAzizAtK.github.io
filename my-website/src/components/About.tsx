import React from 'react';
import { useIntersectionObserver } from './utils/AnimationUtils';

const About: React.FC = () => {
    useIntersectionObserver();

    return (
        <section id="about" className="section">
            <div className="container">
                <div>
                    <h2 className="animate">A Bit About Me</h2>
                    <p className="animate">
                        I've always loved being creative, whether it's building something new, solving a tricky problem, or finding a fresh angle on an old idea. As a Computer Science student, I get excited about applying that creativity in ways that are both meaningful and valuable. I'm passionate about working on real-world projects that challenge me and help me grow, especially in collaborative environments where ideas flow freely and everyone pushes each other to do better. I'm always looking for opportunities that let me learn, experiment, and make an impact, no matter how big or small. My ultimate goal is to be a world class engineer – to continuously develop my skills, innovate, and contribute to work that truly matters.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default About;
