import Header from '../components/Header';
import { Github, Linkedin, FileText, ExternalLink } from 'lucide-react';
import './About.css';

export default function About() {
    return (
        <div className="about-page">
            <Header currentPage="about" />

            <main className="about-main">
                <section className="about-hero">
                    <h1 className="about-title">About URL Status Checker</h1>
                    <p className="about-subtitle">A modern web application for monitoring website status and performance</p>
                </section>

                <section className="project-info">
                    <div className="info-card vista-card">
                        <h2 className="card-title">Project Overview</h2>
                        <p className="card-text">
                            URL Status Checker is a real-time website monitoring tool designed to help developers and system administrators track the status and performance of websites. With a modern Windows Vista-inspired interface, it provides quick insights into website availability, response times, and historical performance data.
                        </p>
                    </div>
                </section>

                <section className="technologies-section">
                    <h2 className="section-title">Technologies Used</h2>

                    <div className="tech-grid">
                        <div className="tech-card vista-card hover-lift">
                            <h3 className="tech-category">Frontend</h3>
                            <ul className="tech-list">
                                <li>React 19</li>
                                <li>TypeScript</li>
                                <li>Tailwind CSS 4</li>
                                <li>Vite</li>
                                <li>Wouter (Routing)</li>
                                <li>Lucide React (Icons)</li>
                            </ul>
                        </div>

                        <div className="tech-card vista-card hover-lift">
                            <h3 className="tech-category">Design</h3>
                            <ul className="tech-list">
                                <li>Glassmorphism</li>
                                <li>Windows Vista Aesthetic</li>
                                <li>Custom CSS Animations</li>
                                <li>Responsive Design</li>
                                <li>Modern UI Components</li>
                                <li>Segoe UI Typography</li>
                            </ul>
                        </div>

                        <div className="tech-card vista-card hover-lift">
                            <h3 className="tech-category">Features</h3>
                            <ul className="tech-list">
                                <li>Real-time Status Checking</li>
                                <li>Historical Data Tracking</li>
                                <li>Performance Metrics</li>
                                <li>Top 10 Websites</li>
                                <li>Random Profile System</li>
                                <li>Responsive Mobile UI</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="developer-section">
                    <h2 className="section-title">About the Developer</h2>

                    <div className="developer-card vista-card">
                        <div className="developer-content">
                            <div className="developer-info">
                                <h3 className="developer-name">Vitória Tenório</h3>
                                <p className="developer-role">Software Developer</p>
                                <p className="developer-bio">
                                    Passionate about building intuitive and creative user interfaces and maintaining clean, scalable code.
                                </p>
                            </div>

                            <div className="developer-links">
                                <h4 className="links-title">Connect</h4>
                                <div className="links-grid">
                                    <a href="#" className="link-button">
                                        <Linkedin size={20} />
                                        <span>LinkedIn</span>
                                        <ExternalLink size={16} />
                                    </a>
                                    <a href="#" className="link-button">
                                        <Github size={20} />
                                        <span>GitHub</span>
                                        <ExternalLink size={16} />
                                    </a>
                                    <a href="#" className="link-button">
                                        <FileText size={20} />
                                        <span>Resume</span>
                                        <ExternalLink size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="features-section">
                    <h2 className="section-title">Key Features</h2>

                    <div className="features-grid">
                        <div className="feature-card vista-card">
                            <div className="feature-icon">⚡</div>
                            <h3 className="feature-title">Fast Checking</h3>
                            <p className="feature-description">Get instant status updates on website availability and performance</p>
                        </div>

                        <div className="feature-card vista-card">
                            <div className="feature-icon">📊</div>
                            <h3 className="feature-title">Historical Data</h3>
                            <p className="feature-description">Track performance trends over time with comprehensive historical records</p>
                        </div>

                        <div className="feature-card vista-card">
                            <div className="feature-icon">🎨</div>
                            <h3 className="feature-title">Modern Design</h3>
                            <p className="feature-description">Beautiful glassmorphic interface inspired by Windows Vista</p>
                        </div>

                        <div className="feature-card vista-card">
                            <div className="feature-icon">📱</div>
                            <h3 className="feature-title">Responsive</h3>
                            <p className="feature-description">Works seamlessly on desktop, tablet, and mobile devices</p>
                        </div>

                        <div className="feature-card vista-card">
                            <div className="feature-icon">👤</div>
                            <h3 className="feature-title">Profile System</h3>
                            <p className="feature-description">Randomized user profiles that change with every interaction</p>
                        </div>

                        <div className="feature-card vista-card">
                            <div className="feature-icon">🔍</div>
                            <h3 className="feature-title">Easy Search</h3>
                            <p className="feature-description">Simple and intuitive URL search with instant results</p>
                        </div>
                    </div>
                </section>

                <section className="footer-info">
                    <div className="info-card vista-card">
                        <h3 className="card-title">License & Credits</h3>
                        <p className="card-text">
                            This project is built with React and modern web technologies. The design is inspired by the iconic Windows Vista interface, reimagined with contemporary design principles and a vibrant pink color palette.
                        </p>
                        <p className="card-text">
                            All assets, including logos and profile images, were made by the developer using Photoshop/Figma for this project. The application is fully responsive and optimized for all devices.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
