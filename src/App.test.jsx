import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as XLSX from 'xlsx';
import App from './App';
import { STORAGE_KEY, SETTINGS_KEY } from './lib/storage';

const EN = { value: 'en_US', label: 'English (US)' };

const participant = (overrides = {}) => ({
  id: `p-${overrides.lastName ?? 'x'}`,
  firstName: 'Marie',
  lastName: 'Dupont',
  email: 'marie@example.com',
  checkedIn: false,
  checkedInAt: null,
  absent: false,
  manuallyAdded: false,
  ...overrides,
});

const seed = (participants, settings = {}) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ language: EN, ...settings }));
  if (participants) localStorage.setItem(STORAGE_KEY, JSON.stringify(participants));
};

const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');

const excelFile = (rows, name = 'Gala.xlsx') => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Sheet1');
  const data = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  return new File([data], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};

const fileInput = (container) => container.querySelector('input[type="file"]');

// Cloudscape keeps every modal in the DOM (including the changelog, whose text mentions
// sample names), so dialogs and table content are located by their own content
const dialogWith = (text) => {
  const dialog = screen.getAllByRole('dialog').find((d) => d.textContent.includes(text));
  if (!dialog) throw new Error(`No dialog containing "${text}"`);
  return dialog;
};
const tableBody = () => document.querySelector('table tbody');

describe('App', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('shows the empty state', () => {
    seed(null);
    render(<App />);
    expect(screen.getByText('No participants')).toBeInTheDocument();
  });

  it('restores participants from storage and checks one in', async () => {
    seed([participant({ lastName: 'Dupont' })]);
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Check In' }));

    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
    expect(stored()[0].checkedIn).toBe(true);
    expect(stored()[0].checkedInAt).not.toBeNull();
  });

  it('asks for confirmation before checking out', async () => {
    seed([participant({ checkedIn: true, checkedInAt: '2026-01-01T09:00:00.000Z' })]);
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Done' }));
    const dialog = dialogWith('Mark Marie Dupont');
    expect(dialog).toHaveTextContent('Mark Marie Dupont as not checked in?');

    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));

    expect(screen.getByRole('button', { name: 'Check In' })).toBeInTheDocument();
    expect(stored()[0]).toMatchObject({ checkedIn: false, checkedInAt: null });
  });

  it('ignores clicks on the name of an absent participant', async () => {
    seed([participant({ absent: true })]);
    render(<App />);

    await user.click(within(tableBody()).getByText('Dupont'));

    expect(stored()[0].checkedIn).toBe(false);
    expect(document.body.textContent).not.toContain('Mark Marie Dupont');
  });

  it('imports an Excel file and reports ignored rows', async () => {
    seed(null);
    const { container } = render(<App />);

    await user.upload(
      fileInput(container),
      excelFile([
        { Prénom: 'JEAN-PIERRE', Nom: 'MARTIN', Email: 'jp@example.com' },
        { Prénom: 'léa', Nom: 'durand' },
        { Email: 'orphan@example.com' },
      ])
    );

    expect(await screen.findByText('2 participants imported.')).toBeInTheDocument();
    expect(screen.getByText('1 rows without first or last name were ignored.')).toBeInTheDocument();
    expect(within(tableBody()).getByText('Jean-Pierre')).toBeInTheDocument();
    expect(stored()).toHaveLength(2);
    // Event name is taken from the file name
    expect(JSON.parse(localStorage.getItem(SETTINGS_KEY)).eventName).toBe('Gala');
  });

  it('warns about possible duplicates on import', async () => {
    seed(null);
    const { container } = render(<App />);

    await user.upload(
      fileInput(container),
      excelFile([
        { Prénom: 'Marie', Nom: 'Dupont', Email: 'marie@example.com' },
        { Prénom: 'MARIE', Nom: 'DUPONT' },
        { Prénom: 'Jean', Nom: 'Martin' },
      ])
    );

    expect(
      await screen.findByText('1 possible duplicates (same name or email): Marie Dupont')
    ).toBeInTheDocument();
    // Duplicates are reported, not removed
    expect(stored()).toHaveLength(3);
  });

  it('resets check-ins only, keeping participants', async () => {
    seed([participant({ checkedIn: true, checkedInAt: '2026-01-01T09:00:00.000Z', absent: true })]);
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await user.click(
      within(dialogWith('What do you want to reset?')).getByRole('button', {
        name: 'Check-ins only',
      })
    );

    expect(stored()).toHaveLength(1);
    expect(stored()[0]).toMatchObject({ checkedIn: false, checkedInAt: null, absent: false });
  });

  it('does nothing when a confirmation is cancelled', async () => {
    seed([participant({ checkedIn: true, checkedInAt: '2026-01-01T09:00:00.000Z' })]);
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Done' }));
    await user.click(
      within(dialogWith('Mark Marie Dupont')).getByRole('button', { name: 'Cancel' })
    );

    expect(stored()[0].checkedIn).toBe(true);
  });

  it('keeps the current list when the file has no recognized columns', async () => {
    seed([participant()]);
    const { container } = render(<App />);

    await user.upload(fileInput(container), excelFile([{ Name: 'Someone' }]));
    await user.click(
      within(dialogWith('will be replaced')).getByRole('button', { name: 'Confirm' })
    );

    expect(await screen.findByText(/No participants found/)).toBeInTheDocument();
    expect(stored()).toHaveLength(1);
    expect(within(tableBody()).getByText('Dupont')).toBeInTheDocument();
  });

  it('adds a participant manually, checked in by default', async () => {
    seed(null);
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Add Participant' }));
    const dialog = dialogWith('Add Participant Manually');
    await user.type(within(dialog).getByPlaceholderText(/first name/i), 'anne-sophie');
    await user.type(within(dialog).getByPlaceholderText(/last name/i), 'LEROY');
    await user.click(within(dialog).getByRole('button', { name: 'Add' }));

    await waitFor(() => expect(stored()).toHaveLength(1));
    expect(stored()[0]).toMatchObject({
      firstName: 'Anne-Sophie',
      lastName: 'Leroy',
      checkedIn: true,
      manuallyAdded: true,
    });
  });

  it('restores the stored status filter', () => {
    seed(
      [
        participant({
          lastName: 'Dupont',
          checkedIn: true,
          checkedInAt: '2026-01-01T09:00:00.000Z',
        }),
        participant({ lastName: 'Martin' }),
      ],
      { statusFilter: { value: 'checkedIn', label: 'Checked In Only' } }
    );
    render(<App />);

    expect(within(tableBody()).getByText('Dupont')).toBeInTheDocument();
    expect(within(tableBody()).queryByText('Martin')).not.toBeInTheDocument();
  });

  it('clears the stored list on full reset', async () => {
    seed([participant()]);
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await user.click(
      within(dialogWith('What do you want to reset?')).getByRole('button', { name: 'Full reset' })
    );

    expect(screen.getByText('No participants')).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
