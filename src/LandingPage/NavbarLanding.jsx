import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import '../styles/LandingPage/NavbarLanding.css';
import '../styles/LandingPage/LandingPage.css';

// Theme Toggle SVG Icons Component
const ThemeIcon = ({ isDark }) => {
  if (isDark) {
    // Moon Icon
    return (
      <svg 
        className="theme-icon-navbarlanding" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M21.0672 11.8568L20.4253 11.469L21.0672 11.8568ZM12.1432 2.93276L11.7553 2.29085V2.29085L12.1432 2.93276ZM7.37554 20.013C7.017 19.8056 6.5582 19.9281 6.3508 20.2866C6.14339 20.6452 6.26591 21.104 6.62446 21.3114L7.37554 20.013ZM2.68862 17.3755C2.89602 17.7341 3.35482 17.8566 3.71337 17.6492C4.07191 17.4418 4.19443 16.983 3.98703 16.6245L2.68862 17.3755ZM21.25 12C21.25 17.1086 17.1086 21.25 12 21.25V22.75C17.9371 22.75 22.75 17.9371 22.75 12H21.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75V1.25C6.06294 1.25 1.25 6.06294 1.25 12H2.75ZM15.5 14.25C12.3244 14.25 9.75 11.6756 9.75 8.5H8.25C8.25 12.5041 11.4959 15.75 15.5 15.75V14.25ZM20.4253 11.469C19.4172 13.1373 17.5882 14.25 15.5 14.25V15.75C18.1349 15.75 20.4407 14.3439 21.7092 12.2447L20.4253 11.469ZM9.75 8.5C9.75 6.41182 10.8627 4.5828 12.531 3.57467L11.7553 2.29085C9.65609 3.5593 8.25 5.86509 8.25 8.5H9.75ZM12 2.75C11.9115 2.75 11.8077 2.71008 11.7324 2.63168C11.6686 2.56527 11.6538 2.50244 11.6503 2.47703C11.6461 2.44587 11.6482 2.35557 11.7553 2.29085L12.531 3.57467C13.0342 3.27065 13.196 2.71398 13.1368 2.27627C13.0754 1.82126 12.7166 1.25 12 1.25V2.75ZM21.7092 12.2447C21.6444 12.3518 21.5541 12.3539 21.523 12.3497C21.4976 12.3462 21.4347 12.3314 21.3683 12.2676C21.2899 12.1923 21.25 12.0885 21.25 12H22.75C22.75 11.2834 22.1787 10.9246 21.7237 10.8632C21.286 10.804 20.7293 10.9658 20.4253 11.469L21.7092 12.2447ZM12 21.25C10.3139 21.25 8.73533 20.7996 7.37554 20.013L6.62446 21.3114C8.2064 22.2265 10.0432 22.75 12 22.75V21.25ZM3.98703 16.6245C3.20043 15.2647 2.75 13.6861 2.75 12H1.25C1.25 13.9568 1.77351 15.7936 2.68862 17.3755L3.98703 16.6245Z" 
          fill="currentColor"
        />
      </svg>
    );
  }
  
  // Sun Icon
  return (
    <svg 
      className="theme-icon-navbarlanding" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
};

export default function NavbarLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [theme, setTheme] = useState('light')
  const navigate = useNavigate()
  const location = useLocation()

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ]

  const isActive = (path) => location.pathname === path

  const handleNavClick = (path) => {
    navigate(path)
    setIsMenuOpen(false)
  }

  return (
    <header className="header-navbarlanding">
      <div className="container1">
        <nav className="navbar-navbarlanding">
          <button className="logo-navbarlanding" onClick={() => handleNavClick("/")}>
            <img src="/leaf.png" alt="Leaf" className="logo-icon-navbarlanding" />
            <span>FarmXpert</span>
          </button>

          {/* Desktop Navigation */}
          {/* <ul className="nav-links-navbarlanding">
            {navLinks.map((link) => (
              <li key={link.path}>
                <a 
                  href="#" 
                  className={`nav-link-navbarlanding ${isActive(link.path) ? "active" : ""}`}
                  onClick={() => handleNavClick(link.path)}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul> */}

          <div className="nav-actions-navbarlanding">
            {/* Theme Toggle Button */}
            <button 
              className="theme-toggle-navbarlanding"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <ThemeIcon isDark={theme === 'dark'} />
            </button>

            <button 
              className="action-link-navbarlanding action-link--secondary-navbarlanding"
              onClick={() => handleNavClick("/login")}
            >
              Log In
            </button>
            <button 
              className="action-link-navbarlanding action-link--primary-navbarlanding"
              onClick={() => handleNavClick("/register")}
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="mobile-nav-toggle-navbarlanding">
            <button
              className="mobile-menu-toggle-navbarlanding"
              aria-label="Toggle menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Popup */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="mobile-menu-backdrop-navbarlanding"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Popup Menu */}
            <div className="mobile-menu-popup-navbarlanding">
              {/* Header */}
              <div className="mobile-menu-header-navbarlanding">
                <div className="mobile-menu-title-navbarlanding">Menu</div>
                <button
                  className="mobile-menu-close-navbarlanding"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Navigation Links */}
              <ul className="mobile-nav-list-navbarlanding">
                {navLinks.map((link) => (
                  <li key={link.path} className="mobile-nav-item-navbarlanding">
                    <button
                      className={`mobile-nav-link-navbarlanding ${isActive(link.path) ? "active" : ""}`}
                      onClick={() => handleNavClick(link.path)}
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
              
              {/* Action Buttons */}
              <div className="mobile-nav-actions-navbarlanding">
                {/* Theme Toggle in Mobile */}
                <button
                  className="mobile-btn-navbarlanding mobile-btn-secondary-navbarlanding"
                  onClick={toggleTheme}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <ThemeIcon isDark={theme === 'dark'} />
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                
                <button
                  className="mobile-btn-navbarlanding mobile-btn-secondary-navbarlanding"
                  onClick={() => handleNavClick("/login")}
                >
                  Log In
                </button>
                <button
                  className="mobile-btn-navbarlanding mobile-btn-primary-navbarlanding"
                  onClick={() => handleNavClick("/register")}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}