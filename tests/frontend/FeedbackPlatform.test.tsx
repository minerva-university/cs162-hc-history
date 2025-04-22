import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FeedbackPlatform from '../../frontend/feedback-platform';

global.fetch = jest.fn().mockImplementation((url: string) => {
  if (url.includes('/api/feedback')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        {
          score: 4,
          comment: 'Great work!',
          outcome_name: 'Critical Thinking',
          assignment_title: 'Essay 1',
          assignment_id: 1,
          assignment_link: 'http://example.com',
          course_title: 'Philosophy',
          course_code: 'PHIL101',
          term_title: 'Fall 2024',
          created_on: '2024-09-01',
          weight: '2x'
        }
      ]),
    });
  } else if (url.includes('/api/ai-summaries')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    });
  }
  return Promise.reject(new Error('Unknown API'));
});

describe('FeedbackPlatform', () => {
  it('renders tabs and recent feedback', async () => {
    render(<FeedbackPlatform />);
    
    await waitFor(() => {
      expect(screen.getByText('By HC and LO')).toBeInTheDocument();
      expect(screen.getByText('Great work!')).toBeInTheDocument();
    });
  });
});