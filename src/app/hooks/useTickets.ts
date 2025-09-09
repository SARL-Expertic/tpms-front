"use client"

import { useState, useEffect } from 'react';
import { fetchTickets } from '../api/tickets';
import { Ticket } from '../../types/ticket';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets()
      .then(res => setTickets(res.data))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  return { tickets, loading };
};
