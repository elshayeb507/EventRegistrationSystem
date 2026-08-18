import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import api from "../api/axios";
import Loader from "../components/Loader";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        const event = data.data.event;
        const formattedDate = new Date(event.event_date).toISOString().slice(0, 16);
        setForm({
          title: event.title,
          description: event.description || "",
          location: event.location || "",
          event_date: formattedDate,
          capacity: event.capacity,
        });
      } catch {
        setError("تعذّر تحميل بيانات الفعالية");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("عنوان الفعالية مطلوب");
      return;
    }

    if (!form.event_date) {
      setError("تاريخ الفعالية مطلوب");
      return;
    }

    const selectedDate = new Date(form.event_date);
    if (selectedDate <= new Date()) {
      setError("تاريخ ووقت الفعالية يجب أن يكون في المستقبل ولا يمكن تعديله للماضي");
      return;
    }

    const capNum = Number(form.capacity);
    if (!Number.isInteger(capNum) || capNum <= 0) {
      setError("عدد المقاعد يجب أن يكون رقماً صحيحاً موجباً أكبر من 0");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/events/${id}`, {
        ...form,
        capacity: capNum,
      });
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "تعذّر حفظ التعديلات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="جاري تحميل بيانات الفعالية..." />;

  if (!form) {
    return (
      <Container className="py-5 text-center">
        <div className="alert alert-danger">{error || "الفعالية غير موجودة"}</div>
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ maxWidth: 640 }}>
      <div className="d-flex align-items-center gap-2 mb-4">
        <FaEdit className="text-gold" size={22} />
        <h4 className="mb-0">تعديل الفعالية</h4>
      </div>

      <div className="detail-card">
        {error && <div className="alert alert-danger mb-4 py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">عنوان الفعالية *</label>
            <input
              type="text"
              name="title"
              className="form-control"
              required
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">الوصف</label>
            <textarea
              name="description"
              className="form-control"
              rows={3}
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">المكان</label>
            <input
              type="text"
              name="location"
              className="form-control"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-8">
              <label className="form-label fw-semibold">تاريخ ووقت الفعالية *</label>
              <input
                type="datetime-local"
                name="event_date"
                className="form-control"
                required
                min={getMinDateTime()}
                value={form.event_date}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">عدد المقاعد *</label>
              <input
                type="number"
                name="capacity"
                className="form-control"
                required
                min={1}
                value={form.capacity}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-gold w-100 py-2.5" disabled={saving}>
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </form>
      </div>
    </Container>
  );
}