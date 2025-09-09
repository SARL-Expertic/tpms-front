import React, { useState } from 'react';

const TicketForm = ({ onSubmit }: { onSubmit: (data: { title: string; description: string }) => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ title, description }); }}>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" required />
      <button type="submit">Create Ticket</button>
    </form>
  );
};

export default TicketForm;
