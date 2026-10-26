import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TransactionForm from '../../src/transactions/TransactionForm.jsx';
import TransactionList from '../../src/transactions/TransactionList.jsx';

const categories = [
  { id: 1, name: 'Alimentación', type: 'expense', isDefault: true },
  { id: 2, name: 'Transporte', type: 'expense', isDefault: true },
  { id: 8, name: 'Salario', type: 'income', isDefault: true },
  { id: 9, name: 'Ventas', type: 'income', isDefault: true },
  { id: 10, name: 'Regalos', type: 'income', isDefault: true },
  { id: 11, name: 'Otros', type: 'income', isDefault: true },
];

function renderForm(onSubmit = vi.fn(async () => {})) {
  const user = userEvent.setup();
  render(<TransactionForm categories={categories} today="2026-10-23" onSubmit={onSubmit} />);
  return { user, onSubmit };
}

const optionNames = () => within(screen.getByLabelText('Categoría'))
  .getAllByRole('option').map((o) => o.textContent);

describe('TransactionForm · income (RDF-7)', () => {
  // Given the form, When I change the type from "Gasto" to "Ingreso",
  // Then only income categories are offered.
  it('offers only expense categories by default and only income ones after switching', async () => {
    const { user } = renderForm();

    expect(optionNames()).toEqual(['Selecciona una categoría', 'Alimentación', 'Transporte']);

    await user.selectOptions(screen.getByLabelText('Tipo'), 'Ingreso');

    expect(optionNames()).toEqual(['Selecciona una categoría', 'Salario', 'Ventas', 'Regalos', 'Otros']);
  });

  it('clears the chosen category when the type changes', async () => {
    const { user } = renderForm();

    await user.selectOptions(screen.getByLabelText('Categoría'), 'Alimentación');
    await user.selectOptions(screen.getByLabelText('Tipo'), 'Ingreso');

    expect(screen.getByLabelText('Categoría')).toHaveValue('');
  });

  it('renames the title and the button to match the type', async () => {
    const { user } = renderForm();

    await user.selectOptions(screen.getByLabelText('Tipo'), 'Ingreso');

    expect(screen.getByRole('heading', { name: 'Registrar ingreso' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar ingreso' })).toBeInTheDocument();
  });

  it('submits the income in cents with type income', async () => {
    const { user, onSubmit } = renderForm();

    await user.selectOptions(screen.getByLabelText('Tipo'), 'Ingreso');
    await user.type(screen.getByLabelText('Monto'), '2.000.000');
    await user.selectOptions(screen.getByLabelText('Categoría'), 'Salario');
    await user.click(screen.getByRole('button', { name: 'Guardar ingreso' }));

    expect(onSubmit).toHaveBeenCalledWith({
      type: 'income', amountCents: 200000000, date: '2026-10-23', categoryId: 8, note: null,
    });
  });

  it('still requires a category after switching type', async () => {
    const { user, onSubmit } = renderForm();

    await user.selectOptions(screen.getByLabelText('Tipo'), 'Ingreso');
    await user.type(screen.getByLabelText('Monto'), '2.000.000');
    await user.click(screen.getByRole('button', { name: 'Guardar ingreso' }));

    expect(screen.getByText('La categoría es obligatoria')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('TransactionList · income (RDF-7)', () => {
  const base = { date: '2026-10-23', note: null, createdAt: '2026-10-23T15:00:00.000Z' };
  const salary = {
    ...base, id: 1, type: 'income', amountCents: 200000000, categoryId: 8, category: categories[2],
  };
  const food = {
    ...base, id: 2, type: 'expense', amountCents: 2500000, categoryId: 1, category: categories[0],
  };

  // Given an income in the list, Then it is shown with "+" and the income colour.
  it('shows incomes with + and expenses with −, each with its own style', () => {
    render(<TransactionList transactions={[salary, food]} today="2026-10-23" />);

    const incomeCell = within(screen.getByRole('row', { name: /Salario/ })).getByText(/2\.000\.000/);
    const expenseCell = within(screen.getByRole('row', { name: /Alimentación/ })).getByText(/25\.000/);

    expect(incomeCell.textContent.startsWith('+')).toBe(true);
    expect(incomeCell).toHaveClass('amount--income');
    expect(expenseCell.textContent.startsWith('−')).toBe(true);
    expect(expenseCell).toHaveClass('amount--expense');
  });
});
