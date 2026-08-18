import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Badge, ProgressBar, Modal, Table } from "react-bootstrap";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaArrowRight,
  FaTrash,
  FaEdit,
  FaCheckCircle,
  FaUserTie,
  FaUserFriends,
  FaClock,
  FaRedo
} from "react-icons/fa";
import api from "../api/axios";
import Loader from "../components/Loader";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import { getEventStatus } from "../components/EventCard";
import { useAuth } from "../context/AuthContext";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRegDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isOrganizer } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  // حالة إدارة المسجلين للمنظم
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [attendeesError, setAttendeesError] = useState("");

  const fetchEventData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: eventRes } = await api.get(`/events/${id}`);
      setEvent(eventRes.data.event);

      if (user && !isOrganizer) {
        try {
          const { data: regRes } = await api.get("/registrations/my");
          const myRegs = regRes.data.registrations || [];
          const activeReg = myRegs.find(
            (r) => r.event_id === Number(id) && r.status === "confirmed"
          );
          if (activeReg) {
            setIsRegistered(true);
          }
        } catch {
          // تتخطي الحماية وتعتمد على السيرفر عند الطلب
        }
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError("الفعالية غير موجودة");
      } else {
        setError("حدث خطأ أثناء تحميل تفاصيل الفعالية، يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setLoading(false);
    }
  }, [id, user, isOrganizer]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  const handleRegister = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (isRegistered) return;

    setRegistering(true);
    try {
      await api.post(`/registrations/${id}`);
      setIsRegistered(true);
      setToast({ type: "success", message: "تم التسجيل في الفعالية بنجاح 🎉" });
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              registeredCount: Number(prev.registeredCount || 0) + 1,
            }
          : prev
      );
    } catch (err) {
      const errMsg = err.response?.data?.message || "تعذّر إتمام التسجيل";
      if (err.response?.status === 400 && errMsg.includes("already registered")) {
        setIsRegistered(true);
        setToast({ type: "warning", message: "أنت مسجل بالفعل في هذه الفعالية" });
      } else {
        setToast({ type: "danger", message: errMsg });
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleDeleteEvent = async () => {
    setShowDeleteConfirm(false);
    try {
      await api.delete(`/events/${id}`);
      setToast({ type: "success", message: "تم حذف الفعالية بنجاح" });
      setTimeout(() => navigate("/my-events"), 1000);
    } catch (err) {
      setToast({
        type: "danger",
        message: err.response?.data?.message || "تعذّر حذف الفعالية",
      });
    }
  };

  // جلب قأئمة المسجلين للفعالية للمنظّم
  const fetchAttendees = async () => {
    setShowAttendeesModal(true);
    setLoadingAttendees(true);
    setAttendeesError("");
    try {
      const { data } = await api.get(`/events/${id}/registrations`);
      setAttendees(data.data.registrations || []);
    } catch (err) {
      setAttendeesError(err.response?.data?.message || "تعذّر تحميل قائمة المسجلين");
    } finally {
      setLoadingAttendees(false);
    }
  };

  if (loading) return <Loader label="جاري تحميل تفاصيل الفعالية..." />;

  if (error || !event) {
    return (
      <Container className="py-5 text-center">
        <div className="alert alert-danger d-inline-block py-3 px-4">{error || "الفعالية غير موجودة"}</div>
        <div>
          <Link to="/" className="btn btn-outline-navy mt-3">
            العودة إلى الفعاليات
          </Link>
        </div>
      </Container>
    );
  }

  const registeredCount = Number(event.registeredCount || 0);
  const remainingSeats = Math.max(0, event.capacity - registeredCount);
  const statusInfo = getEventStatus(event);
  const occupancyPercent = Math.min(100, Math.round((registeredCount / event.capacity) * 100));
  const organizerName = event.User?.name;

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section className="detail-hero">
        <Container>
          <Link to="/" className="text-gold d-inline-flex align-items-center gap-2 mb-3">
            <FaArrowRight style={{ transform: "scaleX(-1)" }} />
            رجوع للفعاليات
          </Link>
          <h1 className="text-white mb-2">{event.title}</h1>
          <div className="d-flex gap-2 align-items-center flex-wrap mt-2">
            <span className={statusInfo.pillClass}>{statusInfo.label}</span>
            {organizerName && (
              <Badge bg="dark" className="d-flex align-items-center gap-1">
                <FaUserTie /> المنظّم: {organizerName}
              </Badge>
            )}
          </div>
        </Container>
      </section>

      <Container className="py-5">
        <Row className="g-4">
          <Col lg={8}>
            <div className="detail-card mb-4">
              <h5 className="mb-3 border-bottom pb-2">عن الفعالية</h5>
              <p className="text-muted" style={{ lineHeight: 1.8, whiteSpace: "pre-line", fontSize: "1rem" }}>
                {event.description || "لا يوجد وصف مضاف لهذه الفعالية."}
              </p>
            </div>

            {/* شريط نسبة الامتلاء Progress Bar */}
            <div className="detail-card mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-semibold">نسبة المقاعد المحجوزة</h6>
                <span className="fw-bold text-navy">
                  {registeredCount} / {event.capacity} مقاعد ({occupancyPercent}%)
                </span>
              </div>
              <ProgressBar
                now={occupancyPercent}
                variant={statusInfo.key === "full" ? "danger" : statusInfo.key === "limited" ? "warning" : "success"}
                animated={statusInfo.key !== "expired"}
                style={{ height: "12px", borderRadius: "6px" }}
              />
            </div>
          </Col>

          <Col lg={4}>
            <div className="detail-card">
              <h5 className="mb-3 border-bottom pb-2">تفاصيل الفعالية</h5>

              <div className="event-meta mb-3">
                <FaCalendarAlt />
                <span>{formatDate(event.event_date)}</span>
              </div>

              {event.location && (
                <div className="event-meta mb-3">
                  <FaMapMarkerAlt />
                  <span>{event.location}</span>
                </div>
              )}

              {organizerName && (
                <div className="event-meta mb-3">
                  <FaUserTie />
                  <span>منظّم الفعالية: <strong>{organizerName}</strong></span>
                </div>
              )}

              <div className="event-meta mb-3">
                <FaUsers />
                <span>
                  المقاعد المتبقية:{" "}
                  <strong className={statusInfo.key === "full" ? "text-danger" : "text-success"}>
                    {remainingSeats}
                  </strong>{" "}
                  من إجمالي {event.capacity}
                </span>
              </div>

              <div className="event-meta mb-4">
                <FaClock />
                <span>
                  الحالة: <span className={statusInfo.pillClass}>{statusInfo.label}</span>
                </span>
              </div>

              {/* زر التسجيل للمستخدم العادي */}
              {!isOrganizer && (
                <div>
                  {isRegistered ? (
                    <button className="btn btn-registered w-100 py-2.5 d-flex align-items-center justify-content-center gap-2" disabled>
                      <FaCheckCircle /> أنت مسجل بالفعل ✓
                    </button>
                  ) : statusInfo.key === "expired" ? (
                    <button className="btn btn-disabled w-100 py-2.5" disabled>
                      انتهى موعد الفعالية
                    </button>
                  ) : statusInfo.key === "full" ? (
                    <button className="btn btn-disabled w-100 py-2.5" disabled>
                      اكتملت المقاعد
                    </button>
                  ) : (
                    <button
                      className="btn btn-gold w-100 py-2.5"
                      onClick={handleRegister}
                      disabled={registering}
                    >
                      {registering ? "جاري التسجيل..." : "سجّل مكانك الآن"}
                    </button>
                  )}
                </div>
              )}

              {/* خيارات المنظّم صاحب الفعالية */}
              {isOrganizer && event.organizer_id === user?.id && (
                <div className="mt-3 pt-3 border-top d-flex flex-column gap-2">
                  <button
                    className="btn btn-outline-navy w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={fetchAttendees}
                  >
                    <FaUserFriends /> إدارة المسجلين ({registeredCount})
                  </button>

                  <Link
                    to={`/events/${id}/edit`}
                    className="btn btn-outline-navy w-100 d-flex align-items-center justify-content-center gap-2"
                  >
                    <FaEdit /> تعديل الفعالية
                  </Link>

                  <button
                    className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <FaTrash /> حذف الفعالية
                  </button>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modal إدارة المسجلين للمنظّم */}
      <Modal
        show={showAttendeesModal}
        onHide={() => setShowAttendeesModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-navy text-white">
          <Modal.Title className="text-gold h5 mb-0 d-flex align-items-center gap-2">
            <FaUserFriends /> إدارة المسجلين في الفعالية
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {loadingAttendees && <Loader label="جاري تحميل قائمة المسجلين..." />}

          {attendeesError && (
            <div className="alert alert-danger d-flex align-items-center justify-content-between">
              <div>{attendeesError}</div>
              <button className="btn btn-sm btn-outline-danger" onClick={fetchAttendees}>
                <FaRedo /> إعادة المحاولة
              </button>
            </div>
          )}

          {!loadingAttendees && !attendeesError && attendees.length === 0 && (
            <div className="empty-state py-4">
              <FaUsers size={40} />
              <h6>لا يوجد مسجلون في هذه الفعالية حتى الآن</h6>
            </div>
          )}

          {!loadingAttendees && !attendeesError && attendees.length > 0 && (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead style={{ background: "var(--parchment)" }}>
                  <tr>
                    <th>#</th>
                    <th>اسم المستخدم</th>
                    <th>البريد الإلكتروني</th>
                    <th>تاريخ التسجيل</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td className="fw-semibold">{item.User?.name || "مستخدم غير معرف"}</td>
                      <td className="text-muted">{item.User?.email || "—"}</td>
                      <td>{formatRegDate(item.registered_at)}</td>
                      <td>
                        <span className={`status-pill ${item.status === "confirmed" ? "status-confirmed" : "status-cancelled"}`}>
                          {item.status === "confirmed" ? "مؤكد" : "ملغى"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-outline-navy" onClick={() => setShowAttendeesModal(false)}>
            إغلاق
          </button>
        </Modal.Footer>
      </Modal>

      <ConfirmModal
        show={showDeleteConfirm}
        title="حذف الفعالية"
        message="هل أنت متأكد من حذف هذه الفعالية؟ سيتم إلغاء جميع التسجيلات المرتبطة بها ولا يمكن التراجع عن هذا الإجراء."
        confirmLabel="نعم، احذف الفعالية"
        cancelLabel="تراجع"
        onConfirm={handleDeleteEvent}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
