import { Form } from 'react-bootstrap';
import type { Member } from '../types';

interface DemoUserSelectorProps {
  members: Member[];
  selectedMember: Member | null;
  onSelect: (member: Member) => void;
}

export function DemoUserSelector({
  members,
  selectedMember,
  onSelect,
}: DemoUserSelectorProps) {
  return (
    <Form.Group controlId="demo-user-select">
      <Form.Label className="fw-semibold">Demo User</Form.Label>
      <Form.Select
        value={selectedMember?.id ?? ''}
        onChange={(e) => {
          const member = members.find((m) => m.id === Number(e.target.value));
          if (member) onSelect(member);
        }}
      >
        <option value="" disabled>
          Select a member or admin
        </option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name} ({member.role})
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
}
