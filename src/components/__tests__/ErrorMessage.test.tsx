import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  const defaultProps = {
    message: 'Test error message',
  };

  it('renders with default title', () => {
    render(<ErrorMessage {...defaultProps} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<ErrorMessage {...defaultProps} title="Custom Error" />);
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });

  it('renders with action button', () => {
    const handleAction = jest.fn();
    render(
      <ErrorMessage
        {...defaultProps}
        action={{ label: 'Retry', onClick: handleAction }}
      />
    );
    const button = screen.getByText('Retry');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('renders with secondary action button', () => {
    const handleSecondaryAction = jest.fn();
    render(
      <ErrorMessage
        {...defaultProps}
        secondaryAction={{ label: 'Go Home', onClick: handleSecondaryAction }}
      />
    );
    const button = screen.getByText('Go Home');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it('renders with error details when showDetails is true', () => {
    const details = 'Error stack trace or details';
    render(
      <ErrorMessage
        {...defaultProps}
        showDetails={true}
        details={details}
      />
    );
    expect(screen.getByText(details)).toBeInTheDocument();
  });

  it('does not render error details when showDetails is false', () => {
    const details = 'Error stack trace or details';
    render(
      <ErrorMessage
        {...defaultProps}
        showDetails={false}
        details={details}
      />
    );
    expect(screen.queryByText(details)).not.toBeInTheDocument();
  });
}); 