
import { Link } from 'react-router-dom';
import cariadLogo from '../assets/logos/cariad_mini_logo_black_rgb.svg';
import { BugReportButton } from '../components/bug_report_button';
import './not_found_view.css';

export function NotFoundView() {
    return (
        <div className="not-found-view">
            {/* Top navbar only */}
            <header className="not-found-view__header">
                <span className="not-found-view__brand">STEP</span>
                <img
                    className="not-found-view__logo"
                    src={cariadLogo}
                    alt="CARIAD"
                />
                <BugReportButton />
            </header>

            {/* 404 content */}
            <main className="not-found-view__content">
                <div className="not-found-view__illustration" aria-hidden="true">
                    <span>404</span>
                </div>

                <h1>Page Not Found</h1>

                <p>
                    The page you are looking for might have been removed,
                    had its name changed, or is temporarily unavailable.
                </p>

                <Link to="/" className="not-found-view__button">
                    Go to Dashboard
                    <span aria-hidden="true">→</span>
                </Link>
            </main>
        </div>
    );
}
