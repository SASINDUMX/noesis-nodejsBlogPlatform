import { NavLink, Link } from "react-router-dom";

const Navbar = ({ username }) => {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        Noesis
      </Link>
      <div className="nav-links">
        {username ? (
          <>
            <NavLink to="/" className="nav-link"><span>🏠</span> Home</NavLink>
            <NavLink to="/search" className="nav-link"><span>🔍</span> Search</NavLink>
            <NavLink to="/account" className="nav-link"><span>👤</span> Account</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/login" className="nav-link">Login</NavLink>
            <NavLink to="/signup" className="nav-link">Signup</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
