import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt, FaClock, FaUser, FaTrash, FaCheckCircle,
  FaSpinner, FaArrowLeft, FaExclamationTriangle, FaCalendarCheck,
  FaLeaf, FaBriefcase, FaEnvelope, FaPhone
} from 'react-icons/fa';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'https://cancer-herbalist-rhgj.vercel.app').replace(/\/+$/, '');

const PRIMARY = '#1a6e52';
const ACCENT = '#38bed5';
const LIGHT_BG = '#f8fafc';
const DARK = '#0f172a';
const EMERGENCY_COLOR = '#f97316'; // used for Mini Consultation coloring

// Regular 1-hour time slots
const REGULAR_SLOTS = [
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
];

// Emergency 15-min slots (Mini Consultation)
const EMERGENCY_SLOTS = [
  '03:00 PM - 03:15 PM',
  '03:15 PM - 03:30 PM',
  '03:30 PM - 03:45 PM',
  '03:45 PM - 04:00 PM',
];

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

function getAvailableDays() {
  const days = [];
  const today = new Date();
  for (let i = 0; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay(); // 0=Sun, 6=Sat
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

export default function ManageAppointment() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const DAYS = React.useMemo(() => getAvailableDays(), []);

  const [apptId, setApptId] = useState(initialId);
  const [inputId, setInputId] = useState(initialId);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reschedule state
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [enabledRegularSlots, setEnabledRegularSlots] = useState(REGULAR_SLOTS);
  const [enabledEmergencySlots, setEnabledEmergencySlots] = useState(EMERGENCY_SLOTS);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);

  // Cancellation state
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (initialId) {
      fetchAppointment(initialId);
    }
  }, [initialId]);

  const fetchAppointment = async (idToFetch) => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setAppointment(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/public/appointments/${idToFetch}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Appointment not found.');
      }
      setAppointment(data.appointment);
    } catch (err) {
      setError(err.message || 'Failed to retrieve appointment details.');
    } finally {
      setLoading(false);
    }
  };

  const handleIdSubmit = (e) => {
    e.preventDefault();
    if (inputId.trim()) {
      setSearchParams({ id: inputId.trim() });
      setApptId(inputId.trim());
    }
  };

  const handleDaySelect = async (day) => {
    setSelectedDay(day);
    setSelectedSlot('');
    setSlotsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/available-slots?date=${day.label}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setBookedSlots(data.bookedSlots || []);
        setEnabledRegularSlots(data.enabledSlots?.regularSlots || REGULAR_SLOTS);
        setEnabledEmergencySlots(data.enabledSlots?.emergencySlots || EMERGENCY_SLOTS);
      }
    } catch (e) {
      console.error('Failed to load slots:', e);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedDay || !selectedSlot) return;
    setRescheduling(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/public/appointments/${apptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentDay: selectedDay.label,
          appointmentSlot: selectedSlot,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reschedule.');
      }
      setSuccessMsg(`Reschedule Confirmed! Your appointment is now on ${selectedDay.full} at ${selectedSlot}.`);
      setAppointment(prev => ({
        ...prev,
        appointmentDay: selectedDay.label,
        appointmentSlot: selectedSlot,
      }));
      // Reset reschedule view state
      setSelectedDay(null);
      setSelectedSlot('');
    } catch (err) {
      setError(err.message || 'Reschedule failed.');
    } finally {
      setRescheduling(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancelling(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/public/appointments/${apptId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel appointment.');
      }
      setSuccessMsg('Your appointment has been successfully cancelled.');
      setAppointment(null);
    } catch (err) {
      setError(err.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  const isEmergency = appointment?.treatment?.toLowerCase().includes('emergency') || 
                      appointment?.treatment === 'Mini Consultation';

  return (
    <div style={{ background: '#f8fafc', minHeight: '80vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        
        {/* Go back option */}
        <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: PRIMARY, textDecoration: 'none', fontWeight: 600, marginBottom: '24px', fontSize: '14px' }}>
          <FaArrowLeft /> Back to Booking Page
        </Link>

        {/* ── CARD WRAPPER ── */}
        <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', padding: '36px', overflow: 'hidden' }}>
          
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: DARK, marginBottom: '8px', textAlign: 'center' }}>
            Manage Your <span style={{ color: PRIMARY }}>Appointment</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>
            Reschedule or cancel your existing consultation slot online.
          </p>

          {/* ── STEP 1: Enter ID if not provided ── */}
          {!apptId && (
            <form onSubmit={handleIdSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                  Appointment ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. APT-1698234723901-XYZ"
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0',
                    fontSize: '15px', outline: 'none', background: LIGHT_BG, color: DARK, boxSizing: 'border-box'
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  background: PRIMARY, color: '#fff', border: 'none', padding: '16px', borderRadius: '12px',
                  fontWeight: 700, fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 4px 14px rgba(26,110,82,0.2)'
                }}
              >
                Retrieve Appointment
              </button>
            </form>
          )}

          {/* ── LOADING ── */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <FaSpinner style={{ animation: 'spin 1.5s linear infinite', fontSize: '32px', color: PRIMARY }} />
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: '12px' }}>Loading appointment details...</p>
            </div>
          )}

          {/* ── ERRORS & SUCCESS ── */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '14px', padding: '16px', color: '#b91c1c', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaExclamationTriangle style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '14px', padding: '16px', color: '#166534', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaCheckCircle style={{ flexShrink: 0, color: '#22c55e' }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── APPOINTMENT DETAILS ── */}
          {appointment && (
            <div>
              <div style={{ background: LIGHT_BG, borderRadius: '16px', padding: '24px', border: '1.5px solid #e2e8f0', marginBottom: '32px' }}>
                <h4 style={{ margin: '0 0 16px', color: DARK, fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCalendarCheck style={{ color: PRIMARY }} /> Current Appointment Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', fontSize: '14px', color: '#475569' }}>
                  <p style={{ margin: 0 }}>👤 <strong>Patient:</strong> {appointment.name}</p>
                  <p style={{ margin: 0 }}>🩺 <strong>Consultation:</strong> {appointment.treatment}</p>
                  <p style={{ margin: 0 }}>📅 <strong>Date:</strong> {appointment.appointmentDay}</p>
                  <p style={{ margin: 0 }}>🕐 <strong>Time Slot:</strong> {appointment.appointmentSlot}</p>
                  <p style={{ margin: 0 }}>🆔 <strong>ID:</strong> <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{appointment.apptId}</code></p>
                </div>
              </div>

              {/* ACTIONS PANEL */}
              {!selectedDay && !rescheduling && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <button
                    onClick={() => handleDaySelect(DAYS[0])} // Initialize rescheduling
                    style={{
                      background: PRIMARY, color: '#fff', border: 'none', padding: '14px 20px', borderRadius: '12px',
                      fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: '0 4px 12px rgba(26,110,82,0.15)'
                    }}
                  >
                    <FaCalendarAlt /> Reschedule
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    style={{
                      background: '#ef4444', color: '#fff', border: 'none', padding: '14px 20px', borderRadius: '12px',
                      fontWeight: 700, fontSize: '14px', cursor: cancelling ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: '0 4px 12px rgba(239,68,68,0.15)'
                    }}
                  >
                    {cancelling ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaTrash />} Cancel
                  </button>
                </div>
              )}

              {/* ── RESCHEDULE FLOW ── */}
              {selectedDay && (
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '32px', marginTop: '16px' }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: DARK, marginBottom: '20px' }}>
                    Choose <span style={{ color: PRIMARY }}>New Date & Time</span>
                  </h3>

                  {/* Day Picker */}
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Select Date *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100px, 100%), 1fr))', gap: '8px', marginBottom: '24px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                    {DAYS.slice(0, 18).map((day, i) => {
                      const selected = selectedDay.label === day.label;
                      const activeColor = isEmergency ? EMERGENCY_COLOR : ACCENT;
                      return (
                        <button key={i} type="button" onClick={() => handleDaySelect(day)}
                          style={{ padding: '10px 6px', borderRadius: '10px', border: `2px solid ${selected ? activeColor : '#e2e8f0'}`, background: selected ? `${activeColor}18` : '#f8fafc', color: selected ? activeColor : '#475569', fontWeight: selected ? 700 : 500, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', lineHeight: '1.4' }}>
                          {day.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Time Slot Picker */}
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                    Select Time Slot for {selectedDay.label} *
                    {slotsLoading && <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 400, marginLeft: '8px' }}>Loading availability…</span>}
                  </label>

                  {/* Slot availability check */}
                  {(() => {
                    const activeColor = isEmergency ? EMERGENCY_COLOR : ACCENT;
                    const slotsToShow = isEmergency ? EMERGENCY_SLOTS : REGULAR_SLOTS;
                    const enabledSlots = isEmergency ? enabledEmergencySlots : enabledRegularSlots;

                    const isToday = selectedDay && new Date(selectedDay.date).toDateString() === new Date().toDateString();
                    const visibleSlots = slotsToShow.filter(slot => !(isToday && isSlotInPast(slot)));

                    if (visibleSlots.length === 0) {
                      return (
                        <div style={{ padding: '20px 16px', background: '#fff7ed', border: '1.5px dashed #fed7aa', borderRadius: '12px', textAlign: 'center', color: '#c2410c', fontSize: '13px', fontWeight: 500, marginBottom: '24px' }}>
                          ⚡ All slots for today have already passed. Please select another date above.
                        </div>
                      );
                    }

                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(150px, 100%), 1fr))', gap: '8px', marginBottom: '24px' }}>
                        {isEmergency && (
                          <>
                            <div style={{
                              padding: '12px 10px', borderRadius: '10px', border: '1.5px dashed #cbd5e1',
                              background: '#f1f5f9', color: '#94a3b8', fontSize: '12.5px', fontWeight: 600,
                              textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', opacity: 0.85
                            }}>
                              <span>10:00 AM - 12:00 PM</span>
                              <span style={{ fontSize: '8px', fontWeight: 700, color: '#64748b' }}>RESEARCH & ADMIN</span>
                            </div>
                            <div style={{
                              padding: '12px 10px', borderRadius: '10px', border: '1.5px dashed #cbd5e1',
                              background: '#f1f5f9', color: '#94a3b8', fontSize: '12.5px', fontWeight: 600,
                              textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', opacity: 0.85
                            }}>
                              <span>12:00 PM - 03:00 PM</span>
                              <span style={{ fontSize: '8px', fontWeight: 700, color: '#64748b' }}>RESEARCH & ADMIN</span>
                            </div>
                          </>
                        )}

                        {visibleSlots.map((slot) => {
                          const isSelected = selectedSlot === slot;
                          const isBooked = bookedSlots.includes(slot);
                          const isDisabled = !enabledSlots.includes(slot);

                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isBooked || isDisabled}
                              onClick={() => setSelectedSlot(slot)}
                              style={{
                                padding: '12px 10px',
                                borderRadius: '10px',
                                border: `1.5px solid ${isSelected ? activeColor : (isBooked || isDisabled ? '#cbd5e1' : '#e2e8f0')}`,
                                background: isSelected ? `${activeColor}15` : (isBooked || isDisabled ? '#f1f5f9' : '#fff'),
                                color: isSelected ? activeColor : (isBooked || isDisabled ? '#94a3b8' : '#334155'),
                                fontSize: '12.5px',
                                fontWeight: isSelected ? 700 : 500,
                                cursor: isBooked || isDisabled ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <span>{slot}</span>
                              {isBooked ? (
                                <div style={{ fontSize: '9px', fontWeight: 700, color: '#ef4444', marginTop: '2px' }}>BOOKED</div>
                              ) : isDisabled ? (
                                <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', marginTop: '2px' }}>CLOSED</div>
                              ) : null}
                            </button>
                          );
                        })}

                        {!isEmergency && (
                          <>
                            <div style={{
                              padding: '12px 10px', borderRadius: '10px', border: '1.5px dashed #cbd5e1',
                              background: '#f1f5f9', color: '#94a3b8', fontSize: '12.5px', fontWeight: 600,
                              textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', opacity: 0.85
                            }}>
                              <span>12:00 PM - 03:00 PM</span>
                              <span style={{ fontSize: '8px', fontWeight: 700, color: '#64748b' }}>RESEARCH & ADMIN</span>
                            </div>
                            <div style={{
                              padding: '12px 10px', borderRadius: '10px', border: '1.5px dashed #cbd5e1',
                              background: '#f1f5f9', color: '#94a3b8', fontSize: '12.5px', fontWeight: 600,
                              textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', opacity: 0.85
                            }}>
                              <span>03:00 PM - 04:00 PM</span>
                              <span style={{ fontSize: '8px', fontWeight: 700, color: '#64748b' }}>RESEARCH & ADMIN</span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* Confirm actions */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                    <button
                      onClick={handleReschedule}
                      disabled={rescheduling || !selectedDay || !selectedSlot}
                      style={{
                        flex: 1, background: PRIMARY, color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '12px',
                        fontWeight: 700, fontSize: '14px', cursor: rescheduling || !selectedSlot ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      {rescheduling ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheckCircle />} Confirm Reschedule
                    </button>
                    <button
                      onClick={() => { setSelectedDay(null); setSelectedSlot(''); }}
                      style={{
                        padding: '14px 20px', borderRadius: '12px', border: '1.5px solid #cbd5e1',
                        background: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reset Retrieve flow */}
          {appointment === null && apptId && !loading && (
            <div style={{ textAlgin: 'center', marginTop: '24px' }}>
              <button
                onClick={() => { setApptId(''); setInputId(''); setError(''); setSuccessMsg(''); }}
                style={{
                  background: 'none', border: 'none', color: PRIMARY, cursor: 'pointer',
                  fontWeight: 600, fontSize: '14px', textDecoration: 'underline'
                }}
              >
                Manage another appointment
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
