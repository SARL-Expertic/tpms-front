import React from 'react';
import { Ticket } from '../types/ticket';

const TicketList = ({ tickets }: { tickets: Ticket[] }) => (
  <ul>
    {tickets.map(ticket => (
      <li key={ticket.id}>{ticket.title}</li>
    ))}
  </ul>
);

export default TicketList;
