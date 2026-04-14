export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface WaterRequest {
  id: string;
  customerId: string;
  customerName: string;
  location: Location;
  quantity: number; // liters
  requiredTime: string;
  status: 'open' | 'bidding' | 'accepted' | 'in_delivery' | 'delivered';
  createdAt: string;
  acceptedBidId?: string;
}

export interface Bid {
  id: string;
  requestId: string;
  vendorId: string;
  vendorName: string;
  price: number;
  eta: number; // minutes
  status: 'pending' | 'accepted' | 'rejected';
  isRecommended?: boolean;
  createdAt: string;
}

export interface DeliveryRoute {
  id: string;
  vendorId: string;
  driverName: string;
  stops: {
    requestId: string;
    location: Location;
    quantity: number;
    status: 'pending' | 'delivering' | 'delivered';
  }[];
  currentPosition: Location;
  progress: number; // 0-100
}
