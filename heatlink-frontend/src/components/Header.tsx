import { useProfile } from '../contexts/ProfileContext';
import { Link } from 'wouter';
import './Header.css';

interface HeaderProps {
  currentPage?: 'home' | 'history' | 'about';
}

export default function Header({ currentPage = 'home' }: HeaderProps) {
  const { profile } = useProfile();

  return (
    <header className="header vista-transition">
      <div className="header-container">
        <Link href="/" className="logo-section">
          <img 
            src="/logo.jpg"
            alt="URL Status Checker" 
            className="logo-image"
          />
          <span className="logo-text">Status Checker</span>
        </Link>

        <nav className="nav-menu">
          <Link href="/" className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}>
            Home
          </Link>
          <Link href="/history" className={`nav-link ${currentPage === 'history' ? 'active' : ''}`}>
            History
          </Link>
          <Link href="/about" className={`nav-link ${currentPage === 'about' ? 'active' : ''}`}>
            About
          </Link>
        </nav>

        <div className="profile-section">
          <span className="profile-name">{profile.name}</span>
          <img 
            src={profile.imageUrl} 
            alt={profile.name} 
            className="profile-image"
          />
        </div>
      </div>
    </header>
  );
}
