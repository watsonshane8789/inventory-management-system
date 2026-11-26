//============================================================================================================
// C O P Y R I G H T
//------------------------------------------------------------------------------------------------------------
// \copyright (C) 2026 Cariad SE. All rights reserved.
//============================================================================================================

import { Link, useLocation, useNavigate } from "react-router-dom";
import "./not_found_view.css";

/**
 * Name of the icon file inside src/assets/logos/ — change this to swap the icon.
 */
const ICON_FILE = "ICON_FILE_NAME.svg";

const iconUrl = new URL(`../assets/logos/${ICON_FILE}`, import.meta.url).href;

/**
 * NotFoundView — 404 page shown for any URL that does not match a route.
 *
 * Shows an icon, the URL that failed to match, and two ways out:
 * go back, or return to the dashboard.
 */
export function NotFoundView() {
    const { pathname, search } = useLocation();
    const navigate = useNavigate();

    return (
        <main className="not-found-view">
            <div className="not-found-view__stage">
                <img className="not-found-view__icon" src={iconUrl} alt="" />

                <p className="not-found-view__code" aria-hidden="true">
                    404
                </p>
            </div>

            <h1 className="not-found-view__title">Page not found</h1>
            <p className="not-found-view__text">
                No page matches this address. It may have been moved, or the link is mistyped.
            </p>

            <code className="not-found-view__path">
                {pathname}
                {search}
            </code>

            <div className="not-found-view__actions">
                <button
                    type="button"
                    className="not-found-view__btn not-found-view__btn--secondary"
                    onClick={() => navigate(-1)}
                >
                    Go back
                </button>
                <Link to="/" className="not-found-view__btn not-found-view__btn--primary">
                    Go to dashboard
                </Link>
            </div>
        </main>
    );
}
