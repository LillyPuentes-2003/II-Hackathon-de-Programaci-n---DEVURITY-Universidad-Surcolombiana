export type HelpType = 'alimentos' | 'salud' | 'transporte' | 'refugio' | 'otros';
export type UrgencyLevel = 'alta' | 'media' | 'baja';
export type RequestStatus = 'pendiente' | 'en-revision' | 'asignada' | 'en-camino' | 'entregada';
export type UserRole = 'solicitante' | 'donante' | 'voluntario';
export type Availability = 'inmediata' | 'hoy' | 'esta-semana';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
}

export interface HelpRequest {
  id: string;
  userId: string;
  userName: string;
  type: HelpType;
  description: string;
  location: string;
  lat: number;
  lng: number;
  urgency: UrgencyLevel;
  peopleAffected: number;
  status: RequestStatus;
  timestamp: number;
  assignedTo?: string;
  assignedName?: string;
  imageUrl?: string;
}

export interface HelpOffer {
  id: string;
  userId: string;
  userName: string;
  type: HelpType;
  quantity: string;
  location: string;
  lat: number;
  lng: number;
  availability: Availability;
  contact: string;
}

export type View = 
  | 'splash' 
  | 'landing' 
  | 'register' 
  | 'need-help-form' 
  | 'request-confirmation' 
  | 'request-status' 
  | 'want-help-form' 
  | 'nearby-requests' 
  | 'request-detail' 
  | 'assignment-confirmation' 
  | 'live-map' 
  | 'admin-panel';