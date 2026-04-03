import { useState } from 'react';
import './IncomeForm.css';

export default function IncomeForm({ income, onIncomeChange }) {
  const [value, setValue] = useState(income || '');

  function handleChange(e) {
    const val = e.target.value;
    setValue(val);
    if (!isNaN(val) && val !== '') {
      onIncomeChange(Number(val));
    }
  }

  return (
    <form className="income-form" onSubmit={e => e.preventDefault()}>
      <label htmlFor="income">Monthly Income ($)</label>
      <input
        id="income"
        name="income"
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={value}
        onChange={handleChange}
      />
    </form>
  );
}
