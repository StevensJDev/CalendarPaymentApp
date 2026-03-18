import { useState, useMemo } from 'react';
import PaymentForm from './components/PaymentForm';
import Calendar from './components/Calendar';
import PaymentList from './components/PaymentList';
import './App.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Returns all occurrences of a payment within a given year range.
 * Generates dates from the start date up to end of the target year + 1 to support
 * viewing adjacent years without recalculating.
 */
function getOccurrences(payment, fromYear, toYear) {
  const { startDate, recurrence, name, amount, id } = payment;
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const rangeEnd = new Date(toYear, 11, 31);

  if (start > rangeEnd) return [];

  const results = [];

  function addOcc(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    results.push({ id, name, amount, recurrence, date: `${y}-${m}-${d}` });
  }

  if (recurrence === 'one-time') {
    if (start.getFullYear() >= fromYear && start.getFullYear() <= toYear) addOcc(start);
    return results;
  }

  if (recurrence === 'weekly' || recurrence === 'bi-weekly') {
    const step = recurrence === 'weekly' ? 7 : 14;
    const cur = new Date(start);
    while (cur <= rangeEnd) {
      if (cur.getFullYear() >= fromYear) addOcc(new Date(cur));
      cur.setDate(cur.getDate() + step);
    }
    return results;
  }

  if (recurrence === 'monthly') {
    const cur = new Date(sy, sm - 1, sd);
    while (cur <= rangeEnd) {
      if (cur.getFullYear() >= fromYear) addOcc(new Date(cur));
      cur.setMonth(cur.getMonth() + 1);
      // When JS overflows a short month (e.g. Jan 31 + 1 month = Mar 3),
      // setDate(0) rewinds to the last day of the previous month (Feb 28/29).
      if (cur.getDate() !== sd) cur.setDate(0);
    }
    return results;
  }

  if (recurrence === 'quarterly') {
    const cur = new Date(sy, sm - 1, sd);
    while (cur <= rangeEnd) {
      if (cur.getFullYear() >= fromYear) addOcc(new Date(cur));
      cur.setMonth(cur.getMonth() + 3);
      // Same end-of-month clamping as monthly recurrence
      if (cur.getDate() !== sd) cur.setDate(0);
    }
    return results;
  }

  if (recurrence === 'annually') {
    for (let y = Math.max(sy, fromYear); y <= toYear; y++) {
      const d = new Date(y, sm - 1, sd);
      addOcc(d);
    }
    return results;
  }

  return results;
}

function buildPaymentsByDate(occurrences) {
  const map = {};
  for (const occ of occurrences) {
    if (!map[occ.date]) map[occ.date] = [];
    map[occ.date].push(occ);
  }
  return map;
}

export default function App() {
  const today = new Date();
  const [payments, setPayments] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'list'

  function handleAddPayment(payment) {
    setPayments((prev) => [...prev, payment]);
  }

  function handleDeletePayment(id) {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  }

  const allOccurrences = useMemo(() => {
    return payments.flatMap((p) => getOccurrences(p, currentYear - 1, currentYear + 1));
  }, [payments, currentYear]);

  const paymentsByDate = useMemo(() => buildPaymentsByDate(allOccurrences), [allOccurrences]);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function prevYear() {
    setCurrentYear((y) => y - 1);
  }

  function nextYear() {
    setCurrentYear((y) => y + 1);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <h1 className="app-title">📅 Calendar Payment App</h1>
          <p className="app-subtitle">Track and visualize your recurring payments</p>
        </div>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <PaymentForm onAddPayment={handleAddPayment} />
        </aside>

        <section className="content">
          <div className="tab-bar">
            <button
              className={`tab-btn${activeTab === 'calendar' ? ' active' : ''}`}
              onClick={() => setActiveTab('calendar')}
            >
              Monthly Calendar
            </button>
            <button
              className={`tab-btn${activeTab === 'list' ? ' active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              Year View / Payment List
            </button>
          </div>

          {activeTab === 'calendar' && (
            <div className="calendar-section">
              <div className="calendar-nav">
                <button className="nav-btn" onClick={prevMonth} aria-label="Previous month">‹</button>
                <span className="nav-title">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </span>
                <button className="nav-btn" onClick={nextMonth} aria-label="Next month">›</button>
              </div>
              <Calendar
                year={currentYear}
                month={currentMonth}
                paymentsByDate={paymentsByDate}
              />
            </div>
          )}

          {activeTab === 'list' && (
            <div className="list-section">
              <div className="calendar-nav">
                <button className="nav-btn" onClick={prevYear} aria-label="Previous year">‹</button>
                <span className="nav-title">{currentYear}</span>
                <button className="nav-btn" onClick={nextYear} aria-label="Next year">›</button>
              </div>
              <PaymentList
                year={currentYear}
                occurrences={allOccurrences}
                payments={payments}
                onDeletePayment={handleDeletePayment}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

