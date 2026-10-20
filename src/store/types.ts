export type Rating = 'regular' | 'sometimesLate' | 'oftenLate' | 'new';

export type VisitOutcome = 'notAvailable' | 'willPay' | 'escalate' | 'other';

export type EarlierVisitOutcome = 'collected' | 'promised' | 'notAvailable' | 'escalated';

export type PaymentMethod = 'cash' | 'upi';

export interface EarlierVisit {
  id: string;
  date: string;
  agent: string;
  outcome: EarlierVisitOutcome;
  amount?: number;
  note: string;
  voice?: string;
  voiceSeconds?: number;
}

export interface Customer {
  id: string;
  name: string;
  business: string;
  loanType: string;
  loanId: string;
  area: string;
  phone: string;
  dueAmount: number;
  dueDate: string;
  overdueDays: number;
  outstanding: number;
  lastPayment: { amount: number; date: string } | null;
  rating: Rating;
  scheduledToday: boolean;
  routeOrder: number;
  distanceKm: number;
  map: { x: number; y: number };
  coords: { lat: number; lng: number };
  assignedOn: string;
  tip: string;
  earlierVisits: EarlierVisit[];
}

export interface PhotoProof {
  /** A real photo taken with the camera. */
  uri?: string;
  /** An illustrated placeholder for mock data. */
  mock?: 'shopfront';
  label?: string;
}

interface ActivityBase {
  id: string;
  customerId: string;
  at: string;
  note: string;
  /** Recorded during this app session (highlighted in My work). */
  recordedInApp?: boolean;
}

export interface CollectionActivity extends ActivityBase {
  kind: 'collection';
  amount: number;
  method: PaymentMethod;
  reference: string;
}

export interface VisitActivity extends ActivityBase {
  kind: 'visit';
  outcome: VisitOutcome;
  amount?: number;
  followUp?: string;
  photo?: PhotoProof;
  /** Bundled mock voice note id, or a file uri from a real recording. */
  voice?: string;
  voiceSeconds?: number;
}

export type Activity = CollectionActivity | VisitActivity;

export type MessageStatus = 'sending' | 'sent' | 'failed';

export interface ChatMessage {
  id: string;
  type: 'message';
  author: { name: string; role: string };
  mine: boolean;
  text: string;
  at: string;
  status?: MessageStatus;
}

export interface ChatEvent {
  id: string;
  type: 'event';
  text: string;
  detail: string;
  at: string;
}

export type ChatItem = ChatMessage | ChatEvent;

export interface Conversation {
  unread: number;
  items: ChatItem[];
}
