import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Define the payload type
type ForwardTicketPayload = {
  query: string;
  service_impact: string;
  root_cause: string;
  network_impact: string;
  recomended_action: string;
  onu_index: string;
  sn_modem: string;
  priority: string;
  person_in_charge: string;
  noc_username: string;
  noc_password: string;
};

export const useForwardTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, data }: { ticketId: string, data: ForwardTicketPayload }) => {
      const response = await axios.post(`/api/v1/tickets/${ticketId}/forward`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};