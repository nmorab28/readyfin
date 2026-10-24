import { useRef, useState } from 'react';
import { MAX_AMOUNT_CENTS, parseCopToCents } from '../lib/money.js';

const NOTE_MAX_LENGTH = 200;
// API field names (contract) → form fields, so server errors land next to the right input.
const FORM_FIELD = { amountCents: 'amount', categoryId: 'category', date: 'date', note: 'note' };

// Mirrors the server rules so the user gets instant feedback; the server stays the authority.
function validate({ amount, date, categoryId }) {
  const errors = {};
  const amountCents = parseCopToCents(amount);

  if (amount.trim() === '' || (amountCents !== null && amountCents <= 0)) {
    errors.amount = 'El monto debe ser mayor que cero';
  } else if (amountCents === null) {
    errors.amount = 'Escribe el monto como 25.000 o 25.000,50';
  } else if (amountCents > MAX_AMOUNT_CENTS) {
    errors.amount = 'El monto no puede superar $ 999.999.999.999,99';
  }
  if (!date) errors.date = 'La fecha es obligatoria';
  if (!categoryId) errors.category = 'La categoría es obligatoria';

  return { errors, amountCents };
}

function FieldError({ id, message }) {
  return message ? <p id={id} className="field-error">{message}</p> : null;
}

export default function TransactionForm({ categories, today, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today);
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  // State updates are not visible until the next render; the ref stops a fast double click
  // from submitting twice before the button is disabled.
  const savingRef = useRef(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (savingRef.current) return;

    const { errors: found, amountCents } = validate({ amount, date, categoryId });
    setFormError(null);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    savingRef.current = true;
    setSaving(true);
    try {
      await onSubmit({ type: 'expense', amountCents, date, categoryId: Number(categoryId), note: note.trim() || null });
      setAmount('');
      setNote('');
    } catch (err) {
      const field = FORM_FIELD[err.field];
      if (field) setErrors({ [field]: err.message });
      else setFormError(err.message);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  const invalid = (field) => ({
    'aria-invalid': errors[field] ? 'true' : undefined,
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
  });

  return (
    <form className="transaction-form" onSubmit={handleSubmit} noValidate>
      <h2>Registrar gasto</h2>

      <div className="field">
        <label htmlFor="amount">Monto</label>
        <input
          id="amount" type="text" inputMode="decimal" placeholder="25.000" autoComplete="off"
          value={amount} onChange={(e) => setAmount(e.target.value)} {...invalid('amount')}
        />
        <FieldError id="amount-error" message={errors.amount} />
      </div>

      <div className="field">
        <label htmlFor="date">Fecha</label>
        <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} {...invalid('date')} />
        <FieldError id="date-error" message={errors.date} />
      </div>

      <div className="field">
        <label htmlFor="category">Categoría</label>
        <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} {...invalid('category')}>
          <option value="">Selecciona una categoría</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <FieldError id="category-error" message={errors.category} />
      </div>

      <div className="field field--wide">
        <label htmlFor="note">Nota (opcional)</label>
        <input
          id="note" type="text" maxLength={NOTE_MAX_LENGTH}
          value={note} onChange={(e) => setNote(e.target.value)} {...invalid('note')}
        />
        <FieldError id="note-error" message={errors.note} />
      </div>

      {formError && <p role="alert" className="form-error">{formError}</p>}

      <button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar gasto'}</button>
    </form>
  );
}
