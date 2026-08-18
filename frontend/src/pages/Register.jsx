import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGraduationCap, FaUser, FaEnvelope, FaLock, FaUserTie } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });


    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) {
      errors.name = "الاسم بالكامل مطلوب";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
      errors.email = "البريد الإلكتروني مطلوب";
    } else if (!emailRegex.test(form.email)) {
      errors.email = "يرجى إدخال بريد إلكتروني صحيح";
    }

    if (!form.password) {
      errors.password = "كلمة المرور مطلوبة";
    } else if (form.password.length < 8) {
      errors.password = "كلمة المرور يجب أن لا تقل عن 8 أحرف";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-card-top">
          <FaGraduationCap size={36} color="var(--gold)" />
          <h3 className="text-white mt-2 mb-0">إنشاء حساب جديد</h3>
        </div>

        <div className="auth-card-body">
          {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
          {success && (
            <div className="alert alert-success py-2 mb-3">
              تم إنشاء الحساب بنجاح، جاري تحويلك لصفحة الدخول...
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label d-flex align-items-center gap-2 fw-semibold">
                <FaUser className="text-gold" /> الاسم بالكامل
              </label>
              <input
                type="text"
                name="name"
                className={`form-control ${fieldErrors.name ? "is-invalid" : ""}`}
                value={form.name}
                onChange={handleChange}
                placeholder="أدخل اسمك الكامل"
              />
              {fieldErrors.name && (
                <div className="invalid-feedback">{fieldErrors.name}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label d-flex align-items-center gap-2 fw-semibold">
                <FaEnvelope className="text-gold" /> البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                className={`form-control ${fieldErrors.email ? "is-invalid" : ""}`}
                value={form.email}
                onChange={handleChange}
                placeholder="example@domain.com"
              />
              {fieldErrors.email && (
                <div className="invalid-feedback">{fieldErrors.email}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label d-flex align-items-center gap-2 fw-semibold">
                <FaLock className="text-gold" /> كلمة المرور
              </label>
              <input
                type="password"
                name="password"
                className={`form-control ${fieldErrors.password ? "is-invalid" : ""}`}
                minLength={8}
                value={form.password}
                onChange={handleChange}
                placeholder="8 أحرف على الأقل"
              />
              {fieldErrors.password && (
                <div className="invalid-feedback">{fieldErrors.password}</div>
              )}
              <small className="text-muted d-block mt-1" style={{ fontSize: "0.82rem" }}>
                يجب أن تتكون كلمة المرور من 8 خانات على الأقل
              </small>
            </div>

            <div className="mb-4">
              <label className="form-label d-flex align-items-center gap-2 fw-semibold">
                <FaUserTie className="text-gold" /> نوع الحساب
              </label>
              <select
                name="role"
                className="form-select"
                value={form.role}
                onChange={handleChange}
              >
                <option value="user">مستخدم (تسجيل في الفعاليات)</option>
                <option value="organizer">منظّم (إضافة وإدارة الفعاليات)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-gold w-100 py-2.5"
              disabled={loading}
            >
              {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
            </button>
          </form>

          <p className="text-center text-muted mt-4 mb-0">
            لديك حساب بالفعل؟{" "}
            <Link to="/login" className="text-gold fw-bold">
              سجّل دخولك
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
