import { NavLink, Link } from "react-router-dom";

const Navbar = ({ username }) => {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <Link to="/" className="nav-logo" aria-label="Noesis home">
        Noesis
      </Link>
      <div className="nav-links">
        {username ? (
          <>
            <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} end>
              <span aria-hidden="true">🏠</span> Home
            </NavLink>
            <NavLink to="/search" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              <span aria-hidden="true">🔍</span> Search
            </NavLink>
            <NavLink to="/account" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              <span aria-hidden="true">👤</span> Account
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              Login
            </NavLink>
            <NavLink to="/signup" className={({ isActive }) => `nav-link btn btn-primary${isActive ? " active" : ""}`}>
              Sign Up
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
