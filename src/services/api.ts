const API_URL = 'http://localhost:3001';

export const api = {
  // Solicitudes
  getRequests: async () => {
    const res = await fetch(`${API_URL}/requests`);
    return res.json();
  },
  createRequest: async (data: any) => {
    const res = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateRequest: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteRequest: async (id: string) => {
    await fetch(`${API_URL}/requests/${id}`, { method: 'DELETE' });
  },

  // Usuarios
  getUsers: async () => {
    const res = await fetch(`${API_URL}/users`);
    return res.json();
  },
  createUser: async (data: any) => {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Donaciones
  getDonations: async () => {
    const res = await fetch(`${API_URL}/donations`);
    return res.json();
  },
  createDonation: async (data: any) => {
    const res = await fetch(`${API_URL}/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};