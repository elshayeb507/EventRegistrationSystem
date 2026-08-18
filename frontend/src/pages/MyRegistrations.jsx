import { useEffect, useState } from "react";
import { Container, Table } from "react-bootstrap";
import { FaTicketAlt, FaInbox, FaTimesCircle } from "react-icons/fa";
import api from "../api/axios";
import Loader from "../components/Loader";
import ConfirmModal from "../components/ConfirmModal";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [targetId, setTargetId] = useState(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/registrations/my");
      setRegistrations(data.data.registrations);
    } catch {
      setError("تعذّر تحميل تسجيلاتك");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const confirmCancel = async () => {
    const registrationId = targetId;
    setTargetId(null);
    setFeedback({ type: "", text: "" });
    try {
      await api.put(`/registrations/cancel/${registrationId}`);
      setFeedback({ type: "success", text: "تم إلغاء التسجيل بنجاح" });
      fetchRegistrations();
    } catch (err) {
      setFeedback({
        type: "danger",
        text: err.response?.data?.message || "تعذّر إلغاء التسجيل",
      });
    }
  };

  return (
    <Container className="py-5">
      <div className="d-flex align-items-center gap-2 mb-4">
        <FaTicketAlt className="text-gold" size={20} />
        <h4 className="mb-0">تسجيلاتي</h4>
      </div>

      {loading && <Loader label="جاري تحميل تسجيلاتك..." />}
      {error && <div className="alert alert-danger">{error}</div>}
      {feedback.text && (
        <div className={`alert alert-${feedback.type}`}>{feedback.text}</div>
      )}

      {!loading && !error && registrations.length === 0 && (
        <div className="empty-state">
          <FaInbox size={48} />
          <h5>لم تسجّل بعد في أي فعالية</h5>
          <p className="text-muted">تصفّح الفعاليات المتاحة وسجّل مكانك</p>
        </div>
      )}

      {!loading && registrations.length > 0 && (
        <div className="detail-card p-0 overflow-hidden">
          <Table responsive hover className="mb-0 align-middle">
            <thead style={{ background: "var(--parchment)" }}>
              <tr>
                <th>الفعالية</th>
                <th>تاريخ الفعالية</th>
                <th>الحالة</th>
                <th>تاريخ التسجيل</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.id}>
                  <td className="fw-semibold">{r.Event?.title || "—"}</td>
                  <td>{r.Event ? formatDate(r.Event.event_date) : "—"}</td>
                  <td>
                    <span
                      className={`status-pill ${r.status === "confirmed" ? "status-confirmed" : "status-cancelled"
                        }`}
                    >
                      {r.status === "confirmed" ? "مؤكد" : "ملغى"}
                    </span>
                  </td>
                  <td className="text-muted">{formatDate(r.registered_at)}</td>
                  <td>
                    {r.status === "confirmed" && (
                      <button
                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                        onClick={() => setTargetId(r.id)}
                      >
                        <FaTimesCircle /> إلغاء
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <ConfirmModal
        show={targetId !== null}
        title="إلغاء التسجيل"
        message="هل أنت متأكد من إلغاء هذا التسجيل؟ لن تتمكن من التراجع عن هذا الإجراء."
        confirmLabel="نعم، ألغِ التسجيل"
        cancelLabel="تراجع"
        onConfirm={confirmCancel}
        onCancel={() => setTargetId(null)}
      />
    </Container>
  );
}
