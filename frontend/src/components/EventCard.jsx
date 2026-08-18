import { Link } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowLeft, FaUserTie } from "react-icons/fa";

export function getEventStatus(event) {
  const registeredCount = Number(event.registeredCount || 0);
  const remainingSeats = Math.max(0, event.capacity - registeredCount);
  const isPast = new Date(event.event_date) < new Date();

  if (isPast) {
    return { key: "expired", label: "انتهت", pillClass: "capacity-pill expired" };
  }
  if (remainingSeats <= 0) {
    return { key: "full", label: "اكتملت المقاعد", pillClass: "capacity-pill full" };
  }
  if (remainingSeats <= 3) {
    return { key: "limited", label: "المقاعد محدودة", pillClass: "capacity-pill limited" };
  }
  return { key: "available", label: "متاحة للتسجيل", pillClass: "capacity-pill available" };
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ar-EG", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventCard({ event }) {
  const registeredCount = Number(event.registeredCount || 0);
  const remainingSeats = Math.max(0, event.capacity - registeredCount);
  const statusInfo = getEventStatus(event);
  const organizerName = event.User?.name;

  return (
    <div className="event-card">
      <div className="event-card-header">
        <span className="event-title-text text-truncate">{event.title}</span>
        <span className={statusInfo.pillClass}>{statusInfo.label}</span>
      </div>

      <div className="event-card-body">
        {event.description && (
          <p className="text-muted mb-1" style={{ fontSize: "0.92rem", minHeight: "2.7rem" }}>
            {event.description.length > 85
              ? event.description.slice(0, 85) + "..."
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

        {organizerName && (
          <div className="event-meta">
            <FaUserTie />
            <span className="text-truncate">المنظّم: {organizerName}</span>
          </div>
        )}

        <div className="event-meta">
          <FaUsers />
          <span>
            {statusInfo.key === "full" ? (
              <strong className="text-danger">اكتملت المقاعد (0 من {event.capacity})</strong>
            ) : (
              <>
                المقاعد المتبقية: <strong className="text-navy">{remainingSeats}</strong> من {event.capacity}
              </>
            )}
          </span>
        </div>

        <Link
          to={`/events/${event.id}`}
          className="btn btn-outline-navy mt-auto d-flex align-items-center justify-content-center gap-2"
        >
          التفاصيل والتسجيل
          <FaArrowLeft style={{ transform: "scaleX(-1)" }} />
        </Link>
      </div>
    </div>
  );
}
