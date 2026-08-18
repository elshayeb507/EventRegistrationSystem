import { useEffect, useState, useMemo } from "react";
import { Container, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import {
  FaCalendarCheck,
  FaInbox,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaRedo
} from "react-icons/fa";
import api from "../api/axios";
import EventCard, { getEventStatus } from "../components/EventCard";
import Loader from "../components/Loader";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, upcoming, past, available, full
  const [sortOrder, setSortOrder] = useState("asc"); // asc (الأقرب), desc (الأبعد)

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      // جلب جميع الفعاليات للعرض والفلترة
      const { data } = await api.get(`/events?page=1&limit=100`);
      setEvents(data.data.events || []);
    } catch {
      setError("حدث خطأ أثناء تحميل الفعاليات، يرجى التأكد من تشغيل السيرفر والمحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // الفلترة والترتيب التفاعلي
  const filteredAndSortedEvents = useMemo(() => {
    const now = new Date();

    return events
      .filter((ev) => {
        // 1. البحث بالعنوان
        if (searchTerm.trim()) {
          const matchTitle = ev.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
          const matchLocation = ev.location
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
          if (!matchTitle && !matchLocation) return false;
        }

        // 2. الفلترة بحالة الفعالية
        const status = getEventStatus(ev);
        if (statusFilter === "upcoming") {
          return new Date(ev.event_date) >= now;
        }
        if (statusFilter === "past") {
          return new Date(ev.event_date) < now;
        }
        if (statusFilter === "available") {
          return status.key === "available" || status.key === "limited";
        }
        if (statusFilter === "full") {
          return status.key === "full";
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.event_date).getTime();
        const dateB = new Date(b.event_date).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [events, searchTerm, statusFilter, sortOrder]);

  return (
    <>
      <section className="hero-section">
        <Container style={{ position: "relative", zIndex: 1 }}>
          <span className="hero-eyebrow">منصة الفعاليات الجامعية</span>
          <h1 className="hero-title">
            اكتشف الفعاليات القادمة <br /> وسجّل مكانك بضغطة واحدة
          </h1>
          <p className="hero-sub">
            من الندوات العلمية لحفلات التخرج، كل الفعاليات في مكان واحد
            بمقاعد محدودة وتسجيل فوري.
          </p>
        </Container>
      </section>

      <Container className="py-5">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div className="d-flex align-items-center gap-2">
            <FaCalendarCheck className="text-gold" size={22} />
            <h4 className="mb-0">جميع الفعاليات</h4>
          </div>

          {/* أدوات البحث والفلترة */}
          <div className="d-flex align-items-center gap-2 flex-wrap w-100 w-md-auto">
            <InputGroup style={{ maxWidth: 300 }}>
              <InputGroup.Text className="bg-white border-end-0">
                <FaSearch className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="ابحث باسم الفعالية..."
                className="border-start-0 ps-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Form.Select
              style={{ width: "auto", minWidth: 140 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="تصفية حسب الحالة"
            >
              <option value="all">جميع الفعاليات</option>
              <option value="upcoming">الفعاليات القادمة</option>
              <option value="past">الفعاليات المنتهية</option>
              <option value="available">المتاحة للتسجيل</option>
              <option value="full">مكتملة المقاعد</option>
            </Form.Select>

            <Form.Select
              style={{ width: "auto", minWidth: 150 }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              aria-label="ترتيب الفعاليات"
            >
              <option value="asc">الأقرب تاريخاً</option>
              <option value="desc">الأبعد تاريخاً</option>
            </Form.Select>
          </div>
        </div>

        {loading && <Loader label="جاري تحميل الفعاليات..." />}

        {error && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between">
            <div>{error}</div>
            <Button variant="outline-danger" size="sm" onClick={fetchEvents}>
              <FaRedo className="me-1" /> إعادة المحاولة
            </Button>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="empty-state">
            <FaInbox size={52} />
            <h5>لا توجد فعاليات متاحة حالياً</h5>
            <p className="text-muted">تابعنا، سنضيف فعاليات جديدة قريباً</p>
          </div>
        )}

        {!loading && !error && events.length > 0 && filteredAndSortedEvents.length === 0 && (
          <div className="empty-state py-5">
            <FaSearch size={48} />
            <h5>لم نجد فعاليات تطابق بحثك</h5>
            <p className="text-muted">جرب تغيير كلمات البحث أو تصفية الفعاليات</p>
            <Button
              variant="outline-navy"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              إعادة ضبط الفلاتر
            </Button>
          </div>
        )}

        <Row className="g-4">
          {filteredAndSortedEvents.map((event) => (
            <Col key={event.id} xs={12} md={6} lg={4}>
              <EventCard event={event} />
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}