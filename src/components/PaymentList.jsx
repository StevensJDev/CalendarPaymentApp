import './PaymentList.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function PaymentList({ year, occurrences, onDeletePayment, payments }) {
  // Group occurrences by month
  const byMonth = Array.from({ length: 12 }, () => []);
  for (const occ of occurrences) {
    const [y, m] = occ.date.split('-').map(Number);
    if (y === year) byMonth[m - 1].push(occ);
  }

  const yearTotal = occurrences
    .filter((o) => o.date.startsWith(`${year}-`))
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="payment-list">
      <div className="payment-list-header">
        <h2>Scheduled Payments — {year}</h2>
      </div>

      {payments.length === 0 ? (
        <p className="empty-state">No payments added yet. Use the form to add one!</p>
      ) : occurrences.filter((o) => o.date.startsWith(`${year}-`)).length === 0 ? (
        <p className="empty-state">No payments scheduled for {year}.</p>
      ) : (
        <>
          {byMonth.map((items, monthIdx) =>
            items.length === 0 ? null : (
              <div key={monthIdx} className="month-section">
                <h3 className="month-title">{MONTH_NAMES[monthIdx]}</h3>
                <table className="payment-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Payment</th>
                      <th>Recurrence</th>
                      <th className="amount-col">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((occ, i) => (
                      <tr key={i}>
                        <td>{formatDate(occ.date)}</td>
                        <td>{occ.name}</td>
                        <td className="recurrence-badge">
                          <span className={`badge badge-${occ.recurrence}`}>
                            {occ.recurrence}
                          </span>
                        </td>
                        <td className="amount-col">${occ.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          <div className="year-total">
            <span>Total for {year}</span>
            <span className="total-amount">${yearTotal.toFixed(2)}</span>
          </div>
        </>
      )}

      {payments.length > 0 && (
        <div className="payment-list-manage">
          <h3>Manage Payments</h3>
          <ul className="manage-list">
            {payments.map((p) => (
              <li key={p.id} className="manage-item">
                <div className="manage-item-info">
                  <strong>{p.name}</strong>
                  <span>${p.amount.toFixed(2)} · {p.recurrence} · from {formatDate(p.startDate)}</span>
                </div>
                <button
                  className="btn-delete"
                  onClick={() => onDeletePayment(p.id)}
                  aria-label={`Delete ${p.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
