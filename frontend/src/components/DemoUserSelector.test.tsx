import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DemoUserSelector } from './DemoUserSelector';
import type { Member } from '../types';

const members: Member[] = [
  { id: 1, name: 'Alex Rivera', email: 'alex@demo.test', role: 'member' },
  { id: 2, name: 'Morgan Lee', email: 'morgan@demo.test', role: 'admin' },
];

describe('DemoUserSelector', () => {
  it('renders an option for each member with role', () => {
    render(
      <DemoUserSelector members={members} selectedMember={null} onSelect={vi.fn()} />,
    );

    expect(screen.getByText('Alex Rivera (member)')).toBeInTheDocument();
    expect(screen.getByText('Morgan Lee (admin)')).toBeInTheDocument();
  });

  it('calls onSelect with the chosen member', () => {
    const onSelect = vi.fn();
    render(
      <DemoUserSelector
        members={members}
        selectedMember={members[0]}
        onSelect={onSelect}
      />,
    );

    fireEvent.change(screen.getByLabelText('Demo User'), { target: { value: '2' } });
    expect(onSelect).toHaveBeenCalledWith(members[1]);
  });

  it('does not call onSelect for an unknown value', () => {
    const onSelect = vi.fn();
    render(
      <DemoUserSelector
        members={members}
        selectedMember={members[0]}
        onSelect={onSelect}
      />,
    );

    fireEvent.change(screen.getByLabelText('Demo User'), { target: { value: '999' } });
    expect(onSelect).not.toHaveBeenCalled();
  });
});
