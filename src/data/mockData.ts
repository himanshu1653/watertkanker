import { User, WaterRequest, Bid, DeliveryRoute, Location } from './types';

export const mockUsers: User[] = [
  { id: 'c1', name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'customer', phone: '+91 98765 43210' },
  { id: 'c2', name: 'Priya Sharma', email: 'priya@example.com', role: 'customer', phone: '+91 98765 43211' },
  { id: 'c3', name: 'Amit Patel', email: 'amit@example.com', role: 'customer', phone: '+91 98765 43212' },
  { id: 'v1', name: 'AquaFlow Suppliers', email: 'aquaflow@example.com', role: 'vendor', phone: '+91 98765 43220' },
  { id: 'v2', name: 'BlueWave Tankers', email: 'bluewave@example.com', role: 'vendor', phone: '+91 98765 43221' },
  { id: 'v3', name: 'PureDrops Water', email: 'puredrops@example.com', role: 'vendor', phone: '+91 98765 43222' },
  { id: 'a1', name: 'Admin User', email: 'admin@aquabid.com', role: 'admin' },
];

export const CITY_CENTER: Location = { lat: 28.6139, lng: 77.2090, address: 'New Delhi, India' };

export const mockRequests: WaterRequest[] = [
  {
    id: 'r1', customerId: 'c1', customerName: 'Rajesh Kumar',
    location: { lat: 28.6280, lng: 77.2190, address: 'Connaught Place, Delhi' },
    quantity: 5000, requiredTime: '2 hours', status: 'bidding', createdAt: '2026-04-14T08:00:00Z',
  },
  {
    id: 'r2', customerId: 'c2', customerName: 'Priya Sharma',
    location: { lat: 28.6353, lng: 77.2250, address: 'Karol Bagh, Delhi' },
    quantity: 10000, requiredTime: '4 hours', status: 'bidding', createdAt: '2026-04-14T07:30:00Z',
  },
  {
    id: 'r3', customerId: 'c3', customerName: 'Amit Patel',
    location: { lat: 28.6100, lng: 77.2300, address: 'India Gate, Delhi' },
    quantity: 2000, requiredTime: '1 hour', status: 'accepted', createdAt: '2026-04-14T06:00:00Z', acceptedBidId: 'b5',
  },
  {
    id: 'r4', customerId: 'c1', customerName: 'Rajesh Kumar',
    location: { lat: 28.6508, lng: 77.2340, address: 'Chandni Chowk, Delhi' },
    quantity: 8000, requiredTime: '3 hours', status: 'in_delivery', createdAt: '2026-04-14T05:00:00Z', acceptedBidId: 'b7',
  },
  {
    id: 'r5', customerId: 'c2', customerName: 'Priya Sharma',
    location: { lat: 28.5921, lng: 77.2195, address: 'Lodhi Garden, Delhi' },
    quantity: 3000, requiredTime: '2 hours', status: 'open', createdAt: '2026-04-14T09:00:00Z',
  },
];

export const mockBids: Bid[] = [
  { id: 'b1', requestId: 'r1', vendorId: 'v1', vendorName: 'AquaFlow Suppliers', price: 1200, eta: 45, status: 'pending', createdAt: '2026-04-14T08:10:00Z' },
  { id: 'b2', requestId: 'r1', vendorId: 'v2', vendorName: 'BlueWave Tankers', price: 1050, eta: 60, status: 'pending', isRecommended: true, createdAt: '2026-04-14T08:15:00Z' },
  { id: 'b3', requestId: 'r1', vendorId: 'v3', vendorName: 'PureDrops Water', price: 1350, eta: 30, status: 'pending', createdAt: '2026-04-14T08:20:00Z' },
  { id: 'b4', requestId: 'r2', vendorId: 'v1', vendorName: 'AquaFlow Suppliers', price: 2200, eta: 90, status: 'pending', createdAt: '2026-04-14T07:45:00Z' },
  { id: 'b5', requestId: 'r3', vendorId: 'v2', vendorName: 'BlueWave Tankers', price: 600, eta: 30, status: 'accepted', createdAt: '2026-04-14T06:15:00Z' },
  { id: 'b6', requestId: 'r2', vendorId: 'v3', vendorName: 'PureDrops Water', price: 1950, eta: 75, status: 'pending', isRecommended: true, createdAt: '2026-04-14T07:50:00Z' },
  { id: 'b7', requestId: 'r4', vendorId: 'v1', vendorName: 'AquaFlow Suppliers', price: 1800, eta: 60, status: 'accepted', createdAt: '2026-04-14T05:15:00Z' },
];

export const mockRoutes: DeliveryRoute[] = [
  {
    id: 'dr1', vendorId: 'v1', driverName: 'Suresh (Driver)',
    stops: [
      { requestId: 'r4', location: { lat: 28.6508, lng: 77.2340, address: 'Chandni Chowk' }, quantity: 8000, status: 'delivering' },
      { requestId: 'r3', location: { lat: 28.6100, lng: 77.2300, address: 'India Gate' }, quantity: 2000, status: 'pending' },
    ],
    currentPosition: { lat: 28.6350, lng: 77.2280, address: 'En Route' },
    progress: 45,
  },
];
