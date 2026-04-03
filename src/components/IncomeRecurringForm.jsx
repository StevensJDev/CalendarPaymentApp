import { useState } from 'react';
import './PaymentForm.css';

const RECURRENCE_OPTIONS = [
  { value: 'one-time', label: 'One-Time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

const defaultForm = {
  name: '',
  amount: '',
  startDate: '',
  recurrence: 'monthly',
};

export default function IncomeRecurringForm({ onAddIncome }) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Income source is required.';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      errs.amount = 'Enter a valid positive amount.';
    if (!form.startDate) errs.startDate = 'Start date is required.';
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onAddIncome({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      amount: parseFloat(form.amount),
      startDate: form.startDate,
      recurrence: form.recurrence,
    });
    setForm(defaultForm);
    setErrors({});
  }

  return (
    <form className="payment-form" onSubmit={handleSubmit} noValidate>
      <h2>Add Income</h2>
      <div className="form-group">
        <label htmlFor="income-name">Source</label>
        <input
          id="income-name"
          name="name"
          type="text"
          placeholder="e.g. Paycheck"
          value={form.name}
          onChange={handleChange}
          className={errors.name ? 'input-error' : ''}
        />
        {errors.name && <span className="error-msg">{errors.name}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="income-amount">Amount ($)</label>
        <input
          id="income-amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={form.amount}
          onChange={handleChange}
          className={errors.amount ? 'input-error' : ''}
        />
        {errors.amount && <span className="error-msg">{errors.amount}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="income-startDate">Start Date</label>
        <input
          id="income-startDate"
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={handleChange}
          className={errors.startDate ? 'input-error' : ''}
        />
        {errors.startDate && <span className="error-msg">{errors.startDate}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="income-recurrence">Recurrence</label>
        <select
          id="income-recurrence"
          name="recurrence"
          value={form.recurrence}
          onChange={handleChange}
        >
          {RECURRENCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-primary">Add Income</button>
    </form>
  );
}
