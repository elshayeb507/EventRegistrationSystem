import { Link, useNavigate, NavLink } from "react-router-dom";
import { Container, Nav, Navbar as BsNavbar, Button } from "react-bootstrap";
import { FaGraduationCap, FaSignOutAlt, FaPlusCircle, FaTicketAlt, FaCalendarCheck } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isOrganizer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <BsNavbar expand="lg" className="app-navbar" variant="dark">
      <Container>
        <BsNavbar.Brand as={Link} to="/" className="brand d-flex align-items-center gap-2">
          <FaGraduationCap size={28} />
          نظام تسجيل الفعاليات
        </BsNavbar.Brand>

        <BsNavbar.Toggle aria-controls="main-nav" />
        <BsNavbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-lg-center gap-lg-2">
            <Nav.Link as={NavLink} to="/" end>
              جميع الفعاليات
            </Nav.Link>

            {user && (
              <Nav.Link as={NavLink} to="/my-registrations">
                <FaTicketAlt className="me-1" />
                تسجيلاتي
              </Nav.Link>
            )}

            {isOrganizer && (
              <>
                <Nav.Link as={NavLink} to="/my-events">
                  <FaCalendarCheck className="me-1" />
                  فعالياتي
                </Nav.Link>

                <Nav.Link as={NavLink} to="/create-event">
                  <FaPlusCircle className="me-1" />
                  إضافة فعالية
                </Nav.Link>
              </>
            )}

            {!user ? (
              <>
                <Nav.Link as={Link} to="/login">
                  تسجيل الدخول
                </Nav.Link>
                <Button as={Link} to="/register" className="btn-gold btn-sm px-3 ms-lg-2">
                  إنشاء حساب
                </Button>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2 ms-lg-2 pt-2 pt-lg-0">
                <span className="text-light small">
                  أهلاً، {user.name?.split(" ")[0]}
                  {isOrganizer && <span className="badge badge-organizer ms-1">منظّم</span>}
                </span>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                  className="d-flex align-items-center gap-1"
                >
                  <FaSignOutAlt /> خروج
                </Button>
              </div>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}
