

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MultiSelect } from '../../frontend/components/ui/MultiSelect';

const options = [
  { value: 'HC1', label: 'HC1' },
  { value: 'HC2', label: 'HC2' },
];

describe('MultiSelect', () => {
  it('renders the placeholder', async () => {
    render(<MultiSelect options={options} selected={[]} onChange={() => {}} placeholder="Select outcomes" />);
    expect(screen.getByText(/Select outcomes/i)).toBeInTheDocument();
  });

  it('shows options when clicked', async () => {
    render(<MultiSelect options={options} selected={[]} onChange={() => {}} placeholder="Choose HCs" />);
    await userEvent.click(screen.getByText(/Choose HCs/i));
    expect(screen.getByText('HC1')).toBeInTheDocument();
    expect(screen.getByText('HC2')).toBeInTheDocument();
  });

  it('triggers onChange when option is selected', async () => {
    const handleChange = jest.fn();
    render(<MultiSelect options={options} selected={[]} onChange={handleChange} placeholder="Pick one" />);
    await userEvent.click(screen.getByText(/Pick one/i));
    await userEvent.click(screen.getByText('HC1'));
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0]).toContain('HC1');
  });
});