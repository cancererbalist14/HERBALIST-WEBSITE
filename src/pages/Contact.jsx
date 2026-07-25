import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp,
  FaClock, FaCalendarAlt, FaCheckCircle, FaSpinner,
  FaLeaf, FaUserMd, FaChevronRight
} from 'react-icons/fa';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'https://cancer-herbalist-rhgj.vercel.app').replace(/\/+$/, '');

const ACCENT = '#38bed5';
const EMERGENCY_COLOR = '#f97316';

// Regular 1-hour time slots
const REGULAR_SLOTS = [
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
];

// Emergency 15-min slots
const EMERGENCY_SLOTS = [
  '11:00 AM - 11:15 AM',
  '11:15 AM - 11:30 AM',
  '12:00 PM - 12:15 PM',
  '12:15 PM - 12:30 PM',
  '02:00 PM - 02:15 PM',
  '02:15 PM - 02:30 PM',
  '03:00 PM - 03:15 PM',
  '03:15 PM - 03:30 PM',
  '03:30 PM - 03:45 PM',
  '03:45 PM - 04:00 PM',
];

// For backward compat (used in isSlotInPast check)
const TIME_SLOTS = REGULAR_SLOTS;

function isSlotInPast(slot) {
  const parts = slot.split(' - ');
  const startTimeStr = parts[0];
  const timeMatch = startTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!timeMatch) return false;
  let hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const ampm = timeMatch[3].toUpperCase();
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  const now = new Date();
  const slotTime = new Date(now);
  slotTime.setHours(hours, minutes, 0, 0);
  return now > slotTime;
}

// Available days Mon–Sat — generates next 30 days
function getAvailableDays() {
  const days = [];
  const today = new Date();
  for (let i = 0; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay(); // 0=Sun,6=Sat
    if (dow !== 0) { // skip Sundays
      days.push({
        date: d,
        label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        full: d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      });
    }
  }
  return days;
}

const TREATMENTS = [
  'Free Consultation',
  'Breast Cancer Support',
  'Lung Cancer Support',
  'Colon Cancer Support',
  'Prostate Cancer Support',
  'Liver Cancer Support',
  'Blood Cancer Support',
  'Herbal Therapy Assessment',
  'Nutrition & Diet Guidance',
  'Chemotherapy Side-Effect Support',
  'Follow-up Appointment',
  'General Inquiry',
];

const CANCER_STAGES = ['Stage I', 'Stage II', 'Stage III', 'Stage IV', 'Remission', 'Not Sure / Other'];

import { useContent } from '../context/ContentContext';

const inputStyle = {
  width: '100%',
  padding: '13px 16px',
  marginBottom: '16px',
  border: '1.5px solid #e2e8f0',
  borderRadius: '12px',
  fontSize: '15px',
  outline: 'none',
  background: '#f8fafc',
  color: '#0f172a',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
  fontFamily: 'Poppins, sans-serif',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '6px',
};

export default function Contact() {
  const DAYS = React.useMemo(() => getAvailableDays(), []);
  const { content } = useContent();
  const contactInfo = content?.contact || {
    phone: '+91 88845 88835',
    email: 'cancerherbalist@gmail.com',
    whatsapp: '918884588835',
    timings: 'Mon–Sat, 9 AM–6 PM',
    address: 'Bangalore, India'
  };

  const [step, setStep] = useState(0); // 0=consent, 1=form, 2=slot, 3=success
  const [consentGiven, setConsentGiven] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]); // slots already taken for selected day
  const [enabledRegularSlots, setEnabledRegularSlots] = useState(REGULAR_SLOTS);
  const [enabledEmergencySlots, setEnabledEmergencySlots] = useState(EMERGENCY_SLOTS);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [apptType, setApptType] = useState('regular'); // 'regular' | 'emergency'

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '',
    treatment: '', stage: '', message: '',
    selectedDay: null, selectedSlot: '',
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDaySelect = async (day) => {
    setFormData({ ...formData, selectedDay: day, selectedSlot: '' });
    // Fetch already-booked slots and admin-configured enabled slots for this date
    setSlotsLoading(true);
    setBookedSlots([]);
    setEnabledRegularSlots(REGULAR_SLOTS);
    setEnabledEmergencySlots(EMERGENCY_SLOTS);
    try {
      const res  = await fetch(`${BACKEND_URL}/api/available-slots?date=${encodeURIComponent(day.full)}`);
      const data = await res.json();
      if (data.success) {
        setBookedSlots(data.bookedSlots || []);
        if (data.enabledSlots) {
          setEnabledRegularSlots(data.enabledSlots.regularSlots || REGULAR_SLOTS);
          setEnabledEmergencySlots(data.enabledSlots.emergencySlots || EMERGENCY_SLOTS);
        }
      }
    } catch { /* silently ignore — slots will just all appear available */ }
    finally { setSlotsLoading(false); }
  };

  const handleSlotSelect = (slot) =>
    setFormData({ ...formData, selectedSlot: slot });

  // Step 1 → Step 2
  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.treatment) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setStep(2);
  };

  // Step 2 → Send emails via backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.selectedDay || !formData.selectedSlot) {
      setError('Please select a date and time slot.');
      return;
    }
    setError('');
    setSending(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/book-appointment`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:            formData.name,
          phone:           formData.phone,
          email:           formData.email,
          treatment:       formData.treatment,
          stage:           formData.stage || '',
          message:         formData.message || '',
          appointmentDay:  formData.selectedDay.full,
          appointmentSlot: formData.selectedSlot,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        // Duplicate booking (same phone/email OR same slot)
        setSending(false);
        if (data.existingAppt) {
          setError(
            `You already have an appointment booked on ${data.existingAppt.appointmentDay} at ${data.existingAppt.appointmentSlot} for "${data.existingAppt.treatment}". ` +
            `Only one appointment per person is allowed. Please WhatsApp us at +91 88845 88835 to reschedule.`
          );
        } else {
          setError(data.error || 'This slot is already booked. Please choose a different time.');
        }
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send confirmation.');
      }

      setSending(false);
      setStep(3);
    } catch (err) {
      setSending(false);
      setError(err.message || 'Failed to send. Please try WhatsApp or call us directly.');
      console.error('[Contact] Appointment booking error:', err);
    }
  };

  const reset = () => {
    setStep(0);
    setConsentGiven(false);
    setApptType('regular');
    setFormData({ name: '', phone: '', email: '', treatment: '', stage: '', message: '', selectedDay: null, selectedSlot: '' });
    setError('');
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section style={{ padding: '140px 20px 80px', textAlign: 'center', background: 'linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 100%)' }}>
        <div style={{ display: 'inline-block', background: '#DBEAFE', color: ACCENT, padding: '8px 18px', borderRadius: '999px', fontWeight: '600', marginBottom: '20px', fontSize: '14px' }}>
          Book a Free Consultation
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem,6vw,4rem)', color: '#0F172A', marginBottom: '20px', fontFamily: 'Playfair Display, serif' }}>
          Start Your <span style={{ color: ACCENT }}>Healing Journey</span>
        </h1>
        <p style={{ maxWidth: '680px', margin: '0 auto', color: '#64748B', lineHeight: '1.8', fontSize: '1.05rem' }}>
          Book a free discovery consultation with our senior herbal oncology practitioners. Slots are available {contactInfo.timings}.
        </p>
      </section>

      {/* ── Info Cards ── */}
      <section style={{ maxWidth: '1300px', margin: '-40px auto 0', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '20px' }}>
          {[
            { icon: <FaPhone />, title: 'Call Us', text: contactInfo.phone, href: 'tel:' + contactInfo.phone.replace(/[^0-9+]/g, '') },
            { icon: <FaEnvelope />, title: 'Email', text: contactInfo.email, href: 'mailto:' + contactInfo.email },
            { icon: <FaMapMarkerAlt />, title: 'Location', text: contactInfo.address, href: '#map' },
            { icon: <FaClock />, title: 'Working Hours', text: contactInfo.timings, href: null },
          ].map((item, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '20px', padding: '28px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.07)', border: `1px solid ${ACCENT}18` }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#DBEAFE', color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '22px' }}>
                {item.icon}
              </div>
              <h3 style={{ color: '#0f172a', fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>{item.title}</h3>
              {item.href
                ? <a href={item.href} style={{ color: '#64748b', fontSize: '13.5px', textDecoration: 'none' }}>{item.text}</a>
                : <p style={{ color: '#64748b', fontSize: '13.5px', margin: 0 }}>{item.text}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ── Main Form + WhatsApp ── */}
      <section style={{ maxWidth: '1300px', margin: '56px auto', padding: '0 20px' }}>
        <div className="contact-main-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(380px, 100%), 1fr))', gap: '36px', alignItems: 'start' }}>

          {/* ── Booking Form Card ── */}
          <div style={{ background: '#fff', padding: 'clamp(24px, 4vw, 44px)', borderRadius: '28px', boxShadow: '0 12px 40px rgba(0,0,0,0.09)', border: `1px solid ${ACCENT}22` }}>

            {/* Step Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '32px' }}>
              {['Consent', 'Details', 'Slot', 'Done'].map((label, i) => {
                const active = step === i;
                const done = step > i;
                return (
                  <React.Fragment key={i}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: done || active ? ACCENT : '#e2e8f0', color: done || active ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', transition: 'all 0.3s' }}>
                        {done ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: active ? ACCENT : '#94a3b8', whiteSpace: 'nowrap' }}>{label}</span>
                    </div>
                    {i < 3 && <div style={{ flex: 1, height: '2px', background: step > i ? ACCENT : '#e2e8f0', margin: '0 4px', marginBottom: '20px', transition: 'background 0.3s' }} />}
                  </React.Fragment>
                );
              })}
            </div>

            {/* ── STEP 0: Consent ── */}
            {step === 0 && (
              <div>
                <h2 style={{ color: '#0f172a', fontFamily: 'Playfair Display, serif', marginBottom: '8px', fontSize: '1.4rem' }}>
                  Read & <span style={{ color: ACCENT }}>Agree to Consent</span>
                </h2>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px', lineHeight: '1.6' }}>
                  Before booking, please read and agree to our Integrative Care Consent Agreement.
                </p>

                <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px', background: '#f8fafc', marginBottom: '16px', fontSize: '13px', color: '#475569', lineHeight: '1.8' }}>
                  <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>Integrative Care Consent Agreement</p>
                  <p><strong>1. Nature of Services</strong><br />Cancer Herbalist provides integrative, evidence-based herbal and nutritional support as a <em>complementary</em> approach alongside conventional oncology treatments. These services are NOT a replacement for surgery, chemotherapy, radiotherapy, or any conventional medical treatment prescribed by your oncology team.</p>
                  <p><strong>2. No Claim of Cure</strong><br />You acknowledge that Cancer Herbalist does not claim to diagnose, cure, treat, or prevent cancer or any other disease. Treatment outcomes vary between individuals and no specific results are guaranteed.</p>
                  <p><strong>3. Information Accuracy</strong><br />You confirm that all personal, medical, and health-related information provided is accurate and complete to the best of your knowledge.</p>
                  <p><strong>4. Data Privacy & Storage</strong><br />Your personal and medical information is stored securely and used solely to provide personalized care recommendations. Your data will never be sold or shared with third parties without your explicit consent.</p>
                  <p><strong>5. Communication Consent</strong><br />You consent to receive consultation confirmations, appointment reminders, and health information via email, SMS, and/or WhatsApp at the contact details you provide.</p>
                </div>

                <div style={{ background: consentGiven ? '#f0fdf4' : '#f8fafc', border: `2px solid ${consentGiven ? '#22c55e' : '#e2e8f0'}`, borderRadius: '12px', padding: '16px', marginBottom: '20px', transition: 'all 0.3s' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      style={{ width: '18px', height: '18px', marginTop: '3px', accentColor: ACCENT, flexShrink: 0 }}
                    />
                    <span style={{ color: '#334155', fontSize: '13px', lineHeight: '1.7', fontWeight: 500 }}>
                      I have read, understood, and voluntarily agree to the Integrative Care Consent Agreement. I confirm I am over 18 years of age (or acting as a guardian).
                    </span>
                  </label>
                </div>

                <button
                  onClick={() => { if (consentGiven) setStep(1); }}
                  disabled={!consentGiven}
                  style={{ width: '100%', background: consentGiven ? ACCENT : '#e2e8f0', color: consentGiven ? '#fff' : '#94a3b8', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: 700, cursor: consentGiven ? 'pointer' : 'not-allowed', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s', boxShadow: consentGiven ? '0 4px 18px rgba(56,190,213,0.3)' : 'none' }}
                >
                  <FaCheckCircle /> I Agree — Continue to Booking
                </button>
                {!consentGiven && (
                  <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '11.5px', marginTop: '8px' }}>Please read and check the box above to continue</p>
                )}
              </div>
            )}

            {/* ── STEP 1: Patient Details ── */}
            {step === 1 && (
              <form onSubmit={handleNextStep}>
                <h2 style={{ color: '#0f172a', fontFamily: 'Playfair Display, serif', marginBottom: '16px', fontSize: '1.5rem' }}>
                  Book a <span style={{ color: ACCENT }}>Consultation</span>
                </h2>

                {/* Appointment Type Toggle */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Appointment Type *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => { setApptType('regular'); setFormData(f => ({ ...f, selectedSlot: '' })); }}
                      style={{
                        padding: '14px 10px', borderRadius: '12px', border: `2px solid ${apptType === 'regular' ? ACCENT : '#e2e8f0'}`,
                        background: apptType === 'regular' ? `${ACCENT}18` : '#f8fafc',
                        color: apptType === 'regular' ? ACCENT : '#64748b',
                        fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      <span style={{ fontSize: '22px' }}>🩺</span>
                      <span>Regular Consultation</span>
                      <span style={{ fontSize: '11px', fontWeight: 400, opacity: 0.75 }}>1-hour slot</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setApptType('emergency'); setFormData(f => ({ ...f, selectedSlot: '' })); }}
                      style={{
                        padding: '14px 10px', borderRadius: '12px',
                        border: `2px solid ${apptType === 'emergency' ? EMERGENCY_COLOR : '#e2e8f0'}`,
                        background: apptType === 'emergency' ? `${EMERGENCY_COLOR}18` : '#f8fafc',
                        color: apptType === 'emergency' ? EMERGENCY_COLOR : '#64748b',
                        fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      <span style={{ fontSize: '22px' }}>⚡</span>
                      <span>Mini Consultation</span>
                      <span style={{ fontSize: '11px', fontWeight: 400, opacity: 0.75 }}>Quick query or follow-up</span>
                    </button>
                  </div>
                  {apptType === 'emergency' && (
                    <div style={{ marginTop: '10px', background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '10px', padding: '10px 14px', fontSize: '12.5px', color: '#9a3412', lineHeight: '1.6' }}>
                      ⚡ <strong>Mini Consultation slots are 15 minutes</strong> — for quick queries, follow-ups, or general questions. Our Consultant will call you promptly at the booked time.
                    </div>
                  )}
                </div>

                <label style={labelStyle}>Full Name *</label>
                <input type="text" name="name" placeholder="e.g. Rahul Sharma" value={formData.name} onChange={handleChange} required style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = ACCENT)} onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')} />

                <label style={labelStyle}>Phone Number *</label>
                <input type="tel" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} required style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = ACCENT)} onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')} />

                <label style={labelStyle}>Email Address * (confirmation will be sent here)</label>
                <input type="email" name="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} required style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = ACCENT)} onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')} />
                <div style={{ color: '#64748b', fontSize: '11.5px', marginTop: '-6px', marginBottom: '14px', lineHeight: '1.4' }}>
                  ℹ️ <strong>Limit 1 active booking per patient.</strong> If you wish to book for a family member or another person, please use their name, email, and phone number.
                </div>

                <label style={labelStyle}>Type of Consultation *</label>
                <select name="treatment" value={formData.treatment} onChange={handleChange} required style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">-- Select Treatment Type --</option>
                  {TREATMENTS.map((t) => <option key={t}>{t}</option>)}
                </select>

                <label style={labelStyle}>Cancer Stage (if applicable)</label>
                <select name="stage" value={formData.stage} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">-- Select Stage --</option>
                  {CANCER_STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>

                <label style={labelStyle}>Additional Message</label>
                <textarea rows="3" name="message" placeholder="Tell us about your condition or any questions..." value={formData.message} onChange={handleChange}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={(e) => (e.target.style.borderColor = ACCENT)} onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')} />

                {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>⚠ {error}</p>}

                <button type="submit" style={{ width: '100%', background: ACCENT, color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'opacity 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                  Next: Choose Appointment Slot <FaChevronRight />
                </button>
              </form>
            )}

            {/* ── STEP 2: Slot Selection ── */}
            {step === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '22px', padding: 0 }}>←</button>
                  <h2 style={{ color: '#0f172a', fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', margin: 0 }}>
                    Choose <span style={{ color: ACCENT }}>Date & Time</span>
                  </h2>
                </div>
                 <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
                  Available Mon–Sat, 10 AM – 4 PM (Sundays closed)
                </p>

                {/* Day Picker */}
                <label style={labelStyle}>Select Date *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100px, 100%), 1fr))', gap: '8px', marginBottom: '24px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                  {DAYS.slice(0, 18).map((day, i) => {
                    const selected = formData.selectedDay?.label === day.label;
                    const activeColor = apptType === 'emergency' ? EMERGENCY_COLOR : ACCENT;
                    return (
                      <button key={i} type="button" onClick={() => handleDaySelect(day)}
                        style={{ padding: '10px 6px', borderRadius: '10px', border: `2px solid ${selected ? activeColor : '#e2e8f0'}`, background: selected ? `${activeColor}18` : '#f8fafc', color: selected ? activeColor : '#475569', fontWeight: selected ? 700 : 500, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', lineHeight: '1.4' }}>
                        {day.label}
                      </button>
                    );
                  })}
                </div>

                {/* Time Slot Picker */}
                {formData.selectedDay && (
                  <>
                    <label style={labelStyle}>
                      {apptType === 'emergency' ? '⚡ Select 15-Min Mini Consultation Slot' : 'Select Time Slot'} for {formData.selectedDay.label} *
                      {slotsLoading && <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 400, marginLeft: '8px' }}>Loading availability…</span>}
                    </label>

                    {/* Emergency type info banner */}
                    {apptType === 'emergency' && (
                      <div style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '10px', padding: '8px 14px', marginBottom: '12px', fontSize: '12px', color: '#9a3412' }}>
                        ⚡ Showing 15-minute Mini Consultation slots only
                      </div>
                    )}

                    {(() => {
                      const activeColor = apptType === 'emergency' ? EMERGENCY_COLOR : ACCENT;
                      const slotsToShow = apptType === 'emergency' ? EMERGENCY_SLOTS : REGULAR_SLOTS;
                      const enabledSlots = apptType === 'emergency' ? enabledEmergencySlots : enabledRegularSlots;

                      const isToday = formData.selectedDay &&
                        new Date(formData.selectedDay.date).toDateString() === new Date().toDateString();

                      // Filter out slots that have already passed so they are not visible
                      const visibleSlots = slotsToShow.filter(slot => !(isToday && isSlotInPast(slot)));

                      if (visibleSlots.length === 0) {
                        return (
                          <div style={{
                            padding: '24px 16px',
                            background: '#fff7ed',
                            border: '1.5px dashed #fed7aa',
                            borderRadius: '12px',
                            textAlign: 'center',
                            color: '#c2410c',
                            fontSize: '13.5px',
                            fontWeight: 500,
                            lineHeight: '1.6',
                            marginBottom: '24px'
                          }}>
                            ⚡ All slots for today have already passed. Please select another date above or connect with us on WhatsApp.
                          </div>
                        );
                      }

                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(150px, 100%), 1fr))', gap: '8px', marginBottom: '24px' }}>
                          {visibleSlots.map((slot) => {
                            const selected = formData.selectedSlot === slot;
                            const isBooked = bookedSlots.includes(slot);
                            const isDisabled = !enabledSlots.includes(slot);
                            const unavailable = isBooked || isDisabled;
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={unavailable}
                                onClick={() => !unavailable && handleSlotSelect(slot)}
                                title={
                                  isBooked ? 'This slot is already booked'
                                  : isDisabled ? 'Not available today'
                                  : slot
                                }
                                style={{
                                  padding: '10px 4px', borderRadius: '10px',
                                  border: `2px solid ${unavailable ? '#e2e8f0' : selected ? activeColor : '#e2e8f0'}`,
                                  background: unavailable ? '#f1f5f9' : selected ? activeColor : '#f8fafc',
                                  color:  unavailable ? '#cbd5e1' : selected ? '#fff' : '#475569',
                                  fontWeight: 600, fontSize: '11px',
                                  cursor: unavailable ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s',
                                  textDecoration: isBooked ? 'line-through' : 'none',
                                }}
                              >
                                {slot}
                                {isBooked ? (
                                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#ef4444', textDecoration: 'none', marginTop: '2px' }}>BOOKED</div>
                                ) : isDisabled ? (
                                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textDecoration: 'none', marginTop: '2px' }}>CLOSED</div>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </>
                )}

                {/* Booking Summary */}
                {formData.selectedDay && formData.selectedSlot && (
                  <div style={{ background: apptType === 'emergency' ? '#fff7ed' : `${ACCENT}12`, border: `1.5px solid ${apptType === 'emergency' ? '#fed7aa' : `${ACCENT}44`}`, borderRadius: '14px', padding: '16px 20px', marginBottom: '20px' }}>
                    {apptType === 'emergency' && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: EMERGENCY_COLOR, color: '#fff', borderRadius: '20px', padding: '3px 12px', fontSize: '11px', fontWeight: 700, marginBottom: '10px' }}>
                        ⚡ MINI CONSULTATION
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <FaCalendarAlt style={{ color: apptType === 'emergency' ? EMERGENCY_COLOR : ACCENT }} />
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>Appointment Summary</span>
                    </div>
                    <p style={{ color: '#475569', fontSize: '13.5px', margin: '4px 0' }}>👤 <strong>{formData.name}</strong></p>
                    <p style={{ color: '#475569', fontSize: '13.5px', margin: '4px 0' }}>🩺 {formData.treatment}</p>
                    <p style={{ color: '#475569', fontSize: '13.5px', margin: '4px 0' }}>📅 {formData.selectedDay.full}</p>
                    <p style={{ color: '#475569', fontSize: '13.5px', margin: '4px 0' }}>🕐 {formData.selectedSlot}</p>
                    <p style={{ color: '#475569', fontSize: '13.5px', margin: '4px 0' }}>⏱ {apptType === 'emergency' ? '15-minute Mini Consultation' : '1-hour consultation'}</p>
                  </div>
                )}

                {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>⚠ {error}</p>}

                <button onClick={handleSubmit} disabled={sending || !formData.selectedDay || !formData.selectedSlot}
                  style={{ width: '100%', background: sending ? '#94a3b8' : (apptType === 'emergency' ? EMERGENCY_COLOR : ACCENT), color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}>
                  {sending ? <><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : <><FaCheckCircle /> {apptType === 'emergency' ? 'Book Mini Consultation' : 'Confirm Appointment'}</>}
                </button>
              </div>
            )}

            {/* ── STEP 3: Success ── */}
            {step === 3 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: apptType === 'emergency' ? `${EMERGENCY_COLOR}20` : `${ACCENT}20`, border: `3px solid ${apptType === 'emergency' ? EMERGENCY_COLOR : ACCENT}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '36px', color: apptType === 'emergency' ? EMERGENCY_COLOR : ACCENT }}>
                  <FaCheckCircle />
                </div>
                {apptType === 'emergency' && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: EMERGENCY_COLOR, color: '#fff', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: 700, marginBottom: '14px' }}>
                    ⚡ Mini Consultation Booked
                  </div>
                )}
                <h2 style={{ color: '#0f172a', fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', marginBottom: '12px' }}>
                  {apptType === 'emergency' ? 'Mini Consultation Confirmed! ⚡' : 'Appointment Confirmed! 🌿'}
                </h2>
                <p style={{ color: '#64748b', lineHeight: '1.8', marginBottom: '8px' }}>
                  A confirmation email has been sent to <strong style={{ color: apptType === 'emergency' ? EMERGENCY_COLOR : ACCENT }}>{formData.email}</strong>
                </p>
                <p style={{ color: '#64748b', lineHeight: '1.8', marginBottom: '24px' }}>
                  Our team will call you at <strong>{formData.phone}</strong> at the booked time.
                </p>
                <div style={{ background: apptType === 'emergency' ? '#fff7ed' : `${ACCENT}10`, border: `1px solid ${apptType === 'emergency' ? '#fed7aa' : `${ACCENT}33`}`, borderRadius: '14px', padding: '16px 20px', marginBottom: '28px', textAlign: 'left' }}>
                  {apptType === 'emergency' && <p style={{ margin: '0 0 6px', color: EMERGENCY_COLOR, fontSize: '12px', fontWeight: 700 }}>⚡ MINI CONSULTATION</p>}
                  <p style={{ margin: '4px 0', color: '#475569', fontSize: '14px' }}>📅 <strong>{formData.selectedDay?.full}</strong></p>
                  <p style={{ margin: '4px 0', color: '#475569', fontSize: '14px' }}>🕐 <strong>{formData.selectedSlot}</strong></p>
                  <p style={{ margin: '4px 0', color: '#475569', fontSize: '14px' }}>🩺 <strong>{formData.treatment}</strong></p>
                </div>
                <button onClick={reset} style={{ background: apptType === 'emergency' ? EMERGENCY_COLOR : ACCENT, color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                  Book Another Appointment
                </button>
                <p style={{ color: '#64748b', fontSize: '12px', marginTop: '10px', marginBottom: '0', lineHeight: '1.5' }}>
                  To book an appointment for a family member or another person, please ensure you use their separate email address and phone number.
                </p>

                <div style={{ marginTop: '20px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '14px', padding: '16px 20px' }}>
                  <p style={{ color: '#166534', fontSize: '13px', margin: 0 }}>✅ Your consent was recorded at the start of this booking.</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* WhatsApp Card */}
            <div style={{ background: 'linear-gradient(135deg,#0f3460,#1a5276)', color: '#fff', borderRadius: '24px', padding: 'clamp(24px, 4vw, 40px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FaWhatsapp style={{ fontSize: '60px', color: '#25d366' }} />
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem' }}>Quick WhatsApp Consultation</h2>
              <p style={{ opacity: 0.85, lineHeight: '1.8', fontSize: '0.95rem' }}>
                Connect directly with our team for immediate assistance and appointment scheduling. We typically respond within 30 minutes.
              </p>
              <a href={`https://wa.me/${contactInfo.whatsapp}`} target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#25d366', color: '#fff', padding: '14px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, width: 'fit-content' }}>
                <FaWhatsapp /> Chat on WhatsApp
              </a>
            </div>

            {/* Why Choose Us */}
            <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.07)', border: `1px solid ${ACCENT}18` }}>
              <h3 style={{ color: '#0f172a', fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', marginBottom: '20px' }}>
                Why Book With Us?
              </h3>
              {[
                { icon: <FaLeaf />, text: '100% Natural & Evidence-Based Herbal Protocols' },
                { icon: <FaUserMd />, text: 'Experienced Integrative Oncology Practitioners' },
                { icon: <FaCheckCircle />, text: 'Free First Consultation — No Obligation' },
                { icon: <FaClock />, text: 'Flexible Slots Mon–Sat, 10 AM to 4 PM' },
                { icon: <FaEnvelope />, text: 'Instant Email Confirmation After Booking' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${ACCENT}18`, color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ color: '#475569', fontSize: '13.5px', lineHeight: '1.5' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Map ── */}
      <section id="map" style={{ maxWidth: '1300px', margin: '0 auto 80px', padding: '0 20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '28px', fontFamily: 'Playfair Display, serif', color: '#0f172a' }}>
          Find Our <span style={{ color: ACCENT }}>Location</span>
        </h2>
        <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
          <iframe
            title="Cancer Herbalist Location"
            src="https://maps.google.com/maps?q=Kaggalipura+Bangalore&t=&z=14&ie=UTF8&iwloc=&output=embed"
            width="100%" height="420" style={{ border: 0, display: 'block' }} loading="lazy"
          />
        </div>
      </section>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}