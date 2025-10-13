import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LinkC from '../LinkC';

// Helper function to render component with Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('LinkC Component', () => {
  it('renders a navigation link with children', () => {
    renderWithRouter(<LinkC to="/home">Test Link</LinkC>);
    
    const link = screen.getByRole('link', { name: /test link/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/home');
  });

  it('renders with custom children content', () => {
    renderWithRouter(
      <LinkC to="/interviews">
        <span>Custom Content</span>
      </LinkC>
    );
    
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('has correct href attribute', () => {
    renderWithRouter(<LinkC to="/custom-path">Custom Path</LinkC>);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/custom-path');
  });
});
