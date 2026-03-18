import './Calendar.css';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Calendar({ year, month, paymentsByDate }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  function getPaymentsForDay(day) {
    if (!day) return [];
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return paymentsByDate[key] || [];
  }

  return (
    <div className="calendar">
      <div className="calendar-grid">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="calendar-header-cell">
            {d}
          </div>
        ))}
        {cells.map((day, idx) => {
          const payments = getPaymentsForDay(day);
          const isToday = isCurrentMonth && day === today.getDate();
          return (
            <div
              key={idx}
              className={`calendar-cell${day ? '' : ' empty'}${isToday ? ' today' : ''}${payments.length > 0 ? ' has-payments' : ''}`}
            >
              {day && (
                <>
                  <span className="day-number">{day}</span>
                  {payments.length > 0 && (
                    <div className="payment-markers">
                      {payments.slice(0, 3).map((p, i) => (
                        <span key={i} className="payment-marker" title={`${p.name}: $${p.amount.toFixed(2)}`}>
                          {p.name.length > 10 ? p.name.slice(0, 9) + '…' : p.name}
                        </span>
                      ))}
                      {payments.length > 3 && (
                        <span className="payment-marker more">+{payments.length - 3} more</span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { MONTH_NAMES };
