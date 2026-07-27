import React, { useState, useEffect, useCallback } from 'react';
import {
  FaCalendarAlt, FaClock, FaUser, FaPhone, FaEnvelope, FaLeaf, FaLock,
  FaSync, FaWhatsapp, FaInfoCircle, FaArrowUp, FaArrowDown, FaTrash, FaPlus, FaEdit
} from 'react-icons/fa';
import { useContent } from '../context/ContentContext';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'https://cancer-herbalist-rhgj.vercel.app').replace(/\/+$/, '');
const THEMES = {
  green: { primary: '#1a6e52', accent: '#38bed5', name: '🌿 Green Recovery' },
  blue: { primary: '#0f4c81', accent: '#4b9cd3', name: '🌊 Ocean Calm' },
  violet: { primary: '#5c2a72', accent: '#d39e82', name: '🔮 Royal Healing' },
  rose: { primary: '#9d2235', accent: '#e28743', name: '🌸 Sunset Health' },
  dark: { primary: '#2d3748', accent: '#a0aec0', name: '🖤 Charcoal Sleek' },
};

const TIME_SLOTS = [
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
];

const EMERGENCY_SLOTS = [
  '03:00 PM - 03:15 PM',
  '03:15 PM - 03:30 PM',
  '03:30 PM - 03:45 PM',
  '03:45 PM - 04:00 PM',
];

const ALL_SLOTS = [...TIME_SLOTS, ...EMERGENCY_SLOTS];
const EMERGENCY_COLOR = '#f97316';

function todayLabel() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function AdminDashboard() {
  const [theme, setTheme] = useState(() => localStorage.getItem('ch_admin_theme') || 'green');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ch_admin_dark_mode') === 'true');

  const currentThemeColors = THEMES[theme] || THEMES.green;
  const PRIMARY = currentThemeColors.primary;
  const ACCENT  = currentThemeColors.accent;

  const bgMain = darkMode ? '#0f172a' : '#f8fafc';
  const bgCard = darkMode ? '#1e293b' : '#fff';
  const borderCard = darkMode ? '#334155' : '#e2e8f0';
  const textPrimary = darkMode ? '#f8fafc' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const inputBg = darkMode ? '#334155' : '#fff';
  const inputBorder = darkMode ? '#475569' : '#cbd5e1';
  const inputText = darkMode ? '#f8fafc' : '#1e293b';

  const [secret, setSecret]         = useState(
    () => localStorage.getItem('ch_admin_secret') || ''
  );
  const [authed, setAuthed]         = useState(
    () => localStorage.getItem('ch_admin_authed') === 'true'
  );
  const [authError, setAuthError]   = useState('');
  const [appointments, setAppts]    = useState([]);
  const [loading, setLoading]       = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [filterDate, setFilterDate] = useState('today');
  const [selectedAppt, setSelected] = useState(null);
  const [slotViewDate, setSlotViewDate] = useState(null); // date string for the slot grid

  // Reschedule state
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [isEditingReschedule, setIsEditingReschedule] = useState(false);

  useEffect(() => {
    if (selectedAppt) {
      setIsEditingReschedule(false);
      setRescheduleSlot(selectedAppt.appointmentSlot);
      try {
        const d = new Date(selectedAppt.appointmentDay);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          setRescheduleDate(`${yyyy}-${mm}-${dd}`);
        } else {
          setRescheduleDate('');
        }
      } catch {
        setRescheduleDate('');
      }
    }
  }, [selectedAppt]);

  const formatRescheduleDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  // ── Website Content Management State ──
  const { content: globalContent, updateContent: saveGlobalContent, refreshContent } = useContent();
  const [generalForm, setGeneralForm] = useState(null);
  const [generalSubTab, setGeneralSubTab] = useState('contact'); // 'contact' | 'stats' | 'whyChooseUs' | 'healingPillars' | 'heroSlides'
  const [activeHeroSlideIdx, setActiveHeroSlideIdx] = useState(0);
  const [activeDashboardTab, setActiveDashboardTab] = useState('appointments'); // 'appointments' | 'content'

  // Daily Slot Manager state
  const [slotManagerDate, setSlotManagerDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  });
  const [slotManagerConfig, setSlotManagerConfig] = useState({}); // date -> { regularSlots:[], emergencySlots:[] }
  const [slotManagerLoading, setSlotManagerLoading] = useState(false);
  const [slotManagerSaving, setSlotManagerSaving] = useState(false);
  // For current date being edited: local toggle state
  const [editRegularSlots, setEditRegularSlots] = useState(new Set(TIME_SLOTS));
  const [editEmergencySlots, setEditEmergencySlots] = useState(new Set(EMERGENCY_SLOTS));
  const [slotManagerIsCustom, setSlotManagerIsCustom] = useState(false);
  const [contentTab, setContentTab] = useState('products'); // 'products' | 'testimonials' | 'general'
  const [dynProducts, setDynProducts] = useState([]);
  const [dynTestimonials, setDynTestimonials] = useState([]);

  useEffect(() => {
    if (globalContent) {
      setGeneralForm(JSON.parse(JSON.stringify(globalContent)));
    }
  }, [globalContent]);

  // Editing states
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '', category: 'Immunity', price: '', originalPrice: '',
    description: '', benefits: '', ingredients: '', dosage: '',
    size: '', badge: '', icon: '🌿', color: '#1a6e52'
  });
  const [testimonialForm, setTestimonialForm] = useState({
    name: '', location: 'India', rating: 5, text: '', date: 'Recent', videoUrl: '', thumbnailUrl: ''
  });

  const [formStatus, setFormStatus] = useState(''); // 'sending' | 'success' | 'error'
  const [formError, setFormError] = useState('');

  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '10px',
    border: '1.5px solid var(--input-border)', fontSize: '13.5px', outline: 'none',
    background: 'var(--input-bg)', color: 'var(--input-text)', boxSizing: 'border-box',
    fontFamily: 'inherit', transition: 'all 0.2s ease',
  };

  const submitBtnStyle = {
    width: '100%', padding: '14px',
    background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
    color: '#fff', border: 'none', borderRadius: '12px',
    fontWeight: 700, fontSize: '14px', cursor: 'pointer',
    fontFamily: 'inherit', boxShadow: `0 6px 20px ${ACCENT}22`, marginTop: '10px',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
  };

  const today = todayLabel();

  // Load dynamic content list from API
  const loadDynamicContent = useCallback(async () => {
    try {
      const pRes = await fetch(`${BACKEND_URL}/api/dynamic-products`);
      const pData = await pRes.json();
      if (pData.success) setDynProducts(pData.products || []);

      const tRes = await fetch(`${BACKEND_URL}/api/dynamic-testimonials`);
      const tData = await tRes.json();
      if (tData.success) setDynTestimonials(tData.testimonials || []);
    } catch (e) {
      console.warn('Failed to load dynamic content:', e);
    }
  }, []);


  const normalizeApptDates = useCallback((rawAppts) => {
    const isoPattern = /^\d{4}-\d{2}-\d{2}/;
    return (rawAppts || []).map(a => {
      if (a.appointmentDay && (a.appointmentDay instanceof Date || (typeof a.appointmentDay === 'string' && isoPattern.test(a.appointmentDay)))) {
        const parsed = new Date(a.appointmentDay);
        if (!isNaN(parsed.getTime())) {
          return {
            ...a,
            appointmentDay: parsed.toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: 'Asia/Kolkata'
            })
          };
        }
      }
      return a;
    });
  }, []);

  /* ── Fetch appointments ──────────────────────────────────────── */
  const fetchAppts = useCallback(async (key, dateFilter) => {
    setLoading(true);
    setFetchError('');
    try {
      const params = new URLSearchParams({ key });
      if (dateFilter && dateFilter !== 'all') {
        params.append('date', dateFilter === 'today' ? today : dateFilter);
      }
      const res  = await fetch(`${BACKEND_URL}/api/appointments?${params}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch.');
      setAppts(normalizeApptDates(data.appointments || []));
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }, [today, normalizeApptDates]);

  /* ── Login ────────────────────────────────────────── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      const res  = await fetch(`${BACKEND_URL}/api/appointments?key=${secret}`);
      const data = await res.json();
      if (res.status === 401 || !data.success) { setAuthError('Wrong password. Try again.'); setLoading(false); return; }
      // Save session to localStorage so Navbar can show admin link
      localStorage.setItem('ch_admin_authed', 'true');
      localStorage.setItem('ch_admin_secret', secret);
      setAuthed(true);
      setAppts(normalizeApptDates(data.appointments || []));
    } catch {
      setAuthError('Cannot reach server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Logout ────────────────────────────────────────── */
  const handleLogout = () => {
    localStorage.removeItem('ch_admin_authed');
    localStorage.removeItem('ch_admin_secret');
    setAuthed(false);
    setSecret('');
    setAppts([]);
  };

  /* ── Cancel Appointment ────────────────────────────────── */
  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/appointments/${apptId}?key=${secret}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to cancel.');
      showToast('✅ Appointment cancelled successfully.');
      setSelected(null);
      fetchAppts(secret, filterDate);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  /* ── Reschedule Appointment ────────────────────────────── */
  const handleRescheduleAppointment = async (apptId, newDay, newSlot) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/appointments/${apptId}?key=${secret}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentDay: newDay, appointmentSlot: newSlot }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to reschedule.');
      showToast('📅 Appointment rescheduled successfully!');
      setSelected(null);
      fetchAppts(secret, filterDate);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  /* ── Block Slot ────────────────────────────────────────── */
  const handleBlockSlot = async (day, slot) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/appointments/block?key=${secret}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentDay: day, appointmentSlot: slot }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to block slot.');
      showToast('🔒 Slot blocked successfully.');
      fetchAppts(secret, filterDate);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  /* ── Unblock Slot ──────────────────────────────────────── */
  const handleUnblockSlot = async (apptId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/appointments/${apptId}?key=${secret}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to unblock.');
      showToast('🔓 Slot unblocked successfully.');
      setSelected(null);
      fetchAppts(secret, filterDate);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  /* ── Clear All Blocked Slots ───────────────────────────── */
  const handleClearAllBlocks = async (day) => {
    const blockedAppts = appointments.filter(a => a.appointmentDay === day && a.name === '[BLOCKED]');
    if (blockedAppts.length === 0) {
      showToast('No blocked slots found on this day.', 'info');
      return;
    }
    if (!window.confirm(`Clear all ${blockedAppts.length} blocked slots on ${day}?`)) return;
    
    setLoading(true);
    try {
      await Promise.all(blockedAppts.map(a =>
        fetch(`${BACKEND_URL}/api/appointments/${a.apptId}?key=${secret}`, { method: 'DELETE' })
      ));
      showToast('🔓 All blocked slots cleared successfully.');
      fetchAppts(secret, filterDate);
    } catch (err) {
      showToast(`Error clearing blocked slots: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ── Slot Manager: fetch config for a date ─────────────── */
  const fetchSlotConfig = useCallback(async (dateStr) => {
    if (!secret) return;
    setSlotManagerLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/slot-config?date=${encodeURIComponent(dateStr)}`);
      const data = await res.json();
      if (data.success) {
        setSlotManagerIsCustom(data.isCustom);
        if (data.isCustom && data.enabledSlots) {
          setEditRegularSlots(new Set(data.enabledSlots.regularSlots || []));
          setEditEmergencySlots(new Set(data.enabledSlots.emergencySlots || []));
        } else {
          // Default: only default open slots checked
          setEditRegularSlots(new Set(['10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM']));
          setEditEmergencySlots(new Set(['03:00 PM - 03:15 PM', '03:15 PM - 03:30 PM', '03:30 PM - 03:45 PM', '03:45 PM - 04:00 PM']));
        }
      }
    } catch (err) {
      console.warn('[slotManager] fetch config error:', err.message);
    } finally {
      setSlotManagerLoading(false);
    }
  }, [secret]);

  /* ── Slot Manager: save config for a date ──────────────── */
  const saveSlotConfig = async () => {
    setSlotManagerSaving(true);
    try {
      // Convert date string YYYY-MM-DD to the full label format used by appointments
      const d = new Date(slotManagerDate + 'T00:00:00');
      const dateLabel = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const res = await fetch(`${BACKEND_URL}/api/admin/slot-config?key=${secret}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateLabel,
          regularSlots: [...editRegularSlots],
          emergencySlots: [...editEmergencySlots],
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save.');
      setSlotManagerIsCustom(true);
      showToast('📅 Slot configuration saved!');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setSlotManagerSaving(false);
    }
  };

  /* ── Slot Manager: reset a date to default (all open) ──── */
  const resetSlotConfig = async () => {
    if (!window.confirm('Reset this date to all slots open?')) return;
    try {
      const d = new Date(slotManagerDate + 'T00:00:00');
      const dateLabel = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const encodedDate = encodeURIComponent(dateLabel);
      const res = await fetch(`${BACKEND_URL}/api/admin/slot-config/${encodedDate}?key=${secret}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to reset.');
      setEditRegularSlots(new Set(TIME_SLOTS));
      setEditEmergencySlots(new Set(EMERGENCY_SLOTS));
      setSlotManagerIsCustom(false);
      showToast('🔓 Date reset to all slots open.');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };


  // ── Toast notification system (replaces blocking alert() calls) ──
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // ── Orders & Refunds State ──
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const fetchOrders = useCallback(async (key, force = false) => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const url = force
        ? `${BACKEND_URL}/api/admin/orders?key=${key}&force=true`
        : `${BACKEND_URL}/api/admin/orders?key=${key}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch orders.');
      setOrders(data.orders || []);
    } catch (err) {
      setOrdersError(err.message);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const fetchOrderDetails = useCallback(async (orderId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}?key=${secret}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch details.');
      setSelectedOrderDetails(data);
    } catch (err) {
      showToast(`Error loading details: ${err.message}`, 'error');
    }
  }, [secret, showToast]);

  const handleApproveCancellation = async (orderId, approved, remarksOrReason) => {
    try {
      const body = approved 
        ? { approved: true, remarks: remarksOrReason } 
        : { approved: false, rejectionReason: remarksOrReason };
      const res = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}/cancellation?key=${secret}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Action failed.');
      showToast(approved ? 'Cancellation approved successfully!' : 'Cancellation request rejected.');
      fetchOrders(secret);
      if (selectedOrder && selectedOrder.orderId === orderId) {
        fetchOrderDetails(orderId);
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleApproveReturn = async (orderId, approved, physicalReturnRequired, remarksOrReason) => {
    try {
      const body = approved 
        ? { approved: true, physicalReturnRequired, remarks: remarksOrReason } 
        : { approved: false, rejectionReason: remarksOrReason };
      const res = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}/return?key=${secret}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Action failed.');
      showToast(approved ? 'Return approved successfully!' : 'Return request rejected.');
      fetchOrders(secret);
      if (selectedOrder && selectedOrder.orderId === orderId) {
        fetchOrderDetails(orderId);
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleReceiveReturn = async (orderId, received, remarks) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}/return/receive?key=${secret}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ received, remarks })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Action failed.');
      showToast(received ? 'Return marked as received. Refund is now approved.' : 'Return marked as failed.');
      fetchOrders(secret);
      if (selectedOrder && selectedOrder.orderId === orderId) {
        fetchOrderDetails(orderId);
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleInitiateRefund = async (orderId, manualTxnId = '', manualMethod = '') => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}/refund/initiate?key=${secret}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualTxnId, manualMethod })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Action failed.');
      showToast('Refund initiated successfully!');
      fetchOrders(secret);
      if (selectedOrder && selectedOrder.orderId === orderId) {
        fetchOrderDetails(orderId);
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleSyncRefund = async (orderId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}/refund/sync?key=${secret}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Action failed.');
      showToast(`Refund status synced: ${data.refund.status}`);
      fetchOrders(secret);
      if (selectedOrder && selectedOrder.orderId === orderId) {
        fetchOrderDetails(orderId);
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleCancelOrderDirect = async (orderId, remarks) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}/cancel?key=${secret}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Action failed.');
      showToast('Order successfully cancelled!');
      fetchOrders(secret);
      if (selectedOrder && selectedOrder.orderId === orderId) {
        fetchOrderDetails(orderId);
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleShipOrderDirect = async (orderId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}/ship?key=${secret}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Action failed.');
      showToast('Order processed and shipped successfully!');
      fetchOrders(secret);
      if (selectedOrder && selectedOrder.orderId === orderId) {
        fetchOrderDetails(orderId);
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Permanently delete order ${orderId}?`)) return;
    // Optimistic UI: remove from state immediately for instant feedback
    const previousOrders = orders;
    setOrders(prev => prev.filter(o => o.orderId !== orderId));
    if (selectedOrder?.orderId === orderId) {
      setSelectedOrder(null);
      setSelectedOrderDetails(null);
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}?key=${secret}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Delete failed.');
      showToast('Order deleted! Syncing with Sheets…');
      // Force-sync from Sheets to confirm deletion and remove any stale cache
      await fetchOrders(secret, true);
    } catch (err) {
      // Rollback on failure
      setOrders(previousOrders);
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  const handleDeleteAllOrders = async () => {
    const confirmation = prompt('WARNING: This will permanently delete ALL orders. Type "DELETE ALL" to confirm:');
    if (confirmation !== 'DELETE ALL') {
      showToast('Deletion cancelled. Confirmation text did not match.', 'error');
      return;
    }
    // Optimistic UI: clear state immediately for instant feedback
    const previousOrders = orders;
    setOrders([]);
    setSelectedOrder(null);
    setSelectedOrderDetails(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/orders?key=${secret}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Delete failed.');
      showToast('All orders deleted! Syncing with Sheets…');
      // Force-sync from Sheets to confirm all deletions completed
      await fetchOrders(secret, true);
    } catch (err) {
      // Rollback on failure
      setOrders(previousOrders);
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  const handleEditOrder = async (orderId, updatedFields) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}/edit?key=${secret}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Update failed.');
      showToast('Order updated successfully!');
      fetchOrders(secret);
      if (selectedOrder && selectedOrder.orderId === orderId) {
        fetchOrderDetails(orderId);
      }
    } catch (err) {
      showToast(`Error updating order: ${err.message}`, 'error');
      throw err;
    }
  };

  /* ── Auto-refresh every 60s ──────────────────────────────────── */
  useEffect(() => {
    if (!authed) return;
    fetchAppts(secret, filterDate);
    fetchOrders(secret);
    loadDynamicContent();
    const id = setInterval(() => {
      fetchAppts(secret, filterDate);
      fetchOrders(secret);
      loadDynamicContent();
    }, 60_000);
    return () => clearInterval(id);
  }, [authed, filterDate, secret, fetchAppts, fetchOrders, loadDynamicContent]);

  /* ── Content Submission Handlers ─────────────────────────────── */
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    setFormError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/dynamic-products?key=${secret}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          benefits: productForm.benefits ? productForm.benefits.split(',').map(b => b.trim()) : []
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to add product.');
      
      setFormStatus('success');
      showToast('✅ Product added successfully!');
      setProductForm({
        name: '', category: 'Immunity', price: '', originalPrice: '',
        description: '', benefits: '', ingredients: '', dosage: '',
        size: '', badge: '', icon: '🌿', color: '#1a6e52'
      });
      loadDynamicContent();
      setTimeout(() => setFormStatus(''), 3000);
    } catch (err) {
      setFormStatus('error');
      setFormError(err.message);
      showToast(`Failed to add product: ${err.message}`, 'error');
    }
  };

  const handleUpdateGeneralContent = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    setFormError('');
    try {
      const res = await saveGlobalContent(generalForm, secret);
      if (res.success) {
        setFormStatus('success');
        showToast('🌐 Website content saved! Changes are now live.');
        refreshContent();
        setTimeout(() => setFormStatus(''), 4000);
      } else {
        setFormStatus('error');
        setFormError(res.error || 'Failed to update website copy.');
        showToast(res.error || 'Failed to update website copy.', 'error');
      }
    } catch (err) {
      setFormStatus('error');
      setFormError(err.message || 'An error occurred while saving.');
      showToast(err.message || 'An error occurred while saving.', 'error');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setFormStatus('sending');
    setFormError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/dynamic-products/${editingProduct.id}?key=${secret}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          benefits: productForm.benefits ? productForm.benefits.split(',').map(b => b.trim()) : []
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update product.');
      
      setFormStatus('success');
      showToast('✅ Product updated successfully!');
      setEditingProduct(null);
      setProductForm({
        name: '', category: 'Immunity', price: '', originalPrice: '',
        description: '', benefits: '', ingredients: '', dosage: '',
        size: '', badge: '', icon: '🌿', color: '#1a6e52'
      });
      loadDynamicContent();
      setTimeout(() => setFormStatus(''), 3000);
    } catch (err) {
      setFormStatus('error');
      setFormError(err.message);
      showToast(`Failed to update product: ${err.message}`, 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/dynamic-products/${id}?key=${secret}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete product.');
      if (editingProduct && editingProduct.id === id) {
        setEditingProduct(null);
        setProductForm({
          name: '', category: 'Immunity', price: '', originalPrice: '',
          description: '', benefits: '', ingredients: '', dosage: '',
          size: '', badge: '', icon: '🌿', color: '#1a6e52'
        });
      }
      showToast('🗑️ Product deleted successfully.');
      loadDynamicContent();
    } catch (err) {
      showToast(`Error deleting product: ${err.message}`, 'error');
    }
  };

  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    setFormError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/dynamic-testimonials?key=${secret}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonialForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to add testimonial.');
      
      setFormStatus('success');
      showToast('✅ Testimonial added successfully!');
      setTestimonialForm({
        name: '', location: 'India', rating: 5, text: '', date: 'Recent', videoUrl: '', thumbnailUrl: ''
      });
      loadDynamicContent();
      setTimeout(() => setFormStatus(''), 3000);
    } catch (err) {
      setFormStatus('error');
      setFormError(err.message);
      showToast(`Failed to add testimonial: ${err.message}`, 'error');
    }
  };

  const handleUpdateTestimonial = async (e) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    setFormStatus('sending');
    setFormError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/dynamic-testimonials/${editingTestimonial.id}?key=${secret}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonialForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update testimonial.');
      
      setFormStatus('success');
      showToast('✅ Testimonial updated successfully!');
      setEditingTestimonial(null);
      setTestimonialForm({
        name: '', location: 'India', rating: 5, text: '', date: 'Recent', videoUrl: '', thumbnailUrl: ''
      });
      loadDynamicContent();
      setTimeout(() => setFormStatus(''), 3000);
    } catch (err) {
      setFormStatus('error');
      setFormError(err.message);
      showToast(`Failed to update testimonial: ${err.message}`, 'error');
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/dynamic-testimonials/${id}?key=${secret}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete testimonial.');
      if (editingTestimonial && editingTestimonial.id === id) {
        setEditingTestimonial(null);
        setTestimonialForm({
          name: '', location: 'India', rating: 5, text: '', date: 'Recent', videoUrl: '', thumbnailUrl: ''
        });
      }
      showToast('🗑️ Testimonial deleted successfully.');
      loadDynamicContent();
    } catch (err) {
      showToast(`Error deleting testimonial: ${err.message}`, 'error');
    }
  };

  const renderListEditor = (title, path, fields, newItemTemplate) => {
    const parts = path.split('.');
    let arr = generalForm;
    for (const part of parts) {
      arr = arr ? arr[part] : undefined;
    }
    if (!Array.isArray(arr)) arr = [];

    const handleFieldChange = (idx, key, val) => {
      const updated = { ...generalForm };
      let cur = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]][idx][key] = val;
      setGeneralForm(updated);
    };

    const handleAdd = () => {
      const updated = { ...generalForm };
      let cur = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        cur = cur[parts[i]];
      }
      if (!cur[parts[parts.length - 1]]) cur[parts[parts.length - 1]] = [];
      cur[parts[parts.length - 1]].push({ ...newItemTemplate });
      setGeneralForm(updated);
    };

    const handleDelete = (idx) => {
      if (!window.confirm('Are you sure you want to delete this item?')) return;
      const updated = { ...generalForm };
      let cur = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]].splice(idx, 1);
      setGeneralForm(updated);
    };

    const handleMove = (idx, dir) => {
      const updated = { ...generalForm };
      let cur = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        cur = cur[parts[i]];
      }
      const targetArr = cur[parts[parts.length - 1]];
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= targetArr.length) return;
      const temp = targetArr[idx];
      targetArr[idx] = targetArr[nextIdx];
      targetArr[nextIdx] = temp;
      setGeneralForm(updated);
    };

    return (
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
          <h4 style={{ margin: 0, fontSize: '13.5px', color: PRIMARY, fontWeight: 700 }}>{title}</h4>
          <button
            type="button"
            onClick={handleAdd}
            style={{
              background: PRIMARY, color: '#fff', border: 'none', borderRadius: '6px',
              padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <FaPlus /> Add Item
          </button>
        </div>

        {arr.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: '10px 0', textAlign: 'center' }}>No items yet. Click "Add Item" above.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {arr.map((item, idx) => (
              <div key={idx} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Item #{idx + 1}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, -1)}
                      style={{ background: '#f1f5f9', border: 'none', borderRadius: '4px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', cursor: idx === 0 ? 'not-allowed' : 'pointer', fontSize: '11px' }}
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      type="button"
                      disabled={idx === arr.length - 1}
                      onClick={() => handleMove(idx, 1)}
                      style={{ background: '#f1f5f9', border: 'none', borderRadius: '4px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', cursor: idx === arr.length - 1 ? 'not-allowed' : 'pointer', fontSize: '11px' }}
                    >
                      <FaArrowDown />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      style={{ background: '#fee2e2', border: 'none', borderRadius: '4px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer', fontSize: '11px' }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {fields.map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>{f.label}</label>
                      {f.type === 'textarea' ? (
                        <textarea
                          rows={2}
                          value={item[f.key] || ''}
                          onChange={e => handleFieldChange(idx, f.key, e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', fontFamily: 'inherit', color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                        />
                      ) : f.type === 'color' ? (
                        <input
                          type="color"
                          value={item[f.key] || '#1a6e52'}
                          onChange={e => handleFieldChange(idx, f.key, e.target.value)}
                          style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', fontFamily: 'inherit', color: '#1e293b', outline: 'none', boxSizing: 'border-box', height: '40px' }}
                        />
                      ) : f.type === 'image' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  handleFieldChange(idx, f.key, reader.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            style={{ fontSize: '12px' }}
                          />
                          <input
                            type="text"
                            placeholder="Or paste image URL"
                            value={item[f.key] || ''}
                            onChange={e => handleFieldChange(idx, f.key, e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', fontFamily: 'inherit', color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                          />
                          {item[f.key] && (
                            <img
                              src={item[f.key]}
                              alt="Preview"
                              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                            />
                          )}
                        </div>
                      ) : (
                        <input
                          type={f.type || 'text'}
                          value={item[f.key] || ''}
                          onChange={e => handleFieldChange(idx, f.key, e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', fontFamily: 'inherit', color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ── Slot grid helpers ──────────────────────────────── */
  const todayAppts       = appointments.filter(a =>
    a.appointmentDay.toLowerCase().includes(today.toLowerCase())
  );
  const todayBookedSlots = new Set(todayAppts.map(a => a.appointmentSlot));

  // Slot grid shows: selected appointment's date > today > first appointment's date
  const slotGridDate = slotViewDate
    || (todayAppts.length > 0 ? today : appointments[0]?.appointmentDay || today);
  const slotGridAppts   = appointments.filter(a => a.appointmentDay === slotGridDate);
  const slotGridBooked  = new Set(slotGridAppts.map(a => a.appointmentSlot));

  /* ═══════════════════════════════════════════════════════════════
     LOGIN SCREEN
  ═══════════════════════════════════════════════════════════════ */
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${PRIMARY} 0%, #0f3460 100%)`,
        fontFamily: 'Poppins, sans-serif',
      }}>
        <div style={{
          background: '#fff', borderRadius: '24px', padding: '48px 40px',
          width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌿</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#0f172a', fontSize: '1.6rem', margin: '0 0 6px' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '32px' }}>
            Cancer Herbalist — Appointment Manager
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <FaLock style={{
                position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                color: '#94a3b8', fontSize: '14px',
              }} />
              <input
                type="password"
                placeholder="Enter admin password"
                value={secret}
                onChange={e => setSecret(e.target.value)}
                required
                style={{
                  width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px',
                  border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none',
                  background: '#f8fafc', color: '#0f172a', boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            {authError && (
              <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>⚠ {authError}</p>
            )}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
              color: '#fff', border: 'none', borderRadius: '12px',
              fontWeight: 700, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}>
              {loading ? 'Checking…' : 'Login →'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     DASHBOARD
  ═══════════════════════════════════════════════════════════════ */
  return (
    <div style={{ background: bgMain, minHeight: '100vh', fontFamily: 'Poppins, sans-serif', color: textPrimary, transition: 'background-color 0.2s, color 0.2s' }}>

      {/* ── Toast Notification Overlay ── */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column-reverse', gap: '10px', pointerEvents: 'none', maxWidth: '380px' }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              background: toast.type === 'error' ? '#1e1e1e' : '#0f172a',
              borderLeft: `4px solid ${toast.type === 'error' ? '#ef4444' : '#22c55e'}`,
              color: '#f8fafc',
              borderRadius: '12px',
              padding: '14px 18px 10px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              fontSize: '13.5px',
              fontWeight: 600,
              maxWidth: '380px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              animation: 'slideInToast 0.35s cubic-bezier(0.22,1,0.36,1)',
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>
                {toast.type === 'error' ? '❌' : '✅'}
              </span>
              <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
              <span style={{ fontSize: '16px', opacity: 0.5, marginLeft: '4px' }}>×</span>
            </div>
            {/* Auto-dismiss progress bar */}
            <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                borderRadius: '2px',
                background: toast.type === 'error' ? '#ef4444' : '#22c55e',
                animation: 'toastProgress 4s linear forwards',
              }} />
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInToast {
          from { opacity: 0; transform: translateX(60px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)   scale(1); }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>

      <style>{`
        :root {
          --primary-color: ${PRIMARY};
          --accent-color: ${ACCENT};
          --bg-main: ${darkMode ? '#0f172a' : '#f8fafc'};
          --bg-card: ${darkMode ? '#1e293b' : '#fff'};
          --border-color: ${darkMode ? '#334155' : '#e2e8f0'};
          --text-primary: ${darkMode ? '#f8fafc' : '#0f172a'};
          --text-secondary: ${darkMode ? '#94a3b8' : '#64748b'};
          --input-bg: ${darkMode ? '#334155' : '#fff'};
          --input-border: ${darkMode ? '#475569' : '#cbd5e1'};
          --input-text: ${darkMode ? '#f8fafc' : '#1e293b'};
        }
        /* Responsive styles for Admin Dashboard */
        .admin-dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 20px;
        }
        .admin-main-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
          align-items: start;
        }
        .admin-content-grid {
          display: grid;
          grid-template-columns: 1.2fr 1.05fr;
          gap: 32px;
          align-items: start;
        }
        .admin-form-container {
          background: var(--bg-card);
          padding: 24px;
          border-radius: 16px;
          border: 1.5px solid var(--border-color);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .admin-list-container {
          background: var(--bg-card);
          padding: 24px;
          border-radius: 16px;
          border: 1.5px solid var(--border-color);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .form-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .slot-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 8px;
        }
        .admin-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: var(--bg-main);
          border-radius: 12px;
          border: 1.5px solid var(--border-color);
          color: var(--text-primary);
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .admin-item-row:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.06);
          border-color: var(--primary-color);
        }
        .admin-item-row-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .btn-edit {
          background: ${darkMode ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff'};
          border: 1.5px solid ${darkMode ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe'};
          color: ${darkMode ? '#60a5fa' : '#2563eb'};
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .btn-edit:hover {
          background: ${darkMode ? 'rgba(59, 130, 246, 0.25)' : '#dbeafe'};
          border-color: ${darkMode ? '#60a5fa' : '#3b82f6'};
          transform: translateY(-1px);
        }
        .btn-delete {
          background: ${darkMode ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2'};
          border: 1.5px solid ${darkMode ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'};
          color: ${darkMode ? '#f87171' : '#dc2626'};
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .btn-delete:hover {
          background: ${darkMode ? 'rgba(239, 68, 68, 0.25)' : '#fee2e2'};
          border-color: ${darkMode ? '#f87171' : '#ef4444'};
          transform: translateY(-1px);
        }
        /* Custom Scrollbars */
        .custom-scroll {
          scrollbar-width: thin;
          scrollbar-color: var(--primary-color) transparent;
        }
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: var(--primary-color);
          border-radius: 20px;
        }
        .admin-card {
          padding: 32px;
          border-radius: 20px;
          box-sizing: border-box;
          width: 100%;
        }
        .admin-header-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding: 24px 32px;
        }
        .admin-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .admin-tab-nav {
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
          padding: 0 32px;
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }
        .appointment-item {
          padding: 18px 22px;
          display: flex;
          align-items: center;
          gap: 16px;
          background: var(--bg-card);
          border: 1.5px solid var(--border-color);
        }
        .appointment-time-badge {
          border-radius: 10px;
          padding: 10px 14px;
          text-align: center;
          flex-shrink: 0;
          min-width: 140px;
        }
        .appointment-action-btn {
          color: #fff;
          border-radius: 10px;
          padding: 10px 14px;
          text-decoration: none;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
        }
        /* Dynamic controls overlaying theme inputs */
        .admin-form-container input, 
        .admin-form-container textarea, 
        .admin-form-container select,
        .admin-list-container input,
        .admin-list-container select,
        .admin-list-container textarea {
          background-color: var(--input-bg) !important;
          color: var(--input-text) !important;
          border: 1.5px solid var(--input-border) !important;
          border-radius: 10px;
          padding: 12px 14px;
          font-family: inherit;
          font-size: 13.5px;
          transition: all 0.2s ease;
          box-sizing: border-box;
          outline: none;
        }
        .admin-form-container input:focus, 
        .admin-form-container textarea:focus, 
        .admin-form-container select:focus {
          border-color: var(--primary-color) !important;
          box-shadow: 0 0 0 3px ${PRIMARY}22 !important;
        }
        .admin-form-container label,
        .admin-list-container label {
          color: var(--text-secondary) !important;
        }
        @media (max-width: 991px) {
          .admin-main-grid {
            grid-template-columns: 1fr;
          }
          .admin-content-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .admin-card {
            padding: 24px !important;
          }
        }
        @media (max-width: 600px) {
          .admin-dashboard-container {
            padding: 16px 12px;
          }
          .admin-header-flex {
            padding: 12px 16px !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            text-align: left !important;
            gap: 10px !important;
          }
          .admin-header-flex > div {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            text-align: left !important;
          }
          .admin-header-actions {
            justify-content: flex-end !important;
          }
          .admin-refresh-button {
            padding: 10px !important;
            border-radius: 50% !important;
            width: 40px !important;
            height: 40px !important;
            min-width: 40px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .admin-refresh-text {
            display: none !important;
          }
          .admin-header-title {
            font-size: 1.05rem !important;
          }
          .admin-tab-nav {
            padding: 0 16px !important;
            justify-content: center;
          }
          .appointment-item {
            flex-direction: column;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .appointment-time-badge {
            align-self: flex-start;
            width: 100%;
            box-sizing: border-box;
          }
          .appointment-action-btn {
            width: 100%;
            justify-content: center;
          }
          .form-grid-2col {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .admin-card {
            padding: 16px !important;
            border-radius: 16px !important;
          }
          .admin-form-container {
            padding: 16px !important;
            border-radius: 16px !important;
          }
          .admin-list-container {
            padding: 16px !important;
            border-radius: 16px !important;
          }
        }
        @media (max-width: 480px) {
          .admin-item-row {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .admin-item-row-actions {
            justify-content: flex-end;
          }
        }
      `}</style>

      {/* Header */}
      <div className="admin-header-flex" style={{
        background: `linear-gradient(135deg, ${PRIMARY} 0%, #0f3460 100%)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '32px' }}>🛡️</span>
          <div>
            <h1 className="admin-header-title" style={{ margin: 0, color: '#fff', fontSize: '1.3rem', fontFamily: 'Playfair Display, serif' }}>
              Cancer Herbalist Admin Panel
            </h1>
            <p style={{ margin: 0, color: '#a7f3d0', fontSize: '12px' }}>{today}</p>
          </div>
        </div>
        <div className="admin-header-actions">
          <button 
            onClick={() => { fetchAppts(secret, filterDate); fetchOrders(secret); loadDynamicContent(); }} 
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', padding: '10px 18px', borderRadius: '10px',
              cursor: 'pointer', fontWeight: 600, fontSize: '13px', fontFamily: 'inherit',
            }}
            className="admin-refresh-button"
            title="Refresh Data"
          >
            <FaSync /> <span className="admin-refresh-text">Refresh</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="admin-tab-nav">
        {[
          { id: 'appointments', label: '📅 Bookings & Slots' },
          { id: 'orders', label: '📦 Orders & Refunds' },
          { id: 'content', label: '🛠️ Manage Content' },
          { id: 'settings', label: '⚙️ Settings' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveDashboardTab(tab.id); setFormError(''); setFormStatus(''); }}
            style={{
              padding: '16px 8px', background: 'none', border: 'none',
              color: activeDashboardTab === tab.id ? PRIMARY : textSecondary,
              fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              borderBottom: `3px solid ${activeDashboardTab === tab.id ? PRIMARY : 'transparent'}`,
              transition: 'all 0.2s', fontFamily: 'inherit',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-dashboard-container">
        {activeDashboardTab === 'appointments' ? (
          <>
            {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: "Today's Appointments",  value: todayAppts.length,      icon: '📅', color: PRIMARY },
            { label: 'Slots Booked Today',     value: todayBookedSlots.size,  icon: '🔴', color: '#ef4444' },
            { label: 'Slots Free Today',       value: TIME_SLOTS.length - todayBookedSlots.size, icon: '🟢', color: '#22c55e' },
            { label: 'Total Appointments',     value: appointments.length,    icon: '📋', color: ACCENT },
          ].map(s => (
            <div key={s.label} style={{
              background: bgCard, borderRadius: '16px', padding: '20px 24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${s.color}20`,
            }}>
              <span style={{ fontSize: '28px' }}>{s.icon}</span>
              <p style={{ margin: '8px 0 2px', fontSize: '28px', fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: '12px', color: textSecondary, fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: textPrimary }}>Show:</span>
          {['today', 'all'].map(f => (
            <button key={f} onClick={() => setFilterDate(f)} style={{
              padding: '8px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '13px',
              border: `2px solid ${filterDate === f ? PRIMARY : '#e2e8f0'}`,
              background: filterDate === f ? `${PRIMARY}12` : '#fff',
              color: filterDate === f ? PRIMARY : '#64748b',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {f === 'today' ? "📅 Today" : "📋 All"}
            </button>
          ))}
          {loading && <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px' }}>Loading…</span>}
          {fetchError && <span style={{ fontSize: '12px', color: '#ef4444' }}>⚠ {fetchError}</span>}
        </div>

        <div className="admin-main-grid">

          {/* Appointment list */}
          <div>
            {appointments.length === 0 && !loading ? (
              <div style={{
                background: '#fff', borderRadius: '16px', padding: '48px',
                textAlign: 'center', color: '#94a3b8',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}>
                <FaCalendarAlt style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: '15px' }}>No appointments found.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {appointments.map(a => {
                  const isEmergency = EMERGENCY_SLOTS.some(s => a.appointmentSlot === s);
                  return (
                  <div
                    key={a.apptId}
                    onClick={() => { setSelected(a); setSlotViewDate(a.appointmentDay); }}
                    className="appointment-item"
                    style={{
                      background: '#fff', borderRadius: '14px',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      border: `1.5px solid ${selectedAppt?.apptId === a.apptId ? (isEmergency ? EMERGENCY_COLOR : PRIMARY) : '#e2e8f0'}`,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = isEmergency ? EMERGENCY_COLOR : PRIMARY}
                    onMouseLeave={e => e.currentTarget.style.borderColor = selectedAppt?.apptId === a.apptId ? (isEmergency ? EMERGENCY_COLOR : PRIMARY) : '#e2e8f0'}
                  >
                    {/* Time badge */}
                    <div className="appointment-time-badge" style={{
                      background: isEmergency ? `${EMERGENCY_COLOR}15` : `${PRIMARY}12`,
                      border: `1.5px solid ${isEmergency ? `${EMERGENCY_COLOR}50` : `${PRIMARY}30`}`,
                    }}>
                      <FaClock style={{ color: isEmergency ? EMERGENCY_COLOR : PRIMARY, fontSize: '12px' }} />
                      <p style={{ margin: '4px 0 0', fontSize: '12px', fontWeight: 700, color: isEmergency ? EMERGENCY_COLOR : PRIMARY, whiteSpace: 'nowrap' }}>
                        {a.appointmentSlot}
                      </p>
                      {isEmergency && (
                        <span style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: EMERGENCY_COLOR, marginTop: '2px', letterSpacing: '0.3px' }}>
                          ⚡ MINI CON.
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <FaUser style={{ color: '#64748b', fontSize: '11px' }} />
                        <strong style={{ fontSize: '14px', color: '#0f172a' }}>{a.name}</strong>
                        <span style={{
                          background: isEmergency ? `${EMERGENCY_COLOR}18` : `${ACCENT}18`,
                          color: isEmergency ? EMERGENCY_COLOR : ACCENT,
                          fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                        }}>{a.treatment}</span>
                        {isEmergency && (
                          <span style={{ background: EMERGENCY_COLOR, color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 7px', borderRadius: '20px' }}>
                            ⚡ 15 min
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaPhone style={{ fontSize: '10px' }} /> {a.phone}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaCalendarAlt style={{ fontSize: '10px' }} /> {a.appointmentDay}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {a.name === '[BLOCKED]' ? (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleUnblockSlot(a.apptId);
                        }}
                        className="appointment-action-btn"
                        style={{ background: '#ef4444', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                        title="Unblock this slot"
                      >
                        <FaTrash style={{ fontSize: '11px' }} /> Clear
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <a
                          href={`https://wa.me/91${String(a.phone).replace(/\D/g,'')}`}
                          target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="appointment-action-btn"
                          style={{ background: '#25d366' }}
                        >
                          <FaWhatsapp /> Chat
                        </a>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleCancelAppointment(a.apptId);
                          }}
                          className="appointment-action-btn"
                          style={{ background: '#ef4444', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                          title="Cancel booking"
                        >
                          <FaTrash style={{ fontSize: '11px' }} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Slot grid + detail panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Today's slot availability */}
            <div style={{
              background: bgCard, borderRadius: '16px', padding: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: `1px solid ${borderCard}`,
            }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaClock style={{ color: PRIMARY }} /> Slot Status
              </h3>
              <p style={{ margin: '0 0 14px', fontSize: '11px', color: textSecondary, fontWeight: 600 }}>
                {slotGridDate === today ? 'Today' : slotGridDate}
              </p>
              <div className="slot-grid">
                {ALL_SLOTS.map(slot => {
                  const booked = slotGridBooked.has(slot);
                  const appt   = slotGridAppts.find(a => a.appointmentSlot === slot);
                  const isBlocked = booked && appt?.name === '[BLOCKED]';
                  const isEmergencySlot = EMERGENCY_SLOTS.includes(slot);
                  return (
                    <div
                      key={slot}
                      title={booked ? (isBlocked ? 'Blocked Slot' : `${appt?.name} — ${appt?.treatment}`) : 'Click to Block Slot'}
                      onClick={() => {
                        if (isBlocked) {
                          handleUnblockSlot(appt.apptId);
                        } else if (booked) {
                          setSelected(appt);
                        } else {
                          handleBlockSlot(slotGridDate, slot);
                        }
                      }}
                      style={{
                        padding: '8px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 600,
                        textAlign: 'center', cursor: 'pointer',
                        background: isBlocked ? '#e2e8f0' : booked ? (isEmergencySlot ? '#fff3e0' : '#fee2e2') : (isEmergencySlot ? '#fff7ed' : '#f0fdf4'),
                        color:      isBlocked ? '#475569' : booked ? (isEmergencySlot ? '#9a3412' : '#b91c1c') : (isEmergencySlot ? '#c2410c' : '#15803d'),
                        border:     `1.5px solid ${isBlocked ? '#cbd5e1' : booked ? (isEmergencySlot ? '#fed7aa' : '#fca5a5') : (isEmergencySlot ? '#fdba74' : '#86efac')}`,
                        transition: 'all 0.15s',
                      }}
                    >
                      {slot}<br />
                      <span style={{ fontSize: '8px', fontWeight: 700, opacity: 0.85 }}>
                        {isEmergencySlot ? '⚡ ' : ''}
                        {booked ? (isBlocked ? '🔒 BLOCKED' : `🔴 ${appt?.name?.split(' ')[0]}`) : '🟢 FREE'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', fontSize: '11px', color: textSecondary, flexWrap: 'wrap', alignItems: 'center' }}>
                <span>🟢 Free</span>
                <span>🔴 Booked</span>
                <span>⚡ Followup Consultation</span>
                {slotViewDate && slotViewDate !== today && (
                  <button
                    onClick={() => setSlotViewDate(null)}
                    style={{ background: 'none', border: 'none', color: ACCENT, cursor: 'pointer', fontSize: '11px', fontWeight: 600, padding: 0 }}
                  >
                    ↩ Back to today
                  </button>
                )}
              </div>
              {slotGridAppts.some(a => a.name === '[BLOCKED]') && (
                <button
                  onClick={() => handleClearAllBlocks(slotGridDate)}
                  style={{
                    marginTop: '12px', padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #fca5a5',
                    background: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: '11px',
                    cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '4px',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
                >
                  🔓 Clear All Blocked Slots ({slotGridDate === today ? 'Today' : 'This Day'})
                </button>
              )}
            </div>

            {/* Detail panel */}
            {selectedAppt && (
              <div style={{
                background: '#fff', borderRadius: '16px', padding: '20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: `1.5px solid ${PRIMARY}30`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Appointment Detail</h3>
                  <button onClick={() => setSelected(null)} style={{
                    background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8',
                  }}>×</button>
                </div>
                {[
                  { label: 'ID',          val: selectedAppt.apptId,          icon: '🆔' },
                  { label: 'Patient',     val: selectedAppt.name,            icon: '👤' },
                  { label: 'Phone',       val: selectedAppt.phone,           icon: '📱' },
                  { label: 'Email',       val: selectedAppt.email,           icon: '📧' },
                  { label: 'Consultation',val: selectedAppt.treatment,       icon: '🩺' },
                  { label: 'Stage',       val: selectedAppt.stage || '—',    icon: '📊' },
                  { label: 'Date',        val: selectedAppt.appointmentDay,  icon: '📅' },
                  { label: 'Time',        val: selectedAppt.appointmentSlot, icon: '🕐' },
                  { label: 'Booked At',  val: selectedAppt.bookedAt,        icon: '⏰' },
                  { label: 'Message',    val: selectedAppt.message || '—',  icon: '💬' },
                ].map(row => (
                  <div key={row.label} style={{
                    display: 'flex', gap: '10px', padding: '7px 0',
                    borderBottom: '1px solid #f1f5f9', fontSize: '12.5px',
                  }}>
                    <span style={{ minWidth: '90px', color: '#94a3b8', fontWeight: 600 }}>{row.icon} {row.label}</span>
                    <span style={{ color: '#334155', wordBreak: 'break-all' }}>{row.val}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  {selectedAppt.name === '[BLOCKED]' ? (
                    <button
                      onClick={() => handleUnblockSlot(selectedAppt.apptId)}
                      style={{
                        width: '100%', background: PRIMARY, color: '#fff', border: 'none',
                        padding: '12px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
                        fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      🔓 Unblock Slot
                    </button>
                  ) : (
                    <>
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <a href={`https://wa.me/91${String(selectedAppt.phone).replace(/\D/g,'')}`}
                            target="_blank" rel="noreferrer"
                            style={{
                              flex: 1, background: '#25d366', color: '#fff', padding: '10px',
                              borderRadius: '10px', textDecoration: 'none', fontWeight: 700,
                              fontSize: '12px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                            }}>
                            <FaWhatsapp /> WhatsApp
                          </a>
                          <a href={`tel:${selectedAppt.phone}`}
                            style={{
                              flex: 1, background: PRIMARY, color: '#fff', padding: '10px',
                              borderRadius: '10px', textDecoration: 'none', fontWeight: 700,
                              fontSize: '12px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                            }}>
                            📞 Call
                          </a>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <button
                            onClick={() => setIsEditingReschedule(!isEditingReschedule)}
                            style={{
                              flex: 1, background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569',
                              padding: '10px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            🕒 Reschedule
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(selectedAppt.apptId)}
                            style={{
                              flex: 1, background: '#fee2e2', border: '1px solid #fecaca', color: '#ef4444',
                              padding: '10px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ❌ Cancel Booking
                          </button>
                        </div>

                        {isEditingReschedule && (
                          <div style={{
                            marginTop: '16px', padding: '14px', background: '#f8fafc',
                            borderRadius: '12px', border: '1px solid #cbd5e1'
                          }}>
                            <h4 style={{ margin: '0 0 10px', fontSize: '12.5px', color: '#334155' }}>Reschedule Appointment</h4>
                            
                            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px', textAlign: 'left' }}>Date</label>
                            <input
                              type="date"
                              value={rescheduleDate}
                              onChange={e => setRescheduleDate(e.target.value)}
                              style={{
                                width: '100%', padding: '8px', borderRadius: '6px',
                                border: '1.5px solid #cbd5e1', marginBottom: '10px', fontSize: '13px',
                                background: '#fff', color: '#1e293b', boxSizing: 'border-box'
                              }}
                            />

                            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px', textAlign: 'left' }}>Time Slot</label>
                            <select
                              value={rescheduleSlot}
                              onChange={e => setRescheduleSlot(e.target.value)}
                              style={{
                                width: '100%', padding: '8px', borderRadius: '6px',
                                border: '1.5px solid #cbd5e1', marginBottom: '12px', fontSize: '13px',
                                background: '#fff', color: '#1e293b', boxSizing: 'border-box'
                              }}
                            >
                              <optgroup label="Review Consultation (1-hour slots)">
                                {TIME_SLOTS.map(slot => (
                                  <option key={slot} value={slot}>{slot}</option>
                                ))}
                              </optgroup>
                              <optgroup label="⚡ Followup Consultation (15-min slots)">
                                {EMERGENCY_SLOTS.map(slot => (
                                  <option key={slot} value={slot}>⚡ {slot}</option>
                                ))}
                              </optgroup>
                            </select>

                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => {
                                  const newDayFormatted = formatRescheduleDate(rescheduleDate);
                                  if (!newDayFormatted) {
                                    showToast('Please select a valid date.', 'error');
                                    return;
                                  }
                                  handleRescheduleAppointment(selectedAppt.apptId, newDayFormatted, rescheduleSlot);
                                }}
                                style={{
                                  flex: 1, background: PRIMARY, color: '#fff', border: 'none',
                                  padding: '8px', borderRadius: '6px', fontWeight: 600, fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setIsEditingReschedule(false)}
                                style={{
                                  flex: 1, background: '#e2e8f0', border: 'none', color: '#475569',
                                  padding: '8px', borderRadius: '6px', fontWeight: 600, fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            DAILY SLOT MANAGER PANEL
        ═══════════════════════════════════════════════════ */}
        <div style={{ marginTop: '32px' }}>
          <div style={{
            background: bgCard, borderRadius: '20px', padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: `1px solid ${borderCard}`,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🗓️ Daily Slot Manager
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: textSecondary }}>Control which slots patients can book for each day</p>
              </div>
              {slotManagerIsCustom && (
                <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', border: '1px solid #fde68a' }}>
                  ⚙️ Custom config active
                </span>
              )}
            </div>

            {/* Date Picker */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: textSecondary, marginBottom: '4px' }}>SELECT DATE</label>
                <input
                  type="date"
                  value={slotManagerDate}
                  onChange={e => {
                    setSlotManagerDate(e.target.value);
                    fetchSlotConfig((() => {
                      const d = new Date(e.target.value + 'T00:00:00');
                      return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                    })());
                  }}
                  style={{
                    padding: '10px 14px', borderRadius: '10px', border: `1.5px solid ${inputBorder}`,
                    fontSize: '14px', background: inputBg, color: inputText, outline: 'none',
                  }}
                />
              </div>
              {slotManagerLoading && <span style={{ fontSize: '12px', color: textSecondary }}>Loading…</span>}

              {/* Quick Presets */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'flex-end', paddingBottom: '2px' }}>
                {[
                  { label: '🟢 All Open', action: () => { setEditRegularSlots(new Set(TIME_SLOTS)); setEditEmergencySlots(new Set(EMERGENCY_SLOTS)); } },
                  { label: '🔴 Close All', action: () => { setEditRegularSlots(new Set()); setEditEmergencySlots(new Set()); } },
                  { label: '☀️ Morning Only', action: () => {
                    setEditRegularSlots(new Set(['10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM']));
                    setEditEmergencySlots(new Set());
                  }},
                  { label: '🌄 Afternoon Only', action: () => {
                    setEditRegularSlots(new Set());
                    setEditEmergencySlots(new Set(['03:00 PM - 03:15 PM', '03:15 PM - 03:30 PM', '03:30 PM - 03:45 PM', '03:45 PM - 04:00 PM']));
                  }},
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={preset.action}
                    style={{
                      padding: '8px 12px', borderRadius: '8px', border: `1.5px solid ${inputBorder}`,
                      background: inputBg, color: textSecondary, fontWeight: 600, fontSize: '11px',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.color = PRIMARY; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = inputBorder; e.currentTarget.style.color = textSecondary; }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Slot Toggles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>

              {/* Regular Slots */}
              <div>
                <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: textPrimary }}>🩺 Regular Slots (1-hour)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {TIME_SLOTS.map(slot => {
                    const enabled = editRegularSlots.has(slot);
                    return (
                      <label key={slot} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 14px', borderRadius: '10px', border: `1.5px solid ${enabled ? '#22c55e55' : inputBorder}`, background: enabled ? '#f0fdf4' : inputBg, transition: 'all 0.15s' }}>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => {
                            const next = new Set(editRegularSlots);
                            if (next.has(slot)) next.delete(slot); else next.add(slot);
                            setEditRegularSlots(next);
                          }}
                          style={{ width: '16px', height: '16px', accentColor: '#22c55e', flexShrink: 0 }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: enabled ? '#15803d' : textSecondary }}>{slot}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, color: enabled ? '#22c55e' : '#94a3b8' }}>{enabled ? '🟢 OPEN' : '🔴 CLOSED'}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Emergency Slots */}
              <div>
                <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: textPrimary }}>⚡ Emergency Slots (15-min)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {EMERGENCY_SLOTS.map(slot => {
                    const enabled = editEmergencySlots.has(slot);
                    return (
                      <label key={slot} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 14px', borderRadius: '10px', border: `1.5px solid ${enabled ? `${EMERGENCY_COLOR}55` : inputBorder}`, background: enabled ? '#fff7ed' : inputBg, transition: 'all 0.15s' }}>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => {
                            const next = new Set(editEmergencySlots);
                            if (next.has(slot)) next.delete(slot); else next.add(slot);
                            setEditEmergencySlots(next);
                          }}
                          style={{ width: '16px', height: '16px', accentColor: EMERGENCY_COLOR, flexShrink: 0 }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: enabled ? EMERGENCY_COLOR : textSecondary }}>⚡ {slot}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, color: enabled ? EMERGENCY_COLOR : '#94a3b8' }}>{enabled ? '🟢 OPEN' : '🔴 CLOSED'}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Summary + Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: `1px solid ${borderCard}`, paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', color: textSecondary }}>
                <span style={{ fontWeight: 700, color: textPrimary }}>{editRegularSlots.size}</span> Review Consultation
                {' + '}
                <span style={{ fontWeight: 700, color: EMERGENCY_COLOR }}>{editEmergencySlots.size}</span> Followup Consultation slots open for this day
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={resetSlotConfig}
                  style={{
                    padding: '10px 18px', borderRadius: '10px', border: '1.5px solid #cbd5e1',
                    background: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '13px',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                  title="Clear any custom slots visibility configurations and restore all slots as open by default"
                >
                  🔓 Clear Custom Config
                </button>
                <button
                  onClick={saveSlotConfig}
                  disabled={slotManagerSaving}
                  style={{
                    padding: '10px 24px', borderRadius: '10px', border: 'none',
                    background: slotManagerSaving ? '#94a3b8' : PRIMARY,
                    color: '#fff', fontWeight: 700, fontSize: '13px',
                    cursor: slotManagerSaving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  {slotManagerSaving ? '⏳ Saving…' : '💾 Save Slot Config'}
                </button>
              </div>
            </div>
          </div>
        </div>

        </>
        ) : activeDashboardTab === 'orders' ? (
          <div className="admin-card" style={{ padding: '24px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontFamily: 'Playfair Display, serif', color: '#0f172a', fontSize: '1.6rem' }}>
                Orders & Refunds Manager
              </h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                Process cancellations, returns, and track payment refund cycles.
              </p>
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search Order ID, name, phone..."
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                style={{
                  padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                  fontSize: '13.5px', outline: 'none', width: '260px'
                }}
              />
              
              <select
                value={orderStatusFilter}
                onChange={e => setOrderStatusFilter(e.target.value)}
                style={{
                  padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                  fontSize: '13.5px', outline: 'none', background: '#fff'
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ORDER_PLACED">Order Placed</option>
                <option value="ORDER_CONFIRMED">Order Confirmed</option>
                <option value="CANCELLATION_REQUESTED">Cancellation Requested</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="RETURN_REQUESTED">Return Requested</option>
                <option value="RETURN_APPROVED">Return Approved</option>
                <option value="RETURN_PICKUP_SCHEDULED">Return Pickup Scheduled</option>
                <option value="REFUND_APPROVED">Refund Approved</option>
                <option value="REFUND_INITIATED">Refund Initiated</option>
                <option value="REFUND_PROCESSED">Refund Processed</option>
                <option value="REFUND_FAILED">Refund Failed</option>
                <option value="DELIVERED">Delivered</option>
              </select>



              <button
                onClick={() => fetchOrders(secret, true)}
                disabled={ordersLoading}
                title="Force pull latest data from Google Sheets"
                style={{
                  padding: '10px 16px', borderRadius: '10px', border: `1.5px solid ${PRIMARY}40`,
                  background: `${PRIMARY}10`, color: PRIMARY, fontWeight: 600, fontSize: '13.5px',
                  cursor: ordersLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px', opacity: ordersLoading ? 0.6 : 1
                }}
                onMouseEnter={e => { if (!ordersLoading) e.currentTarget.style.background = `${PRIMARY}20`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${PRIMARY}10`; }}
              >
                <FaSync style={{ fontSize: '12px', animation: ordersLoading ? 'spin 1s linear infinite' : 'none' }} />
                {ordersLoading ? 'Syncing…' : 'Sync from Sheets'}
              </button>

              {ordersError && <span style={{ fontSize: '12px', color: '#ef4444' }}>⚠ {ordersError}</span>}
            </div>

            {/* Main Orders Grid */}
            <div className="admin-main-grid">
              
              {/* Order List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orders.length === 0 && !ordersLoading ? (
                  <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '40px' }}>No orders found.</p>
                ) : (
                  orders
                    .filter(o => {
                      const q = orderSearch.toLowerCase().trim();
                      const matchesSearch = !q || 
                        String(o.orderId).toLowerCase().includes(q) ||
                        String(o.customerName).toLowerCase().includes(q) ||
                        String(o.phone).includes(q) ||
                        String(o.email || '').toLowerCase().includes(q);
                      
                      const matchesStatus = orderStatusFilter === 'ALL' || o.orderStatus === orderStatusFilter;
                      
                      return matchesSearch && matchesStatus;
                    })
                    .map(o => {
                      const status = o.orderStatus || '';
                      let badgeBg = '#f1f5f9';
                      let badgeColor = '#475569';
                      if (status.includes('REQUESTED')) { badgeBg = '#fffbeb'; badgeColor = '#d97706'; }
                      else if (status === 'CANCELLED' || status === 'REFUND_FAILED') { badgeBg = '#fef2f2'; badgeColor = '#dc2626'; }
                      else if (status.includes('CONFIRMED') || status.includes('DELIVERED') || status === 'REFUND_PROCESSED') { badgeBg = '#f0fdf4'; badgeColor = '#16a34a'; }
                      
                      return (
                        <div
                          key={o.orderId}
                          onClick={() => { setSelectedOrder(o); fetchOrderDetails(o.orderId); }}
                          style={{
                            background: '#fff', border: `1.5px solid ${selectedOrder?.orderId === o.orderId ? PRIMARY : '#e2e8f0'}`,
                            borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '14px', color: '#0f172a' }}>{o.orderId}</strong>
                              <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: badgeBg, color: badgeColor }}>
                                {status || '—'}
                              </span>
                              {o.refundStatus && (
                                <span style={{ 
                                  fontSize: '10px', 
                                  fontWeight: 700, 
                                  padding: '2px 8px', 
                                  borderRadius: '20px', 
                                  background: o.refundStatus === 'PROCESSED' ? '#f0fdf4' : o.refundStatus === 'FAILED' ? '#fef2f2' : '#fffbeb', 
                                  color: o.refundStatus === 'PROCESSED' ? '#16a34a' : o.refundStatus === 'FAILED' ? '#dc2626' : '#d97706',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}>
                                  💸 Refund: {o.refundStatus}
                                </span>
                              )}
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: '#334155' }}>
                              {o.customerName} • {o.phone}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                              {o.productName} (Qty: {o.quantity})
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              🕐 {o.orderDate || (o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '—')}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                            <strong style={{ fontSize: '15px', color: '#1a6e52', display: 'block' }}>₹{o.orderAmount}</strong>
                            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>{o.paymentMethod}</span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>

              {/* Order Detail View Panel */}
              <div>
                {selectedOrder && selectedOrderDetails ? (
                  <OrderDetailViewPanel
                    details={selectedOrderDetails}
                    onApproveCancellation={handleApproveCancellation}
                    onApproveReturn={handleApproveReturn}
                    onReceiveReturn={handleReceiveReturn}
                    onInitiateRefund={handleInitiateRefund}
                    onSyncRefund={handleSyncRefund}
                    onCancelOrderDirect={handleCancelOrderDirect}
                    onShipOrderDirect={handleShipOrderDirect}
                    onDeleteOrder={handleDeleteOrder}
                    onEditOrder={handleEditOrder}
                    onClose={() => { setSelectedOrder(null); setSelectedOrderDetails(null); }}
                  />
                ) : (
                  <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13.5px' }}>
                    Select an order from the list to view tracking logs, event timeline, and perform return/refund actions.
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : activeDashboardTab === 'settings' ? (
          /* ──────────── SETTINGS TAB ──────────── */
          <div className="admin-card" style={{ maxWidth: 720, margin: '0 auto', padding: '32px', background: bgCard, borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: `1px solid ${borderCard}` }}>
            <h2 style={{ margin: '0 0 4px', fontFamily: 'Playfair Display, serif', color: textPrimary, fontSize: '1.6rem' }}>
              ⚙️ Admin Settings
            </h2>
            <p style={{ margin: '0 0 32px', color: textSecondary, fontSize: '13px' }}>
              Customize the look and feel of the Admin Panel and manage your session.
            </p>

            {/* ── Theme Selector ── */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🎨 Dashboard Theme
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                {Object.entries(THEMES).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setTheme(key);
                      localStorage.setItem('ch_admin_theme', key);
                    }}
                    style={{
                      border: `2px solid ${theme === key ? t.primary : borderCard}`,
                      borderRadius: '14px',
                      padding: '14px 10px',
                      cursor: 'pointer',
                      background: theme === key ? `${t.primary}15` : bgMain,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span style={{ width: 16, height: 16, borderRadius: '50%', background: t.primary, display: 'inline-block' }} />
                      <span style={{ width: 16, height: 16, borderRadius: '50%', background: t.accent, display: 'inline-block' }} />
                    </div>
                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: theme === key ? t.primary : textSecondary }}>{t.name}</span>
                    {theme === key && <span style={{ fontSize: '10px', color: t.primary, fontWeight: 700 }}>✓ Active</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Dark / Light Mode ── */}
            <div style={{ marginBottom: '32px', padding: '20px', background: bgMain, borderRadius: '14px', border: `1px solid ${borderCard}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: textPrimary }}>
                  {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: textSecondary }}>
                  Toggle between light and dark interface.
                </p>
              </div>
              <button
                onClick={() => {
                  const next = !darkMode;
                  setDarkMode(next);
                  localStorage.setItem('ch_admin_dark_mode', next.toString());
                }}
                style={{
                  position: 'relative',
                  width: '52px',
                  height: '28px',
                  borderRadius: '99px',
                  border: 'none',
                  cursor: 'pointer',
                  background: darkMode ? PRIMARY : '#cbd5e1',
                  transition: 'background 0.3s',
                  flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '3px',
                  left: darkMode ? '26px' : '3px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                  transition: 'left 0.25s',
                  display: 'block',
                }} />
              </button>
            </div>

            {/* ── Session Management ── */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🔐 Session Management
              </h3>
              <div style={{ padding: '20px', background: bgMain, borderRadius: '14px', border: `1px solid ${borderCard}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: `1px solid ${borderCard}` }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: textPrimary }}>Logged in as Admin</p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: textSecondary }}>
                      Secret key: <code style={{ background: `${PRIMARY}15`, color: PRIMARY, padding: '2px 6px', borderRadius: '6px', fontSize: '11px' }}>
                        {secret ? `${secret.slice(0, 4)}••••` : '—'}
                      </code>
                    </p>
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: '99px', background: '#d1fae5', color: '#065f46', fontSize: '11px', fontWeight: 700 }}>
                    ✓ Authenticated
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    background: '#fef2f2', border: '1.5px solid #fca5a5',
                    color: '#dc2626', padding: '12px 20px', borderRadius: '12px',
                    cursor: 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}
                >
                  🚪 Logout from Admin Panel
                </button>
              </div>
            </div>

            {/* ── Quick Actions ── */}
            <div>
              <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🔄 Quick Actions
              </h3>
              <button
                onClick={() => { fetchAppts(secret, filterDate); loadDynamicContent(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: `${PRIMARY}12`, border: `1.5px solid ${PRIMARY}40`,
                  color: PRIMARY, padding: '12px 20px', borderRadius: '12px',
                  cursor: 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
              >
                <FaSync /> Refresh All Dashboard Data
              </button>
            </div>
          </div>
        ) : (
        <div className="admin-card" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)', background: bgCard, border: `1.5px solid ${borderCard}`, borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
              <div>
                <h2 style={{ margin: 0, fontFamily: 'Playfair Display, serif', color: textPrimary, fontSize: '1.6rem' }}>
                  Website Content Manager
                </h2>
                <p style={{ margin: '4px 0 0', color: textSecondary, fontSize: '13px' }}>
                  Add new products and patient testimonials dynamically to the website.
                </p>
              </div>
            </div>

            {/* Sub tabs for content types */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', borderBottom: `1.5px solid var(--border-color)`, paddingBottom: '16px', flexWrap: 'wrap' }}>
              {[
                { id: 'products', label: '🌿 Products', count: dynProducts.length },
                { id: 'testimonials', label: '💬 Testimonials', count: dynTestimonials.length },
                { id: 'general', label: '⚙️ General Copy', count: 'Edit' },
              ].map(tab => {
                const isActive = contentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setContentTab(tab.id); setFormError(''); setFormStatus(''); }}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '13.5px',
                      border: `1.5px solid ${isActive ? `${PRIMARY}40` : 'transparent'}`,
                      background: isActive ? `${PRIMARY}15` : 'transparent',
                      color: isActive ? PRIMARY : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = `${PRIMARY}08`;
                        e.currentTarget.style.color = PRIMARY;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    {tab.label}
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '20px',
                      background: isActive ? PRIMARY : (darkMode ? '#334155' : '#e2e8f0'),
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      fontSize: '11px',
                      fontWeight: 700,
                      transition: 'all 0.2s'
                    }}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Success / Error Messages */}
            {formStatus === 'success' && (
              <div style={{ background: '#d1fae5', color: '#065f46', padding: '16px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, marginBottom: '24px' }}>
                ✓ {contentTab === 'general' ? 'General website copy updated successfully! All pages will show the new content immediately.' : 'Content added successfully! It is now live on the respective pages.'}
              </div>
            )}
            {formStatus === 'error' && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '16px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, marginBottom: '24px' }}>
                ⚠ Error: {formError}
              </div>
            )}

            {/* Tab content */}
            <div className="admin-content-grid">
              
              {/* LEFT COLUMN: The Creation/Edit Form */}
              <div className="admin-form-container">
                <h3 style={{ margin: '0 0 20px', fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '12px', letterSpacing: '0.2px' }}>
                  {contentTab === 'products' 
                    ? (editingProduct ? `✏️ Edit Product: ${editingProduct.name}` : '🌿 Create New Product')
                    : contentTab === 'testimonials'
                    ? (editingTestimonial ? `✏️ Edit Testimonial: ${editingTestimonial.name}` : '💬 Add New Testimonial')
                    : '⚙️ Edit General Website Copy'}
                </h3>

                {contentTab === 'general' && generalForm && (
                  <div style={{ marginBottom: '20px', display: 'flex', gap: '6px', flexWrap: 'wrap', background: '#f1f5f9', padding: '6px', borderRadius: '10px' }}>
                    {[
                      { id: 'contact', label: '📞 Contact & Stats' },
                      { id: 'home', label: '🏠 Home Page' },
                      { id: 'about', label: '📖 About Page' },
                      { id: 'programs', label: '🩺 Care Programs' },
                      { id: 'methods', label: '🧪 Treatment Methods' },
                      { id: 'team', label: '👥 Our Team' },
                      { id: 'education', label: '🧬 Patient Education' },
                    ].map(sub => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => { setGeneralSubTab(sub.id); setFormError(''); setFormStatus(''); }}
                        style={{
                          padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600,
                          border: 'none',
                          background: generalSubTab === sub.id ? '#fff' : 'transparent',
                          color: generalSubTab === sub.id ? PRIMARY : '#64748b',
                          boxShadow: generalSubTab === sub.id ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                          cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit'
                        }}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}

                {contentTab === 'products' && (
                  <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
                    <div className="form-grid-2col">
                      <div>
                        <label style={labelStyle}>Product Name *</label>
                        <input type="text" placeholder="e.g. Cap CH95 (30Cap)" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Category *</label>
                        <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} style={inputStyle}>
                          {['Immunity', 'Anti-Tumor', 'Detox', 'Stress & Recovery', 'Nutrition', 'Essential Oils', 'Alkaline Therapy'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-grid-2col">
                      <div>
                        <label style={labelStyle}>Price (₹) *</label>
                        <input type="number" placeholder="599" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Original Price (₹)</label>
                        <input type="number" placeholder="799" value={productForm.originalPrice} onChange={e => setProductForm({...productForm, originalPrice: e.target.value})} style={inputStyle} />
                      </div>
                    </div>

                    <div className="form-grid-2col">
                      <div>
                        <label style={labelStyle}>Badge (e.g. Best Seller)</label>
                        <input type="text" placeholder="Best Seller" value={productForm.badge} onChange={e => setProductForm({...productForm, badge: e.target.value})} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Size / Pack *</label>
                        <input type="text" placeholder="30 Capsules / 500mg" required value={productForm.size} onChange={e => setProductForm({...productForm, size: e.target.value})} style={inputStyle} />
                      </div>
                    </div>

                    <div className="form-grid-2col">
                      <div>
                        <label style={labelStyle}>Icon Emoji</label>
                        <input type="text" placeholder="🌿" value={productForm.icon} onChange={e => setProductForm({...productForm, icon: e.target.value})} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Color Hex</label>
                        <input type="color" value={productForm.color} onChange={e => setProductForm({...productForm, color: e.target.value})} style={{...inputStyle, padding: '4px', height: '42px'}} />
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Description *</label>
                      <textarea rows={3} placeholder="Describe the product and its therapeutic action..." required value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} style={inputStyle} />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Benefits (Comma separated list)</label>
                      <input type="text" placeholder="Supports immunity, Reduces inflammation, Cellular repair" value={productForm.benefits} onChange={e => setProductForm({...productForm, benefits: e.target.value})} style={inputStyle} />
                    </div>

                    <div className="form-grid-2col" style={{ marginBottom: '24px' }}>
                      <div>
                        <label style={labelStyle}>Key Ingredients</label>
                        <input type="text" placeholder="Curcumin 95%, Piperine" value={productForm.ingredients} onChange={e => setProductForm({...productForm, ingredients: e.target.value})} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Dosage Instructions</label>
                        <input type="text" placeholder="1 capsule twice daily" value={productForm.dosage} onChange={e => setProductForm({...productForm, dosage: e.target.value})} style={inputStyle} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button type="submit" disabled={formStatus === 'sending'} style={submitBtnStyle}>
                        {formStatus === 'sending' ? 'Saving...' : (editingProduct ? 'Save Product Changes' : '🌿 Add Product to Store')}
                      </button>
                      {editingProduct && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(null);
                            setProductForm({
                              name: '', category: 'Immunity', price: '', originalPrice: '',
                              description: '', benefits: '', ingredients: '', dosage: '',
                              size: '', badge: '', icon: '🌿', color: '#1a6e52'
                            });
                          }}
                          style={{ ...submitBtnStyle, background: '#cbd5e1', color: '#1e293b', boxShadow: 'none' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}

                {contentTab === 'testimonials' && (
                  <form onSubmit={editingTestimonial ? handleUpdateTestimonial : handleAddTestimonial}>
                    <div className="form-grid-2col">
                      <div>
                        <label style={labelStyle}>Patient Name / Initials *</label>
                        <input type="text" placeholder="e.g. Amit K." required value={testimonialForm.name} onChange={e => setTestimonialForm({...testimonialForm, name: e.target.value})} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Location</label>
                        <input type="text" placeholder="e.g. Delhi, India" value={testimonialForm.location} onChange={e => setTestimonialForm({...testimonialForm, location: e.target.value})} style={inputStyle} />
                      </div>
                    </div>

                    <div className="form-grid-2col">
                      <div>
                        <label style={labelStyle}>Rating (1-5 Stars)</label>
                        <select value={testimonialForm.rating} onChange={e => setTestimonialForm({...testimonialForm, rating: Number(e.target.value)})} style={inputStyle}>
                          {[5, 4, 3, 2, 1].map(num => (
                            <option key={num} value={num}>{num} Stars</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Date Indicator</label>
                        <input type="text" placeholder="e.g. Recent, 1 month ago" value={testimonialForm.date} onChange={e => setTestimonialForm({...testimonialForm, date: e.target.value})} style={inputStyle} />
                      </div>
                    </div>

                    <div className="form-grid-2col">
                      <div>
                        <label style={labelStyle}>Thumbnail Image URL</label>
                        <input type="url" placeholder="https://images.unsplash.com/..." value={testimonialForm.thumbnailUrl} onChange={e => setTestimonialForm({...testimonialForm, thumbnailUrl: e.target.value})} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Video Link (e.g. YouTube)</label>
                        <input type="url" placeholder="https://youtube.com/watch?v=..." value={testimonialForm.videoUrl} onChange={e => setTestimonialForm({...testimonialForm, videoUrl: e.target.value})} style={inputStyle} />
                      </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={labelStyle}>Testimonial Message *</label>
                      <textarea rows={4} placeholder="Write the patient's feedback or healing journey summary..." required value={testimonialForm.text} onChange={e => setTestimonialForm({...testimonialForm, text: e.target.value})} style={inputStyle} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button type="submit" disabled={formStatus === 'sending'} style={submitBtnStyle}>
                        {formStatus === 'sending' ? 'Saving...' : (editingTestimonial ? 'Save Testimonial Changes' : '💬 Add Testimonial')}
                      </button>
                      {editingTestimonial && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTestimonial(null);
                            setTestimonialForm({
                              name: '', location: 'India', rating: 5, text: '', date: 'Recent', videoUrl: '', thumbnailUrl: ''
                            });
                          }}
                          style={{ ...submitBtnStyle, background: '#cbd5e1', color: '#1e293b', boxShadow: 'none' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}

                {contentTab === 'general' && generalForm && (
                  <form onSubmit={handleUpdateGeneralContent}>
                    
                    {/* PAGE 1: Contact & Stats */}
                    {generalSubTab === 'contact' && (
                      <div>
                        <details open style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                          <summary style={{ padding: '14px 20px', background: '#f8fafc', fontWeight: 600, fontSize: '14px', color: '#1e293b', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', userSelect: 'none' }}>
                            📞 Contact Details
                          </summary>
                          <div style={{ padding: '20px' }}>
                            <div className="form-grid-2col">
                              <div>
                                <label style={labelStyle}>Phone Number *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.contact?.phone || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    contact: { ...(generalForm.contact || {}), phone: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Email Address *</label>
                                <input
                                  type="email"
                                  required
                                  value={generalForm.contact?.email || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    contact: { ...(generalForm.contact || {}), email: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>

                            <div className="form-grid-2col">
                              <div>
                                <label style={labelStyle}>WhatsApp (Digits only with Country Code, e.g. 918884588835) *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.contact?.whatsapp || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    contact: { ...(generalForm.contact || {}), whatsapp: e.target.value.replace(/\D/g, '') }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Consultation Timings *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.contact?.timings || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    contact: { ...(generalForm.contact || {}), timings: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>

                            <div style={{ marginBottom: 0 }}>
                              <label style={labelStyle}>Location / Physical Address *</label>
                              <input
                                type="text"
                                required
                                value={generalForm.contact?.address || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    contact: { ...(generalForm.contact || {}), address: e.target.value }
                                  })}
                                style={inputStyle}
                              />
                            </div>
                          </div>
                        </details>

                        {renderListEditor('📊 Statistics List', 'stats', [
                          { key: 'value', label: 'Numeric Value *', type: 'number' },
                          { key: 'suffix', label: 'Suffix (e.g. +, %)' },
                          { key: 'label', label: 'Label *' },
                          { key: 'sublabel', label: 'Sublabel *' }
                        ], { value: 0, suffix: '', label: '', sublabel: '' })}
                      </div>
                    )}

                    {/* PAGE 2: Home Page */}
                    {generalSubTab === 'home' && (
                      <div>
                        <details open style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                          <summary style={{ padding: '14px 20px', background: '#f8fafc', fontWeight: 600, fontSize: '14px', color: '#1e293b', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', userSelect: 'none' }}>
                            🌟 Why Patients Trust Us (General Copy)
                          </summary>
                          <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '12px' }}>
                              <label style={labelStyle}>Section Title *</label>
                              <input
                                type="text"
                                required
                                value={generalForm.whyChooseUs?.title || ''}
                                onChange={e => setGeneralForm({
                                  ...generalForm,
                                  whyChooseUs: { ...(generalForm.whyChooseUs || {}), title: e.target.value }
                                })}
                                style={inputStyle}
                              />
                            </div>
                            <div style={{ marginBottom: 0 }}>
                              <label style={labelStyle}>Section Subtitle *</label>
                              <textarea
                                rows={2}
                                required
                                value={generalForm.whyChooseUs?.subtitle || ''}
                                onChange={e => setGeneralForm({
                                  ...generalForm,
                                  whyChooseUs: { ...(generalForm.whyChooseUs || {}), subtitle: e.target.value }
                                })}
                                style={inputStyle}
                              />
                            </div>
                          </div>
                        </details>

                        {renderListEditor('🌟 Why Choose Us - Cards', 'whyChooseUs.items', [
                          { key: 'title', label: 'Card Title *' },
                          { key: 'desc', label: 'Card Description *', type: 'textarea' }
                        ], { title: '', desc: '' })}

                        <details open style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                          <summary style={{ padding: '14px 20px', background: '#f8fafc', fontWeight: 600, fontSize: '14px', color: '#1e293b', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', userSelect: 'none' }}>
                            🛡️ Recovery Pillars (General Copy)
                          </summary>
                          <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '12px' }}>
                              <label style={labelStyle}>Section Title *</label>
                              <input
                                type="text"
                                required
                                value={generalForm.healingPillars?.title || ''}
                                onChange={e => setGeneralForm({
                                  ...generalForm,
                                  healingPillars: { ...(generalForm.healingPillars || {}), title: e.target.value }
                                })}
                                style={inputStyle}
                              />
                            </div>
                            <div style={{ marginBottom: 0 }}>
                              <label style={labelStyle}>Section Subtitle *</label>
                              <textarea
                                rows={2}
                                required
                                value={generalForm.healingPillars?.subtitle || ''}
                                onChange={e => setGeneralForm({
                                  ...generalForm,
                                  healingPillars: { ...(generalForm.healingPillars || {}), subtitle: e.target.value }
                                })}
                                style={inputStyle}
                              />
                            </div>
                          </div>
                        </details>

                        {renderListEditor('🛡️ Recovery Pillars - Cards', 'healingPillars.items', [
                          { key: 'title', label: 'Pillar Title *' },
                          { key: 'stat', label: 'Pillar Stat Value (e.g. 20+) *' },
                          { key: 'statLabel', label: 'Pillar Stat Label (e.g. Custom Blends) *' },
                          { key: 'desc', label: 'Pillar Description *', type: 'textarea' }
                        ], { title: '', stat: '', statLabel: '', desc: '' })}

                        {renderListEditor('🖼️ Hero Slider - Carousel Slides', 'heroSlides', [
                          { key: 'badge', label: 'Slide Badge Text *' },
                          { key: 'headline', label: 'Headline Title *' },
                          { key: 'headlineAccent', label: 'Headline Accent (Green Highlighted Word) *' },
                          { key: 'subline', label: 'Subheading Subline *', type: 'textarea' },
                          { key: 'statValue', label: 'Stat Value (e.g. 4000+) *' },
                          { key: 'statLabel', label: 'Stat Description Label *' },
                          { key: 'ctaLabel', label: 'Primary Button Label *' },
                          { key: 'ctaHref', label: 'Primary Button Link *' },
                          { key: 'secondaryCtaLabel', label: 'Secondary Button Label *' },
                          { key: 'secondaryCtaHref', label: 'Secondary Button Link *' }
                        ], { badge: '', headline: '', headlineAccent: '', subline: '', statValue: '', statLabel: '', ctaLabel: '/contact', ctaHref: '', secondaryCtaLabel: '', secondaryCtaHref: '' })}
                      </div>
                    )}

                    {/* PAGE 3: About Page */}
                    {generalSubTab === 'about' && (
                      <div>
                        <details open style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                          <summary style={{ padding: '14px 20px', background: '#f8fafc', fontWeight: 600, fontSize: '14px', color: '#1e293b', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', userSelect: 'none' }}>
                            🖼️ Hero Section (About Page)
                          </summary>
                          <div style={{ padding: '20px' }}>
                            <div className="form-grid-2col">
                              <div>
                                <label style={labelStyle}>Badge *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutHero?.badge || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutHero: { ...(generalForm.aboutHero || {}), badge: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Headline Accent Word *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutHero?.headlineAccent || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutHero: { ...(generalForm.aboutHero || {}), headlineAccent: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                              <label style={labelStyle}>Headline *</label>
                              <input
                                type="text"
                                required
                                value={generalForm.aboutHero?.headline || ''}
                                onChange={e => setGeneralForm({
                                  ...generalForm,
                                  aboutHero: { ...(generalForm.aboutHero || {}), headline: e.target.value }
                                })}
                                style={inputStyle}
                              />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                              <label style={labelStyle}>Subline *</label>
                              <textarea
                                rows={2}
                                required
                                value={generalForm.aboutHero?.subline || ''}
                                onChange={e => setGeneralForm({
                                  ...generalForm,
                                  aboutHero: { ...(generalForm.aboutHero || {}), subline: e.target.value }
                                })}
                                style={inputStyle}
                              />
                            </div>
                            <div className="form-grid-2col" style={{ marginBottom: 0 }}>
                              <div>
                                <label style={labelStyle}>Primary CTA Button Label</label>
                                <input
                                  type="text"
                                  value={generalForm.aboutHero?.cta1Label || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutHero: { ...(generalForm.aboutHero || {}), cta1Label: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Primary CTA Button Link</label>
                                <input
                                  type="text"
                                  value={generalForm.aboutHero?.cta1Link || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutHero: { ...(generalForm.aboutHero || {}), cta1Link: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>
                          </div>
                        </details>

                        <details open style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                          <summary style={{ padding: '14px 20px', background: '#f8fafc', fontWeight: 600, fontSize: '14px', color: '#1e293b', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', userSelect: 'none' }}>
                            📖 Our Story Section
                          </summary>
                          <div style={{ padding: '20px' }}>
                            <div className="form-grid-2col">
                              <div>
                                <label style={labelStyle}>Badge *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutStory?.badge || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutStory: { ...(generalForm.aboutStory || {}), badge: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Title *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutStory?.title || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutStory: { ...(generalForm.aboutStory || {}), title: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                              <label style={labelStyle}>Story Paragraphs (Separated by two newlines / blank lines) *</label>
                              <textarea
                                rows={6}
                                required
                                value={Array.isArray(generalForm.aboutStory?.paragraphs) ? generalForm.aboutStory.paragraphs.join('\n\n') : ''}
                                onChange={e => setGeneralForm({
                                  ...generalForm,
                                  aboutStory: { ...(generalForm.aboutStory || {}), paragraphs: e.target.value.split('\n\n').map(p => p.trim()).filter(Boolean) }
                                })}
                                style={inputStyle}
                              />
                            </div>

                            <div className="form-grid-2col">
                              <div>
                                <label style={labelStyle}>Founder Quote *</label>
                                <textarea
                                  rows={3}
                                  required
                                  value={generalForm.aboutStory?.founderQuote || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutStory: { ...(generalForm.aboutStory || {}), founderQuote: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Founder Quote Author *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutStory?.founderQuoteAuthor || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutStory: { ...(generalForm.aboutStory || {}), founderQuoteAuthor: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>

                            <div className="form-grid-2col" style={{ marginBottom: 0 }}>
                              <div>
                                <label style={labelStyle}>Founder Image *</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={e => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setGeneralForm({
                                          ...generalForm,
                                          aboutStory: { ...(generalForm.aboutStory || {}), founderImage: reader.result }
                                        });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  style={{ marginBottom: '10px' }}
                                />
                                {generalForm.aboutStory?.founderImage && (
                                  <img
                                    src={generalForm.aboutStory.founderImage}
                                    alt="Founder Preview"
                                    style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                  />
                                )}
                              </div>
                              <div>
                                <label style={labelStyle}>Story Highlights (Comma-separated) *</label>
                                <input
                                  type="text"
                                  required
                                  value={Array.isArray(generalForm.aboutStory?.highlights) ? generalForm.aboutStory.highlights.join(', ') : ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutStory: { ...(generalForm.aboutStory || {}), highlights: e.target.value.split(',').map(h => h.trim()).filter(Boolean) }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>
                          </div>
                        </details>

                        <details open style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                          <summary style={{ padding: '14px 20px', background: '#f8fafc', fontWeight: 600, fontSize: '14px', color: '#1e293b', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', userSelect: 'none' }}>
                            🎯 Mission & Vision Section
                          </summary>
                          <div style={{ padding: '20px' }}>
                            <div className="form-grid-2col">
                              <div>
                                <label style={labelStyle}>Section Main Title *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutMission?.title || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutMission: { ...(generalForm.aboutMission || {}), title: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Section Subtitle *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutMission?.subtitle || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutMission: { ...(generalForm.aboutMission || {}), subtitle: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>

                            <div className="form-grid-2col">
                              <div>
                                <label style={labelStyle}>Mission Card Title *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutMission?.missionTitle || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutMission: { ...(generalForm.aboutMission || {}), missionTitle: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Mission Card Text *</label>
                                <textarea
                                  rows={3}
                                  required
                                  value={generalForm.aboutMission?.missionText || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutMission: { ...(generalForm.aboutMission || {}), missionText: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>

                            <div className="form-grid-2col" style={{ marginBottom: 0 }}>
                              <div>
                                <label style={labelStyle}>Vision Card Title *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutMission?.visionTitle || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutMission: { ...(generalForm.aboutMission || {}), visionTitle: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Vision Card Text *</label>
                                <textarea
                                  rows={3}
                                  required
                                  value={generalForm.aboutMission?.visionText || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutMission: { ...(generalForm.aboutMission || {}), visionText: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>
                          </div>
                        </details>

                        <details open style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                          <summary style={{ padding: '14px 20px', background: '#f8fafc', fontWeight: 600, fontSize: '14px', color: '#1e293b', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', userSelect: 'none' }}>
                            💎 Core Values (General Copy)
                          </summary>
                          <div style={{ padding: '20px' }}>
                            <div className="form-grid-2col">
                              <div>
                                <label style={labelStyle}>Section Title *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutValues?.title || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutValues: { ...(generalForm.aboutValues || {}), title: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Section Subtitle *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutValues?.subtitle || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutValues: { ...(generalForm.aboutValues || {}), subtitle: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>
                          </div>
                        </details>

                        {renderListEditor('💎 Core Values - Cards', 'aboutValues.items', [
                          { key: 'title', label: 'Card Title *' },
                          { key: 'desc', label: 'Card Description *', type: 'textarea' },
                          { key: 'color', label: 'Theme Accent Color *', type: 'color' }
                        ], { title: '', desc: '', color: '#1a6e52' })}

                        <details open style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                          <summary style={{ padding: '14px 20px', background: '#f8fafc', fontWeight: 600, fontSize: '14px', color: '#1e293b', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', userSelect: 'none' }}>
                            📅 Our Journey Timeline (General Copy)
                          </summary>
                          <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom: 0 }}>
                              <label style={labelStyle}>Section Title *</label>
                              <input
                                type="text"
                                required
                                value={generalForm.aboutMilestones?.title || ''}
                                onChange={e => setGeneralForm({
                                  ...generalForm,
                                  aboutMilestones: { ...(generalForm.aboutMilestones || {}), title: e.target.value }
                                })}
                                style={inputStyle}
                              />
                            </div>
                          </div>
                        </details>

                        {renderListEditor('📅 Journey Milestones - Timeline', 'aboutMilestones.items', [
                          { key: 'year', label: 'Year (e.g. 1989) *' },
                          { key: 'title', label: 'Milestone Title *' },
                          { key: 'desc', label: 'Milestone Description *', type: 'textarea' }
                        ], { year: '', title: '', desc: '' })}

                        <details open style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                          <summary style={{ padding: '14px 20px', background: '#f8fafc', fontWeight: 600, fontSize: '14px', color: '#1e293b', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', userSelect: 'none' }}>
                            🚶 Our Care Approach (General Copy)
                          </summary>
                          <div style={{ padding: '20px' }}>
                            <div className="form-grid-2col">
                              <div>
                                <label style={labelStyle}>Section Title *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutApproach?.title || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutApproach: { ...(generalForm.aboutApproach || {}), title: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Section Subtitle *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutApproach?.subtitle || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutApproach: { ...(generalForm.aboutApproach || {}), subtitle: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>
                          </div>
                        </details>

                        {renderListEditor('🚶 Care Approach Steps', 'aboutApproach.items', [
                          { key: 'step', label: 'Step Label (e.g. Step 1) *' },
                          { key: 'title', label: 'Step Title *' },
                          { key: 'desc', label: 'Step Description *', type: 'textarea' }
                        ], { step: '', title: '', desc: '' })}

                        <details open style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                          <summary style={{ padding: '14px 20px', background: '#f8fafc', fontWeight: 600, fontSize: '14px', color: '#1e293b', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', userSelect: 'none' }}>
                            🧑 Meet The Founder Section
                          </summary>
                          <div style={{ padding: '20px' }}>
                            <div className="form-grid-2col">
                              <div>
                                <label style={labelStyle}>Section Title *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutFounderProfile?.title || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutFounderProfile: { ...(generalForm.aboutFounderProfile || {}), title: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Section Subtitle *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutFounderProfile?.subtitle || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutFounderProfile: { ...(generalForm.aboutFounderProfile || {}), subtitle: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>

                            <div className="form-grid-2col">
                              <div>
                                <label style={labelStyle}>Founder Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutFounderProfile?.name || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutFounderProfile: { ...(generalForm.aboutFounderProfile || {}), name: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Founder Role / Designation *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutFounderProfile?.role || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutFounderProfile: { ...(generalForm.aboutFounderProfile || {}), role: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                              <label style={labelStyle}>Profile Paragraphs (Separated by two newlines / blank lines) *</label>
                              <textarea
                                rows={6}
                                required
                                value={Array.isArray(generalForm.aboutFounderProfile?.paragraphs) ? generalForm.aboutFounderProfile.paragraphs.join('\n\n') : ''}
                                onChange={e => setGeneralForm({
                                  ...generalForm,
                                  aboutFounderProfile: { ...(generalForm.aboutFounderProfile || {}), paragraphs: e.target.value.split('\n\n').map(p => p.trim()).filter(Boolean) }
                                })}
                                style={inputStyle}
                              />
                            </div>

                            <div className="form-grid-2col">
                              <div>
                                <label style={labelStyle}>Founder Quote *</label>
                                <textarea
                                  rows={3}
                                  required
                                  value={generalForm.aboutFounderProfile?.quote || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutFounderProfile: { ...(generalForm.aboutFounderProfile || {}), quote: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Founder Quote Author *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutFounderProfile?.quoteAuthor || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutFounderProfile: { ...(generalForm.aboutFounderProfile || {}), quoteAuthor: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>

                            <div className="form-grid-2col" style={{ marginBottom: 0 }}>
                              <div>
                                <label style={labelStyle}>Founder Profile Image *</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={e => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setGeneralForm({
                                          ...generalForm,
                                          aboutFounderProfile: { ...(generalForm.aboutFounderProfile || {}), image: reader.result }
                                        });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  style={{ marginBottom: '10px' }}
                                />
                                {generalForm.aboutFounderProfile?.image && (
                                  <img
                                    src={generalForm.aboutFounderProfile.image}
                                    alt="Founder Profile Preview"
                                    style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                  />
                                )}
                              </div>
                              <div>
                                <label style={labelStyle}>Founder Credentials (Comma-separated list) *</label>
                                <input
                                  type="text"
                                  required
                                  value={Array.isArray(generalForm.aboutFounderProfile?.credentials) ? generalForm.aboutFounderProfile.credentials.join(', ') : ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutFounderProfile: { ...(generalForm.aboutFounderProfile || {}), credentials: e.target.value.split(',').map(c => c.trim()).filter(Boolean) }
                                  })}
                                  style={inputStyle}
                                />
                            </div>
                          </div>
                        </div>
                      </details>

                        <details open style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                          <summary style={{ padding: '14px 20px', background: '#f8fafc', fontWeight: 600, fontSize: '14px', color: '#1e293b', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', userSelect: 'none' }}>
                            🎥 Clinical Video Section
                          </summary>
                          <div style={{ padding: '20px' }}>
                            <div className="form-grid-2col">
                              <div>
                                <label style={labelStyle}>Video Title *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutVideo?.title || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutVideo: { ...(generalForm.aboutVideo || {}), title: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Video Subtitle *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutVideo?.subtitle || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutVideo: { ...(generalForm.aboutVideo || {}), subtitle: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>

                            <div className="form-grid-2col" style={{ marginBottom: 0 }}>
                              <div>
                                <label style={labelStyle}>Video File Path / URL *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutVideo?.videoUrl || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutVideo: { ...(generalForm.aboutVideo || {}), videoUrl: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Thumbnail Image URL</label>
                                <input
                                  type="text"
                                  value={generalForm.aboutVideo?.thumbnailUrl || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutVideo: { ...(generalForm.aboutVideo || {}), thumbnailUrl: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>
                          </div>
                        </details>

                        <details style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                          <summary style={{ padding: '14px 20px', background: '#f8fafc', fontWeight: 600, fontSize: '14px', color: '#1e293b', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', userSelect: 'none' }}>
                            📋 Clinical Success & Case Studies Section
                          </summary>
                          <div style={{ padding: '20px' }}>
                            <div className="form-grid-2col">
                              <div>
                                <label style={labelStyle}>Section Title *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutCaseStudies?.title || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutCaseStudies: { ...(generalForm.aboutCaseStudies || {}), title: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Section Subtitle *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.aboutCaseStudies?.subtitle || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    aboutCaseStudies: { ...(generalForm.aboutCaseStudies || {}), subtitle: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>

                            <div style={{ marginTop: '20px' }}>
                              <label style={{ ...labelStyle, marginBottom: '10px', display: 'block' }}>Case Study Items</label>
                              {(generalForm.aboutCaseStudies?.items || []).map((item, idx) => (
                                <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>Case #{idx + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newItems = [...(generalForm.aboutCaseStudies.items || [])];
                                        newItems.splice(idx, 1);
                                        setGeneralForm({
                                          ...generalForm,
                                          aboutCaseStudies: { ...generalForm.aboutCaseStudies, items: newItems }
                                        });
                                      }}
                                      style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                                    >
                                      Remove Case
                                    </button>
                                  </div>
                                  <div className="form-grid-2col" style={{ marginBottom: '12px' }}>
                                    <div>
                                      <label style={labelStyle}>Badge *</label>
                                      <input
                                        type="text"
                                        required
                                        value={item.badge || ''}
                                        onChange={e => {
                                          const newItems = [...(generalForm.aboutCaseStudies.items || [])];
                                          newItems[idx] = { ...newItems[idx], badge: e.target.value };
                                          setGeneralForm({
                                            ...generalForm,
                                            aboutCaseStudies: { ...generalForm.aboutCaseStudies, items: newItems }
                                          });
                                        }}
                                        style={inputStyle}
                                      />
                                    </div>
                                    <div>
                                      <label style={labelStyle}>Title *</label>
                                      <input
                                        type="text"
                                        required
                                        value={item.title || ''}
                                        onChange={e => {
                                          const newItems = [...(generalForm.aboutCaseStudies.items || [])];
                                          newItems[idx] = { ...newItems[idx], title: e.target.value };
                                          setGeneralForm({
                                            ...generalForm,
                                            aboutCaseStudies: { ...generalForm.aboutCaseStudies, items: newItems }
                                          });
                                        }}
                                        style={inputStyle}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label style={labelStyle}>Description *</label>
                                    <textarea
                                      required
                                      value={item.description || ''}
                                      onChange={e => {
                                        const newItems = [...(generalForm.aboutCaseStudies.items || [])];
                                        newItems[idx] = { ...newItems[idx], description: e.target.value };
                                        setGeneralForm({
                                          ...generalForm,
                                          aboutCaseStudies: { ...generalForm.aboutCaseStudies, items: newItems }
                                        });
                                      }}
                                      style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                                    />
                                  </div>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = [...(generalForm.aboutCaseStudies?.items || [])];
                                  newItems.push({ badge: 'New Case Badge', title: 'New Case Title', description: 'New Case Description' });
                                  setGeneralForm({
                                    ...generalForm,
                                    aboutCaseStudies: { ...(generalForm.aboutCaseStudies || {}), items: newItems }
                                  });
                                }}
                                style={{ background: '#38bed5', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                              >
                                + Add Success Case
                              </button>
                            </div>
                          </div>
                        </details>
                      </div>
                    )}

                    {/* PAGE 4: Care Programs Page */}
                    {generalSubTab === 'programs' && (
                      <div>
                        <details open style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                          <summary style={{ padding: '14px 20px', background: '#f8fafc', fontWeight: 600, fontSize: '14px', color: '#1e293b', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', userSelect: 'none' }}>
                            🖼️ Hero Section (Care Programs Page)
                          </summary>
                          <div style={{ padding: '20px' }}>
                            <div className="form-grid-2col">
                              <div>
                                <label style={labelStyle}>Badge *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.careProgramsHero?.badge || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    careProgramsHero: { ...(generalForm.careProgramsHero || {}), badge: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Headline Accent Word *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.careProgramsHero?.titleAccent || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    careProgramsHero: { ...(generalForm.careProgramsHero || {}), titleAccent: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                              <label style={labelStyle}>Headline Title *</label>
                              <input
                                type="text"
                                required
                                value={generalForm.careProgramsHero?.title || ''}
                                onChange={e => setGeneralForm({
                                  ...generalForm,
                                  careProgramsHero: { ...(generalForm.careProgramsHero || {}), title: e.target.value }
                                })}
                                style={inputStyle}
                              />
                            </div>
                            <div style={{ marginBottom: 0 }}>
                              <label style={labelStyle}>Subline *</label>
                              <textarea
                                rows={2}
                                required
                                value={generalForm.careProgramsHero?.subline || ''}
                                onChange={e => setGeneralForm({
                                  ...generalForm,
                                  careProgramsHero: { ...(generalForm.careProgramsHero || {}), subline: e.target.value }
                                })}
                                style={inputStyle}
                              />
                            </div>
                          </div>
                        </details>

                        {renderListEditor('🩺 Featured Care Programs List', 'careProgramsList', [
                          { key: 'title', label: 'Program Name *' },
                          { key: 'slug', label: 'URL Slug *' },
                          { key: 'desc', label: 'Program Description *', type: 'textarea' }
                        ], { title: '', slug: '', desc: '' })}

                        {renderListEditor('🚶 5-Step Journey Steps', 'careProgramsSteps', [
                          { key: 'num', label: 'Step Number (e.g. 01) *' },
                          { key: 'title', label: 'Step Title *' },
                          { key: 'desc', label: 'Step Description *', type: 'textarea' }
                        ], { num: '', title: '', desc: '' })}
                      </div>
                    )}

                    {/* PAGE 5: Treatment Methods Page */}
                    {generalSubTab === 'methods' && (
                      <div>
                        <details open style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                          <summary style={{ padding: '14px 20px', background: '#f8fafc', fontWeight: 600, fontSize: '14px', color: '#1e293b', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', userSelect: 'none' }}>
                            🖼️ Hero Section (Treatment Methods Page)
                          </summary>
                          <div style={{ padding: '20px' }}>
                            <div className="form-grid-2col">
                              <div>
                                <label style={labelStyle}>Badge *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.treatmentMethodsHero?.badge || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    treatmentMethodsHero: { ...(generalForm.treatmentMethodsHero || {}), badge: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Headline Accent Word *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.treatmentMethodsHero?.titleAccent || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    treatmentMethodsHero: { ...(generalForm.treatmentMethodsHero || {}), titleAccent: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                              <label style={labelStyle}>Headline Title *</label>
                              <input
                                type="text"
                                required
                                value={generalForm.treatmentMethodsHero?.title || ''}
                                onChange={e => setGeneralForm({
                                  ...generalForm,
                                  treatmentMethodsHero: { ...(generalForm.treatmentMethodsHero || {}), title: e.target.value }
                                })}
                                style={inputStyle}
                              />
                            </div>
                            <div style={{ marginBottom: 0 }}>
                              <label style={labelStyle}>Subline *</label>
                              <textarea
                                rows={2}
                                required
                                value={generalForm.treatmentMethodsHero?.subline || ''}
                                onChange={e => setGeneralForm({
                                  ...generalForm,
                                  treatmentMethodsHero: { ...(generalForm.treatmentMethodsHero || {}), subline: e.target.value }
                                })}
                                style={inputStyle}
                              />
                            </div>
                          </div>
                        </details>

                        {renderListEditor('🛡️ Philosophy Pillars', 'treatmentMethodsPhilosophy', [
                          { key: 'title', label: 'Pillar Title *' },
                          { key: 'desc', label: 'Pillar Description *', type: 'textarea' }
                        ], { title: '', desc: '' })}

                        {renderListEditor('🚶 Treatment Journey Steps', 'treatmentMethodsJourney', [
                          { key: 'num', label: 'Step Number (e.g. 01) *' },
                          { key: 'title', label: 'Step Title *' },
                          { key: 'desc', label: 'Step Short Description *', type: 'textarea' },
                          { key: 'detail', label: 'Step Detail / Modal Description *', type: 'textarea' }
                        ], { num: '', title: '', desc: '', detail: '' })}

                        <details open style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                          <summary style={{ padding: '14px 20px', background: '#f8fafc', fontWeight: 600, fontSize: '14px', color: '#1e293b', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', userSelect: 'none' }}>
                            🎗️ Cancer Types & Side Effects Lists
                          </summary>
                          <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '16px' }}>
                              <label style={labelStyle}>Supported Cancer Types (One type per line) *</label>
                              <textarea
                                rows={6}
                                required
                                value={Array.isArray(generalForm.treatmentMethodsCancers) ? generalForm.treatmentMethodsCancers.join('\n') : ''}
                                onChange={e => setGeneralForm({
                                  ...generalForm,
                                  treatmentMethodsCancers: e.target.value.split('\n').map(c => c.trim()).filter(Boolean)
                                })}
                                style={inputStyle}
                              />
                            </div>
                            <div style={{ marginBottom: 0 }}>
                              <label style={labelStyle}>Side Effects Addressed (One side effect per line) *</label>
                              <textarea
                                rows={6}
                                required
                                value={Array.isArray(generalForm.treatmentMethodsSideEffects) ? generalForm.treatmentMethodsSideEffects.join('\n') : ''}
                                onChange={e => setGeneralForm({
                                  ...generalForm,
                                  treatmentMethodsSideEffects: e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
                                })}
                                style={inputStyle}
                              />
                            </div>
                          </div>
                        </details>
                      </div>
                    )}

                    {/* PAGE 6: Our Team */}
                    {generalSubTab === 'team' && (
                      <div>
                        <details open style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                          <summary style={{ padding: '14px 20px', background: '#f8fafc', fontWeight: 600, fontSize: '14px', color: '#1e293b', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', userSelect: 'none' }}>
                            👥 Hero Section (Our Team Page)
                          </summary>
                          <div style={{ padding: '20px' }}>
                            <div className="form-grid-2col">
                              <div>
                                <label style={labelStyle}>Badge *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.doctorsHero?.badge || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    doctorsHero: { ...(generalForm.doctorsHero || {}), badge: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Headline Title *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.doctorsHero?.title || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    doctorsHero: { ...(generalForm.doctorsHero || {}), title: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>
                            <div style={{ marginBottom: 0 }}>
                              <label style={labelStyle}>Subtitle *</label>
                              <textarea
                                rows={3}
                                required
                                value={generalForm.doctorsHero?.subtitle || ''}
                                onChange={e => setGeneralForm({
                                  ...generalForm,
                                  doctorsHero: { ...(generalForm.doctorsHero || {}), subtitle: e.target.value }
                                })}
                                style={inputStyle}
                              />
                            </div>
                          </div>
                        </details>

                        {renderListEditor('👥 Team Member Profiles', 'doctorsList', [
                          { key: 'name', label: 'Member Name *' },
                          { key: 'role', label: 'Role / Designation (e.g. Pharmacologist — M.Pharm, PhD) *' },
                          { key: 'experience', label: 'Experience Label (e.g. 22 Years Experience)' },
                          { key: 'specialty', label: 'Specialty *' },
                          { key: 'bio', label: 'Biography Description *', type: 'textarea' },
                          { key: 'image', label: 'Profile Photo *', type: 'image' }
                        ], { id: Date.now(), name: '', role: '', experience: '', specialty: '', bio: '', image: '/images/doctor-placeholder.png' })}
                      </div>
                    )}

                    {/* PAGE 7: Patient Education */}
                    {generalSubTab === 'education' && (
                      <div>
                        <details open style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                          <summary style={{ padding: '14px 20px', background: '#f8fafc', fontWeight: 600, fontSize: '14px', color: '#1e293b', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', userSelect: 'none' }}>
                            📖 Hero Section (Patient Education Page)
                          </summary>
                          <div style={{ padding: '20px' }}>
                            <div className="form-grid-2col">
                              <div>
                                <label style={labelStyle}>Badge *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.patientEducationHero?.badge || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    patientEducationHero: { ...(generalForm.patientEducationHero || {}), badge: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Headline Title *</label>
                                <input
                                  type="text"
                                  required
                                  value={generalForm.patientEducationHero?.title || ''}
                                  onChange={e => setGeneralForm({
                                    ...generalForm,
                                    patientEducationHero: { ...(generalForm.patientEducationHero || {}), title: e.target.value }
                                  })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>
                            <div style={{ marginBottom: 0 }}>
                              <label style={labelStyle}>Subtitle *</label>
                              <textarea
                                rows={3}
                                required
                                value={generalForm.patientEducationHero?.subtitle || ''}
                                onChange={e => setGeneralForm({
                                  ...generalForm,
                                  patientEducationHero: { ...(generalForm.patientEducationHero || {}), subtitle: e.target.value }
                                })}
                                style={inputStyle}
                              />
                            </div>
                          </div>
                        </details>

                        {renderListEditor('📊 Immune System Stats', 'patientEducationStats', [
                          { key: 'value', label: 'Stat Value (e.g. 2 Billion+) *' },
                          { key: 'label', label: 'Stat Description Label *' },
                          { key: 'icon', label: 'Stat Emoji Icon *' }
                        ], { value: '', label: '', icon: '🧬' })}

                        {renderListEditor('📖 Educational Guides / Articles', 'patientEducationArticles', [
                          { key: 'id', label: 'Article Route ID (e.g. tcells-vs-nk-cells) *' },
                          { key: 'title', label: 'Article Title *' },
                          { key: 'category', label: 'Category (e.g. Immunology) *' },
                          { key: 'badge', label: 'Badge (e.g. 🧬 Immune Defence) *' },
                          { key: 'icon', label: 'Emoji Icon *' },
                          { key: 'excerpt', label: 'Excerpt / Summary Description *', type: 'textarea' },
                          { key: 'readTime', label: 'Read Time (e.g. 10 min read, or Coming Soon) *' },
                          { key: 'gradient', label: 'Card Gradient Style (CSS linear-gradient) *' }
                        ], { id: '', title: '', category: '', badge: '', icon: '🛡️', excerpt: '', readTime: '5 min read', gradient: 'linear-gradient(135deg, #0b5b67 0%, #38bed5 100%)', disabled: false })}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button type="submit" disabled={formStatus === 'sending'} style={submitBtnStyle}>
                        {formStatus === 'sending' ? 'Saving Copy...' : '⚙️ Save Website Copy'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* RIGHT COLUMN: Already Added Items List */}
              <div className="admin-list-container">
                <h3 style={{ margin: '0 0 20px', fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '12px', letterSpacing: '0.2px' }}>
                  {contentTab === 'products' ? 'All Products' : contentTab === 'testimonials' ? 'All Testimonials' : 'ℹ️ Editorial Guidelines'} 
                  {contentTab !== 'general' && ` (${contentTab === 'products' ? dynProducts.length : dynTestimonials.length})`}
                </h3>

                <div className="custom-scroll" style={{ maxHeight: '650px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '12px' }}>
                  {contentTab === 'general' && (
                    <div style={{ padding: '20px', background: 'var(--bg-main)', borderRadius: '16px', border: '1.5px solid var(--border-color)' }}>
                      <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaInfoCircle style={{ color: PRIMARY }} /> Guidelines for Copy Updates
                      </h3>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.8' }}>
                        <li><strong>Instant Sync:</strong> Changes are written to the database and will update globally on the site immediately upon clicking "Save Website Copy".</li>
                        <li><strong>Safe Defaults:</strong> If you clear a field, the site will automatically fallback to default values to prevent layout breaks.</li>
                        <li><strong>SEO Compliance:</strong> Avoid changing titles to very long texts as it may affect metadata responsiveness.</li>
                        <li><strong>WhatsApp:</strong> Ensure the WhatsApp number is written with country code and digits only (e.g. <code>918884588835</code>) so the click-to-chat links work correctly.</li>
                      </ul>
                      <div style={{ marginTop: '24px', padding: '12px', background: `${PRIMARY}08`, borderRadius: '10px', borderLeft: `4px solid ${PRIMARY}` }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: PRIMARY, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Active Config File</span>
                        <code style={{ fontSize: '11.5px', color: 'var(--text-primary)' }}>backend/data/websiteContent.json</code>
                      </div>
                    </div>
                  )}

                  {contentTab === 'products' && (
                    dynProducts.length === 0 ? (
                      <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', margin: '40px 0' }}>No products found.</p>
                    ) : (
                      dynProducts.map(p => (
                        <div key={p.id} className="admin-item-row">
                          <div style={{ flex: 1, minWidth: 0, marginRight: '8px' }}>
                            <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{p.name}</strong>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Category: {p.category} • Price: ₹{p.price}</span>
                          </div>
                          <div className="admin-item-row-actions">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductForm({
                                  name: p.name,
                                  category: p.category,
                                  price: p.price,
                                  originalPrice: p.originalPrice || '',
                                  description: p.description || '',
                                  benefits: Array.isArray(p.benefits) ? p.benefits.join(', ') : '',
                                  ingredients: p.ingredients || '',
                                  dosage: p.dosage || '',
                                  size: p.size || '',
                                  badge: p.badge || '',
                                  icon: p.icon || '🌿',
                                  color: p.color || '#1a6e52'
                                });
                                setFormError('');
                                setFormStatus('');
                              }}
                              className="btn-edit"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="btn-delete"
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )
                  )}

                  {contentTab === 'testimonials' && (
                    dynTestimonials.length === 0 ? (
                      <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', margin: '40px 0' }}>No testimonials found.</p>
                    ) : (
                      dynTestimonials.map((t, idx) => (
                        <div key={t.id || idx} className="admin-item-row" style={{ alignItems: 'flex-start' }}>
                          <div style={{ flex: 1, minWidth: 0, marginRight: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{t.name} ({t.location})</strong>
                              <span style={{ color: '#fbbf24', fontSize: '12px' }}>{'★'.repeat(t.rating)}</span>
                            </div>
                            <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', textOverflow: 'ellipsis', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>"{t.text}"</p>
                            {(t.videoUrl || t.thumbnailUrl) && (
                              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '11px', color: '#047857', fontWeight: 600 }}>
                                {t.thumbnailUrl && <span>🖼️ Thumbnail</span>}
                                {t.videoUrl && <span>🎥 Video</span>}
                              </div>
                            )}
                          </div>
                          <div className="admin-item-row-actions" style={{ alignSelf: 'center' }}>
                            <button
                              onClick={() => {
                                setEditingTestimonial(t);
                                setTestimonialForm({
                                  name: t.name,
                                  location: t.location || 'India',
                                  rating: t.rating || 5,
                                  text: t.text || '',
                                  date: t.date || 'Recent',
                                  videoUrl: t.videoUrl || '',
                                  thumbnailUrl: t.thumbnailUrl || ''
                                });
                                setFormError('');
                                setFormStatus('');
                              }}
                              className="btn-edit"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTestimonial(t.id)}
                              className="btn-delete"
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function OrderDetailViewPanel({ details, onApproveCancellation, onApproveReturn, onReceiveReturn, onInitiateRefund, onSyncRefund, onCancelOrderDirect, onShipOrderDirect, onDeleteOrder, onEditOrder, onClose }) {
  const { order, events, refund } = details;
  const [remarks, setRemarks] = React.useState('');
  const [returnRemarks, setReturnRemarks] = React.useState('');
  const [physicalReturnRequired, setPhysicalReturnRequired] = React.useState(true);
  const [manualTxnId, setManualTxnId] = React.useState('');
  const [manualMethod, setManualMethod] = React.useState('UPI');

  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    customerName: order.customerName || '',
    phone: order.phone || '',
    email: order.email || '',
    address: order.address || '',
    city: order.city || '',
    state: order.state || '',
    pincode: order.pincode || '',
    productName: order.productName || '',
    quantity: order.quantity || 1,
    orderAmount: order.orderAmount || 0,
    paymentMethod: order.paymentMethod || 'COD / Bank Transfer',
    paymentStatus: order.paymentStatus || 'COD_PENDING',
    orderStatus: order.orderStatus || 'PENDING',
    shipmentStatus: order.shipmentStatus || '',
    awb: order.awb || '',
    courierName: order.courierName || ''
  });

  React.useEffect(() => {
    setEditForm({
      customerName: order.customerName || '',
      phone: order.phone || '',
      email: order.email || '',
      address: order.address || '',
      city: order.city || '',
      state: order.state || '',
      pincode: order.pincode || '',
      productName: order.productName || '',
      quantity: order.quantity || 1,
      orderAmount: order.orderAmount || 0,
      paymentMethod: order.paymentMethod || 'COD / Bank Transfer',
      paymentStatus: order.paymentStatus || 'COD_PENDING',
      orderStatus: order.orderStatus || 'PENDING',
      shipmentStatus: order.shipmentStatus || '',
      awb: order.awb || '',
      courierName: order.courierName || ''
    });
    setIsEditing(false);
  }, [order]);

  const labelStyle = { fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '4px' };

  if (isEditing) {
    return (
      <div style={{ background: '#fff', border: '1.5px solid #1a6e5230', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>Edit Order Details</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{order.orderId}</span>
          </div>
          <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px' }}>
          <div>
            <label style={labelStyle}>Customer Name</label>
            <input
              type="text"
              value={editForm.customerName}
              onChange={e => setEditForm({ ...editForm, customerName: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="text"
              value={editForm.phone}
              onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', fontSize: '12.5px' }}>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              value={editForm.email}
              onChange={e => setEditForm({ ...editForm, email: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', fontSize: '12.5px' }}>
          <div>
            <label style={labelStyle}>Shipping Address</label>
            <input
              type="text"
              value={editForm.address}
              onChange={e => setEditForm({ ...editForm, address: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12.5px' }}>
          <div>
            <label style={labelStyle}>City</label>
            <input
              type="text"
              value={editForm.city}
              onChange={e => setEditForm({ ...editForm, city: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={labelStyle}>State</label>
            <input
              type="text"
              value={editForm.state}
              onChange={e => setEditForm({ ...editForm, state: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={labelStyle}>Pincode</label>
            <input
              type="text"
              value={editForm.pincode}
              onChange={e => setEditForm({ ...editForm, pincode: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '8px', fontSize: '12.5px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
          <div>
            <label style={labelStyle}>Product Name</label>
            <input
              type="text"
              value={editForm.productName}
              onChange={e => setEditForm({ ...editForm, productName: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={labelStyle}>Quantity</label>
            <input
              type="number"
              value={editForm.quantity}
              onChange={e => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={labelStyle}>Total Amount (₹)</label>
            <input
              type="number"
              value={editForm.orderAmount}
              onChange={e => setEditForm({ ...editForm, orderAmount: Number(e.target.value) })}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px' }}>
          <div>
            <label style={labelStyle}>Payment Method</label>
            <input
              type="text"
              value={editForm.paymentMethod}
              onChange={e => setEditForm({ ...editForm, paymentMethod: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={labelStyle}>Payment Status</label>
            <select
              value={editForm.paymentStatus}
              onChange={e => setEditForm({ ...editForm, paymentStatus: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
            >
              <option value="PAID">PAID</option>
              <option value="COD_PENDING">COD_PENDING</option>
              <option value="REFUNDED">REFUNDED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px' }}>
          <div>
            <label style={labelStyle}>Order Status</label>
            <select
              value={editForm.orderStatus}
              onChange={e => setEditForm({ ...editForm, orderStatus: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
            >
              <option value="ORDER_PLACED">Order Placed</option>
              <option value="ORDER_CONFIRMED">Order Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="RETURN_REQUESTED">Return Requested</option>
              <option value="RETURN_APPROVED">Return Approved</option>
              <option value="REFUND_APPROVED">Refund Approved</option>
              <option value="REFUND_PROCESSED">Refund Processed</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Courier / AWB</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input
                type="text"
                placeholder="Courier"
                value={editForm.courierName}
                onChange={e => setEditForm({ ...editForm, courierName: e.target.value })}
                style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', minWidth: 0, boxSizing: 'border-box' }}
              />
              <input
                type="text"
                placeholder="AWB"
                value={editForm.awb}
                onChange={e => setEditForm({ ...editForm, awb: e.target.value })}
                style={{ flex: 1.5, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', minWidth: 0, boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
          <button
            onClick={async () => {
              try {
                await onEditOrder(order.orderId, editForm);
                setIsEditing(false);
              } catch (err) {}
            }}
            style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
          >
            💾 Save Changes
          </button>
          <button
            onClick={() => setIsEditing(false)}
            style={{ flex: 1, background: '#64748b', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', border: '1.5px solid #1a6e5230', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>Order Details</h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{order.orderId}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
      </div>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginTop: '-8px' }}>
        <button
          onClick={() => setIsEditing(true)}
          style={{
            flex: 1, background: '#3b82f6', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px',
            fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}
        >
          ✏️ Edit Order
        </button>
      </div>

      {/* Summary grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px' }}>
        <div>
          <span style={labelStyle}>Customer Details</span>
          <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{order.customerName}</p>
          <p style={{ margin: '2px 0 0', color: '#475569' }}>{order.phone}</p>
          <p style={{ margin: '2px 0 0', color: '#475569' }}>{order.email || 'No email'}</p>
        </div>
        <div>
          <span style={labelStyle}>Shipping Address</span>
          <p style={{ margin: '4px 0 0', color: '#475569', lineHeight: '1.4' }}>
            {order.address}, {order.city}, {order.state} - {order.pincode}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
        <div>
          <span style={labelStyle}>Order Summary</span>
          <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{order.productName}</p>
          <p style={{ margin: '2px 0 0', color: '#64748b' }}>Qty: {order.quantity} • Amt: ₹{order.orderAmount}</p>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '11.5px' }}>
            🕐 {order.orderDate || (order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '—')}
          </p>
        </div>
        <div>
          <span style={labelStyle}>Payment & Courier</span>
          <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{order.paymentMethod} ({order.paymentStatus})</p>
          {order.awb && <p style={{ margin: '2px 0 0', color: '#0891b2', fontWeight: 600 }}>AWB: {order.awb} ({order.courierName || 'Shiprocket'})</p>}
          {order.labelUrl && (
            <a href={order.labelUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', color: '#16a34a', fontWeight: 600, fontSize: '11px', textDecoration: 'none', marginTop: '4px', marginRight: '8px' }}>
              📄 Print Label
            </a>
          )}
          {order.manifestUrl && (
            <a href={order.manifestUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', color: '#0f3460', fontWeight: 600, fontSize: '11px', textDecoration: 'none', marginTop: '4px' }}>
              📋 Print Manifest
            </a>
          )}
        </div>
      </div>

      {/* Dynamic Action Panel depending on state */}
      <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 12px', fontSize: '13px', color: '#0f172a', fontWeight: 700 }}>Management Actions</h4>
        
        {/* Case 1: Cancellation Requested */}
        {order.cancellationStatus === 'REQUESTED' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#b45309', fontWeight: 600 }}>⚠️ Customer has requested order cancellation.</p>
            <input
              type="text"
              placeholder="Remarks / Rejection Reason..."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onApproveCancellation(order.orderId, true, remarks)}
                style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
              >
                Approve & Cancel
              </button>
              <button
                onClick={() => onApproveCancellation(order.orderId, false, remarks)}
                style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
              >
                Decline Request
              </button>
            </div>
          </div>
        )}

        {/* Case 2: Return Requested */}
        {order.returnStatus === 'REQUESTED' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#b45309', fontWeight: 600 }}>⚠️ Customer has requested return of delivered items.</p>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={physicalReturnRequired}
                onChange={e => setPhysicalReturnRequired(e.target.checked)}
              />
              Require Physical Product Return (Pickup)
            </label>
            <input
              type="text"
              placeholder="Remarks / Rejection Reason..."
              value={returnRemarks}
              onChange={e => setReturnRemarks(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onApproveReturn(order.orderId, true, physicalReturnRequired, returnRemarks)}
                style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
              >
                Approve Return
              </button>
              <button
                onClick={() => onApproveReturn(order.orderId, false, false, returnRemarks)}
                style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
              >
                Decline Return
              </button>
            </div>
          </div>
        )}

        {/* Case 3: Return Pickup Scheduled */}
        {order.orderStatus === 'RETURN_PICKUP_SCHEDULED' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#2563eb', fontWeight: 600 }}>📦 Return pickup scheduled. Verify items received.</p>
            <input
              type="text"
              placeholder="Verification Remarks..."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onReceiveReturn(order.orderId, true, remarks)}
                style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
              >
                Mark Items Received (Approve Refund)
              </button>
              <button
                onClick={() => onReceiveReturn(order.orderId, false, remarks)}
                style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
              >
                Mark Pickup Failed
              </button>
            </div>
          </div>
        )}

        {/* Case 4: Refund Approved */}
        {order.refundStatus === 'APPROVED' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#16a34a', fontWeight: 600 }}>💰 Refund approved. Ready to initiate transaction.</p>
            
            {!order.paymentMethod.toLowerCase().includes('online') ? (
              // COD/Manual Refund details
              <>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Refund Method</label>
                    <select
                      value={manualMethod}
                      onChange={e => setManualMethod(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="GPay/PhonePe">GPay / PhonePe</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Transaction ID *</label>
                    <input
                      type="text"
                      placeholder="Txn Ref No..."
                      value={manualTxnId}
                      onChange={e => setManualTxnId(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!manualTxnId) return alert('Transaction ID is required for manual refund.');
                    onInitiateRefund(order.orderId, manualTxnId, manualMethod);
                  }}
                  style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', width: '100%', marginTop: '8px' }}
                >
                  Record Manual Refund
                </button>
              </>
            ) : (
              // Online Gateway Refund
              <button
                onClick={() => onInitiateRefund(order.orderId)}
                style={{ background: '#1a6e52', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', width: '100%' }}
              >
                Initiate Gateway Refund (Razorpay API)
              </button>
            )}
          </div>
        )}

        {/* Case 5: Refund Initiated */}
        {order.refundStatus === 'INITIATED' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#2563eb', fontWeight: 600 }}>⏳ Refund initiated and awaiting gateway settlement.</p>
            {refund && (
              <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
                Gateway Refund ID: <strong>{refund.paymentGatewayRefundId}</strong>
              </p>
            )}
            <button
              onClick={() => onSyncRefund(order.orderId)}
              style={{ background: '#38bed5', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', width: '100%' }}
            >
              Sync Gateway Status (Razorpay)
            </button>
          </div>
        )}

        {/* Case 6: Refund Completed */}
        {order.refundStatus === 'PROCESSED' && (
          <div>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#16a34a', fontWeight: 600 }}>✅ Refund completed successfully.</p>
            {refund && (
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475569' }}>
                Refund ID: <strong>{refund.refundId}</strong><br/>
                Txn ID: {refund.paymentGatewayRefundId} ({refund.method})<br/>
                Settled At: {new Date(refund.processedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Case 7: Refund Failed */}
        {order.refundStatus === 'FAILED' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#dc2626', fontWeight: 600 }}>❌ Refund failed at Gateway.</p>
            {refund && (
              <p style={{ margin: 0, fontSize: '12px', color: '#ef4444' }}>
                Reason: {refund.failureReason}
              </p>
            )}
            <button
              onClick={() => onInitiateRefund(order.orderId)}
              style={{ background: '#1a6e52', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 600, fontSize: '12px', cursor: 'pointer', width: '100%' }}
            >
              Retry Gateway Refund
            </button>
          </div>
        )}

        {/* No action active */}
        {!['REQUESTED', 'APPROVED', 'INITIATED', 'PROCESSED', 'FAILED'].includes(order.refundStatus) && order.cancellationStatus !== 'REQUESTED' && order.returnStatus !== 'REQUESTED' && order.orderStatus !== 'RETURN_PICKUP_SCHEDULED' && (
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>No pending administrative action for this order.</p>
        )}

        {/* Direct Ship Button (Available for confirmed/placed orders that are not shipped, delivered, or cancelled, and don't have a pending cancellation request) */}
        {!['CANCELLED', 'SHIPPED', 'DELIVERED', 'OUT_FOR_DELIVERY', 'RTO_INITIATED', 'RTO_DELIVERED'].includes(order.orderStatus) && order.cancellationStatus !== 'REQUESTED' && (
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1' }}>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to request AWB assignment, schedule courier pickup, and generate labels/manifests for this order?')) {
                  onShipOrderDirect(order.orderId);
                }
              }}
              style={{
                width: '100%',
                background: '#1a6e52',
                color: '#fff',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              🚀 Ship Order (Auto AWB, Label & Manifest)
            </button>
          </div>
        )}

        {/* Direct Cancel Button */}
        {!['CANCELLED', 'SHIPPED', 'DELIVERED', 'OUT_FOR_DELIVERY', 'RTO_INITIATED', 'RTO_DELIVERED'].includes(order.orderStatus) && order.cancellationStatus !== 'REQUESTED' && (
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1' }}>
            <button
              onClick={() => {
                const remarks = prompt('Enter remarks/reason for cancelling this order:');
                if (remarks !== null) {
                  onCancelOrderDirect(order.orderId, remarks);
                }
              }}
              style={{
                width: '100%',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              ❌ Cancel Order (Remove from Shiprocket)
            </button>
          </div>
        )}

        {/* Admin Direct Refund — for any PAID prepaid order without an active/completed refund */}
        {order.paymentStatus === 'PAID' &&
         order.paymentMethod?.toLowerCase().includes('online') &&
         !['APPROVED', 'INITIATED', 'PROCESSING', 'PROCESSED'].includes(order.refundStatus) && (
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
            <p style={{ margin: '0 0 8px', fontSize: '11.5px', color: '#7c3aed', fontWeight: 600 }}>💸 Manual Refund Override (Admin)</p>
            <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#64748b' }}>
              Directly approve &amp; initiate a Razorpay refund for this order without requiring a customer return/cancel request.
            </p>
            <button
              onClick={() => {
                if (window.confirm(`Initiate Razorpay refund of ₹${order.orderAmount} for order ${order.orderId}? This will immediately credit the customer.`)) {
                  onInitiateRefund(order.orderId);
                }
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              💰 Initiate Refund — ₹{order.orderAmount} via Razorpay
            </button>
          </div>
        )}
      </div>

      {/* Event history timeline */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
        <span style={labelStyle}>Order Event Timeline</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px', maxHeight: '160px', overflowY: 'auto' }}>
          {events.map((e, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
              <div style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>{new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div>
                <strong style={{ color: '#0f172a' }}>{e.status}</strong>: {e.customerMessage}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
