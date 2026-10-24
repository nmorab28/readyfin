import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../src/api/client.js';
import TransactionForm from '../../src/transactions/TransactionForm.jsx';

const categories = [
  { id: 1, name: 'Alimentación', type: 'expense', isDefault: true },
  { id: 2, name: 'Transporte', type: 'expense', isDefault: true },
];

function renderForm(onSubmit = vi.fn(async () => {})) {
  const user = userEvent.setup();
  render(<TransactionForm categories={categories} today="2026-10-23" onSubmit={onSubmit} />);
  return { user, onSubmit };
}

const amount = () => screen.getByLabelText('Monto');
const category = () => screen.getByLabelText('Categoría');
const save = () => screen.getByRole('button', { name: 'Guardar gasto' });

describe('TransactionForm (RDF-6)', () => {
  it('defaults the date to today', () => {
    renderForm();

    expect(screen.getByLabelText('Fecha')).toHaveValue('2026-10-23');
  });

  it('submits the expense in cents with the chosen category', async () => {
    const { user, onSubmit } = renderForm();

    await user.type(amount(), '25.000');
    await user.selectOptions(category(), 'Alimentación');
    await user.type(screen.getByLabelText('Nota (opcional)'), 'Mercado');
    await user.click(save());

    expect(onSubmit).toHaveBeenCalledWith({
      type: 'expense', amountCents: 2500000, date: '2026-10-23', categoryId: 1, note: 'Mercado',
    });
  });

  it.each([[''], ['0'], ['-5']])('rejects the amount %j without calling the API', async (typed) => {
    const { user, onSubmit } = renderForm();

    if (typed) await user.type(amount(), typed);
    await user.selectOptions(category(), 'Alimentación');
    await user.click(save());

    expect(screen.getByText('El monto debe ser mayor que cero')).toBeInTheDocument();
    expect(amount()).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('explains how to write an amount it cannot read', async () => {
    const { user, onSubmit } = renderForm();

    await user.type(amount(), '25,000.50');
    await user.selectOptions(category(), 'Alimentación');
    await user.click(save());

    expect(screen.getByText('Escribe el monto como 25.000 o 25.000,50')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('requires a category', async () => {
    const { user, onSubmit } = renderForm();

    await user.type(amount(), '25.000');
    await user.click(save());

    expect(screen.getByText('La categoría es obligatoria')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables the button while saving so a double click creates one expense', async () => {
    let finish;
    const onSubmit = vi.fn(() => new Promise((resolve) => { finish = resolve; }));
    const { user } = renderForm(onSubmit);

    await user.type(amount(), '25.000');
    await user.selectOptions(category(), 'Alimentación');
    await user.dblClick(save());

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Guardando…' })).toBeDisabled();
    finish();
    expect(await screen.findByRole('button', { name: 'Guardar gasto' })).toBeEnabled();
  });

  it('keeps what the user typed when the server cannot be reached', async () => {
    const onSubmit = vi.fn(async () => {
      throw new ApiError('No se pudo conectar con el servidor. Intenta de nuevo.', { code: 'NETWORK_ERROR' });
    });
    const { user } = renderForm(onSubmit);

    await user.type(amount(), '25.000');
    await user.selectOptions(category(), 'Alimentación');
    await user.click(save());

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor');
    expect(amount()).toHaveValue('25.000');
    expect(category()).toHaveValue('1');
  });

  it('shows a server validation error next to the field it refers to', async () => {
    const onSubmit = vi.fn(async () => {
      throw new ApiError('La categoría seleccionada no existe', { code: 'VALIDATION_ERROR', field: 'categoryId' });
    });
    const { user } = renderForm(onSubmit);

    await user.type(amount(), '25.000');
    await user.selectOptions(category(), 'Alimentación');
    await user.click(save());

    expect(await screen.findByText('La categoría seleccionada no existe')).toBeInTheDocument();
    expect(category()).toHaveAttribute('aria-invalid', 'true');
  });

  it('clears amount and note after saving, keeping date and category for the next one', async () => {
    const { user } = renderForm();

    await user.type(amount(), '25.000');
    await user.selectOptions(category(), 'Alimentación');
    await user.type(screen.getByLabelText('Nota (opcional)'), 'Mercado');
    await user.click(save());

    expect(amount()).toHaveValue('');
    expect(screen.getByLabelText('Nota (opcional)')).toHaveValue('');
    expect(category()).toHaveValue('1');
    expect(screen.getByLabelText('Fecha')).toHaveValue('2026-10-23');
  });
});
