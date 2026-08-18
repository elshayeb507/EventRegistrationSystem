import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import { FaCompass, FaArrowRight } from "react-icons/fa";

export default function NotFound() {
  return (
    <Container className="text-center py-5 my-4">
      <div className="empty-state py-5 border-0 bg-transparent">
        <FaCompass size={64} className="text-gold mb-3" />
        <h2 className="display-title mb-2">404 - الصفحة أو الفعالية غير موجودة</h2>
        <p className="text-muted mb-4 fs-5" style={{ maxWidth: 480, margin: "0 auto" }}>
          عذراً، الرابط الذي تحاول الوصول إليه غير موجود أو ربما تم حذف الفعالية.
        </p>
        <Link to="/" className="btn btn-gold px-4 py-2 d-inline-flex align-items-center gap-2">
          <FaArrowRight style={{ transform: "scaleX(-1)" }} />
          العودة إلى جميع الفعاليات
        </Link>
      </div>
    </Container>
  );
}
