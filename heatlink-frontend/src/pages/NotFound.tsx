import { Link } from 'wouter';
import { Home, ArrowLeft } from 'lucide-react';
import './NotFound.css';

export default function NotFound() {
    return (
        <div className="not-found-page">
            <div className="not-found-container">
                <div className="not-found-card vista-card">
                    <div className="error-icon">404</div>
                    <h1 className="error-title">Page Not Found</h1>
                    <p className="error-description">
                        The page you are looking for does not exist or has been moved.
                    </p>

                    <div className="error-actions">
                        <Link href="/" className="action-button primary">
                            <Home size={20} />
                            <span>Go Home</span>
                        </Link>
                        <button className="action-button secondary" onClick={() => window.history.back()}>
                            <ArrowLeft size={20} />
                            <span>Go Back</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
