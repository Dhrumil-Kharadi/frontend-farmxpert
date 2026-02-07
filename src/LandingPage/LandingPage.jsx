/* ============================================ */
/* FILE 2: LandingPage.jsx (Complete) */
/* ============================================ */

import React from 'react';
import { ArrowRight, Droplets, Thermometer, FlaskRound } from 'lucide-react';
import '../styles/LandingPage/LandingPage.css';
import NavbarLanding from './NavbarLanding';

export default function Home() {
  // Function to render animated hero title
  const renderAnimatedTitle = (text) => {
    const words = text.split(' ');
    
    return (
      <h1 className="hero-title-animated-landingpage">
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="hero-title-word-landingpage">
            {word.split('').map((char, charIndex) => {
              // Calculate delay based on word and character position
              const totalCharsBeforeWord = words
                .slice(0, wordIndex)
                .reduce((sum, w) => sum + w.length, 0);
              const charDelay = (totalCharsBeforeWord + charIndex) * 0.05;

              return (
                <span
                  key={charIndex}
                  className="hero-title-char-landingpage"
                  style={{
                    animationDelay: `${charDelay}s`,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </span>
        ))}
      </h1>
    );
  };

  // Function to handle smooth scroll to features section
  const scrollToFeatures = (e) => {
    e.preventDefault();
    const featuresSection = document.querySelector('.features-section-landingpage');
    if (featuresSection) {
      featuresSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="landing-page-wrapper-landingpage">
      <NavbarLanding />

      {/* Fixed Background Image */}
      <div className="landing-fixed-bg-landingpage">
        <img
          src="/landingPage-background-image.jpeg"
          alt="Hero Background"
          className="landing-hero-bg-landingpage"
        />
      </div>

      {/* Scrollable Content */}
      <div className="landing-scrollable-content-landingpage">
        {/* Hero Section */}
        <section className="hero-section-landingpage">
          <div className="hero-content-landingpage">
            {renderAnimatedTitle("Smart Agriculture for the Modern Farmer")}
            
            <p className="hero-subtitle-landingpage">
              Monitor your soil conditions, receive personalized recommendations, and optimize your crop yield with our
              advanced farming platform powered by cutting-edge technology.
            </p>
            <div className="hero-actions-landingpage">
              <a href="/register" className="btn-landingpage btn-primary-landingpage">
                Get Started <ArrowRight className="ml-2" style={{ width: "16px", height: "16px" }} />
              </a>
              <button onClick={scrollToFeatures} className="btn-landingpage btn-secondary-1-landingpage">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section-landingpage">
          <div className="container">
            <div className="section-header-landingpage">
              <h2 className="section-title-landingpage">Smart Farming Features</h2>
              <p className="section-subtitle-landingpage">
                Our platform provides everything you need to monitor and optimize your farm's performance with real-time
                data and AI-powered insights.
              </p>
            </div>
            <div className="features-grid-landingpage">
              <div className="feature-card-landingpage animate-fade-in-up">
                <div className="feature-icon-landingpage">
                  <Droplets />
                </div>
                <h3 className="feature-title-landingpage">Soil Moisture Monitoring</h3>
                <p className="feature-description-landingpage">
                  Track soil moisture levels in real-time with precision sensors and receive intelligent watering
                  recommendations based on crop type and weather conditions.
                </p>
              </div>
              <div className="feature-card-landingpage animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <div className="feature-icon-landingpage">
                  <FlaskRound />
                </div>
                <h3 className="feature-title-landingpage">pH Level Analysis</h3>
                <p className="feature-description-landingpage">
                  Monitor soil pH levels continuously and get personalized fertilizer recommendations for optimal crop
                  growth and maximum yield potential.
                </p>
              </div>
              <div className="feature-card-landingpage animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                <div className="feature-icon-landingpage">
                  <Thermometer />
                </div>
                <h3 className="feature-title-landingpage">Temperature Tracking</h3>
                <p className="feature-description-landingpage">
                  Keep track of soil temperature variations and receive alerts for extreme conditions that could affect
                  your crops' health and growth.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Logo with Text Section */}
        <section className="logo-section-landingpage">
          <div className="container">
            <img
              className="logo-with-text-img-landingpage"
              src="/logo-text.png"
              alt="FarmXpert"
            />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works-section-landingpage">
          <div className="container">
            <div className="section-header-landingpage">
              <h2 className="section-title-landingpage">How It Works</h2>
              <p className="section-subtitle-landingpage">
                Our platform makes it easy to monitor and optimize your farm's performance with a simple three-step
                process.
              </p>
            </div>
            <div className="features-grid-landingpage">
              <div className="feature-card-landingpage glass" style={{ animationDelay: "0s" }}>
                <div className="feature-icon-landingpage">
                  <span>1</span>
                </div>
                <h3 className="feature-title-landingpage">Create an Account</h3>
                <p className="feature-description-landingpage">
                  Sign up as a farmer and verify your email to get started with our comprehensive agriculture platform.
                </p>
              </div>
              <div className="feature-card-landingpage glass" style={{ animationDelay: "0.2s" }}>
                <div className="feature-icon-landingpage">
                  <span>2</span>
                </div>
                <h3 className="feature-title-landingpage">Set Up Your Farm</h3>
                <p className="feature-description-landingpage">
                  Add your farm details and let our admin team input your soil data while we prepare sensor integration.
                </p>
              </div>
              <div className="feature-card-landingpage glass" style={{ animationDelay: "0.4s" }}>
                <div className="feature-icon-landingpage">
                  <span>3</span>
                </div>
                <h3 className="feature-title-landingpage">Get Insights</h3>
                <p className="feature-description-landingpage">
                  View your dashboard for real-time soil data, personalized recommendations, and actionable farming
                  insights.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-dark-bg-landingpage" style={{ padding: "6rem 0", color: "white" }}>
          <div className="container text-center">
            <h2 className="section-title-landingpage">Ready to Optimize Your Farm?</h2>
            <p
              style={{
                fontSize: "1.125rem",
                marginBottom: "2rem",
                opacity: 0.9,
                maxWidth: "600px",
                margin: "0 auto 2rem",
                color: "var(--landing-subtitle-color)",
              }}
            >
              Join thousands of farmers who are already using our platform to improve their crop yield and farming
              efficiency.
            </p>
            <a
              href="/register"
              className="btn-landingpage-new"
              style={{
                fontSize: "1.125rem",
                padding: "16px 32px",
              }}
            >
              Get Started Today
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}