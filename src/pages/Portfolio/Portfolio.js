import React, { useRef, useState, forwardRef, useEffect } from 'react';
import Footer from '../../components/Layout/Footer/Footer';
import Header from '../../components/Layout/Header/Header';
import Card from './Components/Card';
import ProjectCard from "./Components/ProjectCard";
import SkillCategory from './Components/SkillCategory ';
import TestimonialCard from './Components/TestimonialCard';

// Welcome Section
const Welcome = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-purple-700 text-white text-center pt-10 pb-4">
            <h1 className="text-4xl font-bold">Welcome to My Portfolio</h1>
            <p className="text-xl mt-2">Discover my world of coding and design</p>
            {/* Toggleable paragraph */}
            <div>
                {isOpen && (
                    <p className="text-sm mt-2 mx-3 ">
                        In both the realms of time and space, we are but mere specks of dust, influencing the limited matter around us while being affected by our surroundings. Our fleeting lives are filled with experiences, both desired and undesired, and every choice we make is grounded in our own capabilities and knowledge. As we journey through life, we refine ourselves with experience, striving for greater recognition, following our hearts, and cultivating our inner selves.
                    </p>
                )}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-purple-200 hover:text-white mt-2"
                >
                    {isOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

// About Me Section
const About = ({ scrollToContact }) => {
    return (
        <div className="flex bg-gradient-to-r from-blue-300 to-cyan-300 p-10 justify-between items-center">
            <div className='w-full lg:w-[50%]'>
                <h2 className="text-3xl font-semibold text-white">About Me</h2>
                <p className="m-3 mt-2 text-white">I am a passionate software engineer with a strong foundation in computer science and software engineering. My academic journey has equipped me with a deep understanding of web design, user experience, object-oriented design, data management, and various programming languages. I thrive on creating efficient, user-friendly solutions that make a difference.</p>
                <div className="mt-12 space-x-4">
                    <button 
                        className="bg-blue-700 text-white font-bold py-2 px-4 rounded hover:bg-blue-800 transition duration-300"
                        onClick={scrollToContact}
                    >
                        Contact Me
                    </button>
                    <button 
                        className="bg-transparent border-2 border-blue-700 text-blue-700 font-semibold py-2 px-4 rounded hover:bg-blue-700 hover:text-white transition duration-300"
                        onClick={() => window.open(`${process.env.PUBLIC_URL}/me/resume_Jih.pdf`, '_blank')}
                    >
                        Resume
                    </button>
                </div>
            </div>
            <div className='w-[50%] lg:block hidden'>
                <img src={`${process.env.PUBLIC_URL + "/images/me.jpg"}`} alt="About Me" className="mt-4 rounded"/>
            </div>
        </div>
    );
};

// Education Section
const Education = () => {
    const [educationData, setEducationData] = useState([]);

    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/me/schools.json`) // Adjust the path if your JSON file is located elsewhere
        .then(response => response.json())
        .then(data => setEducationData(data))
        .catch(error => console.error('Error loading education data:', error));
    }, []);

    return (
        <div className="p-10">
            <h2 className="text-3xl font-semibold">Where I Acquired Knowledge</h2>
            <p className='text-sm mt-2 text-gray-400 w-[70%]'>Below are some of the projects I've worked on, showcasing my skills and expertise in software development and engineering:</p>
            <div className="flex flex-row flex-wrap justify-center items-center content-center self-stretch">
                <div className='flex-[4] hidden sm:inline'>
                    <img src={`${process.env.PUBLIC_URL + "/images/edu.jpg"}`} alt="Placeholder" className="w-full h-auto rounded-[30%]" />
                </div>
                <div className='flex-[8] ml-10'>
                {educationData.map((edu, index) => (
                    <Card
                    key={index}
                    title={edu.title}
                    region={edu.region}
                    major={edu.major}
                    destitle={edu.destitle}
                    description={edu.description}
                    imageUrl={edu.imageUrl}
                    linkUrl={edu.linkUrl}
                    />
                ))}
                </div>
                {/* Add more logos as needed */}
            </div>
        </div>
    );
};

// Projects Section
const Projects = () => {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/me/projects.json`)
        .then(response => response.json())
        .then(data => setProjects(data))
        .catch(error => console.error('Error loading the projects data:', error));
    }, []);

    return (
        <div className="p-10">
            <h2 className="text-3xl font-semibold">What I do</h2>
            <p className='text-sm mt-2 text-gray-400 w-[70%]'>Below are some of the projects I've worked on, showcasing my skills and expertise in software development and engineering:</p>
            <div className="flex flex-col flex-wrap justify-between">
                {projects.map((project, index) => (
                    <ProjectCard
                    key={index}
                    title={project.title}
                    description={project.description}
                    listItems={project.listItems}
                    imageUrl={project.imageUrl}
                    technology={project.technology}
                    period={project.period}
                    path={project.path}
                    />
                ))}
            </div>
            {/* <div className='flex justify-center items-center'>
                <button className="mt-6 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
                    Show more
                </button>
            </div> */}
        </div>
    );
};

// Skills Section
const Skills = () => {
    const [skillsData, setSkillsData] = useState({ languages: [], frameworks: [], tools: [] });

    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/me/skills.json`)
            .then(response => response.json())
            .then(data => setSkillsData(data))
            .catch(error => console.error('Error loading skills data:', error));
    }, []);

    return (
        <div className="p-10">
            <h2 className="text-3xl font-semibold mb-5">My Skills</h2>
            <div className="flex flex-row flex-wrap justify-around">
                <SkillCategory title="Languages" skills={skillsData.languages} />
                <SkillCategory title="Frameworks" skills={skillsData.frameworks} />
                <SkillCategory title="Tools and Systems" skills={skillsData.tools} />
            </div>
        </div>
    );
};

// Testimonials Section
const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([]);

    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/me/testimonial.json`)  // Adjust the path if your JSON file is located elsewhere
            .then(response => response.json())
            .then(data => setTestimonials(data))
            .catch(error => console.error('Error loading testimonials data:', error));
    }, []);

    return (
        <div className="bg-white p-10">
            <h2 className="text-3xl font-semibold mb-5">What People Say About Me</h2>
            <p className='text-sm mt-2 text-gray-400 w-[70%]'>Here are some evaluations of me. See me more fully through the eyes of others.</p>
            <div className="flex flex-row justify-center items-center flex-wrap gap-8 pt-8 px-5">
                {testimonials.map((testimonial, index) => (
                    <TestimonialCard key={index} image={testimonial.image} name={testimonial.name} text={testimonial.text} />
                ))}
            </div>
        </div>
    );
};

// Contact Me Section
const Contact = forwardRef((props, ref) => {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');

    const email = "sheng.jih@northeastern.edu";

    const handleSendEmail = () => {
        window.location.href = mailtoLink;
        setName('');
        setMessage('');
    };

    // 构建 mailto 链接
    const mailtoLink = `mailto:${email}?subject=Contact from ${name}&body=${message}`;

    return (
        <div className='flex flex-row justify-center items-center mt-8 mb-10'>
            <div className='flex-1 w-[80%] ml-5 hidden md:inline'>
                <img src={`${process.env.PUBLIC_URL + "/images/contact.jpg"}`} alt="Contact me" className="w-full h-auto rounded" />
            </div>
            <div ref={ref} className="flex-1 bg-blue-500 text-white p-10 ml-10 mr-10 rounded">
                <h2 className="text-3xl font-semibold">Contact Me</h2>
                <div className="mt-4">
                    <input 
                        type="text" 
                        placeholder="Your Name" 
                        className="p-2 rounded text-black w-full"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <textarea 
                        placeholder="Your Message" 
                        className="p-2 mt-2 rounded text-black w-full"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <a href={mailtoLink} className="bg-white text-blue-500 p-2 mt-2 rounded w-full block text-center" onClick={handleSendEmail}>
                        Send Email
                    </a>
                </div>
            </div>
        </div>
    );
});

// Main Portfolio Component
function Portfolio () {
    const contactRef = useRef(null);

    const scrollToContact = () => {
        contactRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
            <Header />
            <div className='w-[80%] bg-white shadow-lg rounded'>
                <Welcome />
                <About scrollToContact={scrollToContact}/>
                <Education />
                <Projects />
                <Skills />
                <Testimonials />
                <Contact ref={contactRef} />
            </div>
            <Footer />
        </div>
    );
};

export default Portfolio;