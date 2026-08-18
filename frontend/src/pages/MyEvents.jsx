import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Modal, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaPlusCircle,
  FaInbox,
  FaEdit,
  FaTrash,
  FaUsers,
  FaMapMarkerAlt,
  FaChevronRight,
  FaChevronLeft,
  FaUserFriends,
  FaChartBar,
  FaCalendarCheck,
  FaHistory,
  FaTicketAlt,
  FaChair,
  FaRedo
} from "react-icons/fa";
import api from "../api/axios";
import Loader from "../components/Loader";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import { getEventStatus } from "../components/EventCard";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("ar-EG", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
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

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [toast, setToast] = useState(null);

  // حالة Modal إدارة المسجلين
  const [activeEventForAttendees, setActiveEventForAttendees] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [attendeesError, setAttendeesError] = useState("");

  const fetchMyEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/events/my?page=${page}&limit=6`);
      setEvents(data.data.events || []);
      setStats(data.data.stats || null);
      setTotalPages(data.data.pagination.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || "تعذّر تحميل فعالياتك، يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, [page]);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    const eventId = deleteTargetId;
    setDeleteTargetId(null);

    try {
      await api.delete(`/events/${eventId}`);
      setToast({ type: "success", message: "تم حذف الفعالية بنجاح" });
      fetchMyEvents();
    } catch (err) {
      setToast({
        type: "danger",
        message: err.response?.data?.message || "تعذّر حذف الفعالية",
      });
    }
  };

  const openAttendeesModal = async (event) => {
    setActiveEventForAttendees(event);
    setLoadingAttendees(true);
    setAttendeesError("");
    try {
      const { data } = await api.get(`/events/${event.id}/registrations`);
      setAttendees(data.data.registrations || []);
    } catch (err) {
      setAttendeesError(err.response?.data?.message || "تعذّر تحميل قائمة المسجلين");
    } finally {
      setLoadingAttendees(false);
    }
  };

  return (
    <Container className="py-5">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div className="d-flex align-items-center gap-2">
          <FaCalendarAlt className="text-gold" size={24} />
          <h4 className="mb-0">فعالياتي (لوحة تحكم المنظّم)</h4>
        </div>

        <Link to="/create-event" className="btn btn-gold d-flex align-items-center gap-2 px-3 py-2">
          <FaPlusCircle /> إضافة فعالية جديدة
        </Link>
      </div>

      {/* Organizer Dashboard Statistics Cards */}
      {stats && (
        <Row className="g-3 mb-4">
          <Col xs={6} md={4} lg={2}>
            <div className="stat-card">
              <FaChartBar className="stat-icon text-navy" />
              <div className="stat-num">{stats.totalEvents}</div>
              <div className="stat-label">إجمالي الفعاليات</div>
            </div>
          </Col>

          <Col xs={6} md={4} lg={2}>
            <div className="stat-card">
              <FaCalendarCheck className="stat-icon text-success" />
              <div className="stat-num">{stats.upcomingEvents}</div>
              <div className="stat-label">الفعاليات القادمة</div>
            </div>
          </Col>

          <Col xs={6} md={4} lg={2}>
            <div className="stat-card">
              <FaHistory className="stat-icon text-muted" />
              <div className="stat-num">{stats.pastEvents}</div>
              <div className="stat-label">الفعاليات المنتهية</div>
            </div>
          </Col>

          <Col xs={6} md={4} lg={2}>
            <div className="stat-card">
              <FaTicketAlt className="stat-icon text-gold" />
              <div className="stat-num">{stats.totalRegistered}</div>
              <div className="stat-label">إجمالي التسجيلات</div>
            </div>
          </Col>

          <Col xs={6} md={4} lg={2}>
            <div className="stat-card">
              <FaChair className="stat-icon text-primary" />
              <div className="stat-num">{stats.totalCapacity}</div>
              <div className="stat-label">إجمالي المقاعد</div>
            </div>
          </Col>

          <Col xs={6} md={4} lg={2}>
            <div className="stat-card">
              <FaUsers className="stat-icon text-success" />
              <div className="stat-num">{stats.totalRemaining}</div>
              <div className="stat-label">المقاعد المتبقية</div>
            </div>
          </Col>
        </Row>
      )}

      {loading && <Loader label="جاري تحميل فعالياتك..." />}

      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between mb-4">
          <div>{error}</div>
          <Button variant="outline-danger" size="sm" onClick={fetchMyEvents}>
            <FaRedo className="me-1" /> إعادة المحاولة
          </Button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="empty-state">
          <FaInbox size={52} />
          <h5>لم تقم بإنشاء أي فعاليات بعد</h5>
          <p className="text-muted mb-4">
            قم بإضافة فعاليتك الأولى وتولّ إدارتها واستقبال التسجيلات بكل سهولة.
          </p>
          <Link to="/create-event" className="btn btn-gold px-4 py-2">
            إضافة فعالية الآن
          </Link>
        </div>
      )}

      <Row className="g-4">
        {events.map((event) => {
          const registeredCount = Number(event.registeredCount || 0);
          const remainingSeats = Math.max(0, event.capacity - registeredCount);
          const statusInfo = getEventStatus(event);

          return (
            <Col key={event.id} xs={12} md={6} lg={4}>
              <div className="event-card">
                <div className="event-card-header">
                  <span className="event-title-text text-truncate">{event.title}</span>
                  <span className={statusInfo.pillClass}>{statusInfo.label}</span>
                </div>

                <div className="event-card-body">
                  {event.description && (
                    <p className="text-muted mb-1" style={{ fontSize: "0.9rem", minHeight: "2.7rem" }}>
                      {event.description.length > 80
                        ? event.description.slice(0, 80) + "..."
                        : event.description}
                    </p>
                  )}

                  <div className="event-meta">
                    <FaCalendarAlt />
                    <span>{formatDate(event.event_date)}</span>
                  </div>

                  {event.location && (
                    <div className="event-meta">
                      <FaMapMarkerAlt />
                      <span className="text-truncate">{event.location}</span>
                    </div>
                  )}

                  <div className="event-meta">
                    <FaUsers />
                    <span>
                      المسجلون: <strong>{registeredCount}</strong> / {event.capacity} (المتبقي: {remainingSeats})
                    </span>
                  </div>

                  <div className="d-flex flex-column gap-2 mt-auto pt-3 border-top">
                    <button
                      className="btn btn-sm btn-outline-navy w-100 d-flex align-items-center justify-content-center gap-1"
                      onClick={() => openAttendeesModal(event)}
                    >
                      <FaUserFriends /> إدارة المسجلين ({registeredCount})
                    </button>

                    <div className="d-flex gap-2">
                      <Link
                        to={`/events/${event.id}`}
                        className="btn btn-sm btn-outline-navy flex-grow-1 text-center"
                      >
                        التفاصيل
                      </Link>

                      <Link
                        to={`/events/${event.id}/edit`}
                        className="btn btn-sm btn-outline-navy d-flex align-items-center gap-1"
                        title="تعديل الفعالية"
                      >
                        <FaEdit /> تعديل
                      </Link>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="d-flex align-items-center gap-1"
                        onClick={() => setDeleteTargetId(event.id)}
                        title="حذف الفعالية"
                      >
                        <FaTrash /> حذف
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>

      {!loading && totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
          <button
            className="btn btn-outline-navy d-flex align-items-center gap-2"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <FaChevronRight /> السابق
          </button>

          <span className="text-muted">
            صفحة {page} من {totalPages}
          </span>

          <button
            className="btn btn-outline-navy d-flex align-items-center gap-2"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            التالي <FaChevronLeft />
          </button>
        </div>
      )}

      {/* Modal إدارة المسجلين للمنظّم */}
      <Modal
        show={activeEventForAttendees !== null}
        onHide={() => setActiveEventForAttendees(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-navy text-white">
          <Modal.Title className="text-gold h5 mb-0 d-flex align-items-center gap-2">
            <FaUserFriends /> المسجلون في: {activeEventForAttendees?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {loadingAttendees && <Loader label="جاري تحميل قائمة المسجلين..." />}

          {attendeesError && (
            <div className="alert alert-danger d-flex align-items-center justify-content-between">
              <div>{attendeesError}</div>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => openAttendeesModal(activeEventForAttendees)}
              >
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
          <button className="btn btn-outline-navy" onClick={() => setActiveEventForAttendees(null)}>
            إغلاق
          </button>
        </Modal.Footer>
      </Modal>

      <ConfirmModal
        show={deleteTargetId !== null}
        title="حذف الفعالية"
        message="هل أنت متأكد من حذف هذه الفعالية؟ سيتم إلغاء جميع التسجيلات المرتبطة بها ولا يمكن التراجع عن هذا الإجراء."
        confirmLabel="نعم، احذف الفعالية"
        cancelLabel="تراجع"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </Container>
  );
}
