import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import  FeedbackTable  from '../../frontend/components/table/FeedbackTable';

const mockData = [
  {
    score: 4.5,
    comment: 'Excellent work on this assignment!',
    outcome_name: 'Critical Thinking',
    assignment_title: 'Essay 1',
    assignment_id: 1,
    assignment_link: 'http://example.com/assignment',
    course_title: 'Philosophy',
    course_code: 'PHIL101',
    term_title: 'Fall 2024',
    created_on: '2024-10-01T12:00:00Z',
    weight: '2x',
    weight_numeric: 2.0,
  }
];

describe('FeedbackTable', () => {
  it('renders feedback rows', () => {
    render(<FeedbackTable data={mockData} onAssignmentClick={() => {}} />);
    expect(screen.getByText('Critical Thinking')).toBeInTheDocument();
    expect(screen.getByText('Essay 1')).toBeInTheDocument();
    expect(screen.getByText('PHIL101')).toBeInTheDocument();
    expect(screen.getByText('2x')).toBeInTheDocument();
    expect(screen.getByText('Excellent work on this assignment!')).toBeInTheDocument();
  });

  it('displays the score', () => {
    render(<FeedbackTable data={mockData} onAssignmentClick={() => {}} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });
});
