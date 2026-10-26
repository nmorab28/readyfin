import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PeriodFilter from '../../src/transactions/PeriodFilter.jsx';

function renderFilter(props = {}) {
  const onChange = vi.fn();
  render(<PeriodFilter month="2026-10" type="" onChange={onChange} {...props} />);
  return { onChange };
}

describe('PeriodFilter (RDF-9)', () => {
  it('shows the selected month and type', () => {
    renderFilter({ month: '2026-09', type: 'expense' });

    expect(screen.getByLabelText('Mes')).toHaveValue('2026-09');
    expect(screen.getByLabelText('Filtrar por tipo')).toHaveValue('expense');
  });

  it('offers all, expenses and incomes', () => {
    renderFilter();

    const options = Array.from(screen.getByLabelText('Filtrar por tipo').options).map((o) => o.textContent);
    expect(options).toEqual(['Todos', 'Gastos', 'Ingresos']);
  });

  it('reports the new month and keeps the type', () => {
    const { onChange } = renderFilter({ type: 'income' });

    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '2026-09' } });

    expect(onChange).toHaveBeenCalledWith({ month: '2026-09', type: 'income' });
  });

  it('reports the new type and keeps the month', async () => {
    const { onChange } = renderFilter();

    await userEvent.setup().selectOptions(screen.getByLabelText('Filtrar por tipo'), 'Gastos');

    expect(onChange).toHaveBeenCalledWith({ month: '2026-10', type: 'expense' });
  });

  it('ignores a cleared or incomplete month instead of querying with it', () => {
    const { onChange } = renderFilter();

    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '' } });

    expect(onChange).not.toHaveBeenCalled();
  });
});
