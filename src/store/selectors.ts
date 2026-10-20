import { useMemo } from 'react';

import performance from '@/mocks/performance.json';
import { sameDay } from '@/utils/format';
import { useApp } from './app';
import { demoNow } from './clock';
import type { Activity, Customer } from './types';

export type WorkCategory = 'received' | 'pending' | 'issue';

export interface WorkItem {
  customer: Customer;
  category: WorkCategory;
  activity?: Activity;
}

export function useCustomer(id: string | undefined): Customer | undefined {
  return useApp((s) => s.customers.find((c) => c.id === id));
}

/** Everything the Today, My work and Route screens need, derived from one source. */
export function useToday() {
  const customers = useApp((s) => s.customers);
  const activities = useApp((s) => s.activities);

  return useMemo(() => {
    const now = demoNow();
    const todays = activities.filter((a) => sameDay(new Date(a.at), now));
    const latestByCustomer = new Map<string, Activity>();
    for (const a of todays) {
      const prev = latestByCustomer.get(a.customerId);
      if (!prev || prev.at < a.at) latestByCustomer.set(a.customerId, a);
    }

    const scheduled = customers.filter((c) => c.scheduledToday).sort((a, b) => a.routeOrder - b.routeOrder);
    const items: WorkItem[] = scheduled.map((customer) => {
      const activity = latestByCustomer.get(customer.id);
      const category: WorkCategory = !activity ? 'pending' : activity.kind === 'collection' ? 'received' : 'issue';
      return { customer, activity, category };
    });

    const pending = items.filter((i) => i.category === 'pending');
    const completed = items
      .filter((i) => i.category !== 'pending')
      .sort((a, b) => (b.activity!.at > a.activity!.at ? 1 : -1));

    const collected = todays
      .filter((a) => a.kind === 'collection')
      .reduce((sum, a) => sum + (a.kind === 'collection' ? a.amount : 0), 0);
    const target = scheduled.reduce((sum, c) => sum + c.dueAmount, 0);

    return {
      date: now,
      items,
      pending,
      completed,
      received: items.filter((i) => i.category === 'received'),
      issues: items.filter((i) => i.category === 'issue'),
      next: pending[0],
      collected,
      target,
      visitsDone: completed.length,
      visitsTotal: scheduled.length,
    };
  }, [customers, activities]);
}

export interface HistoryGroup {
  key: string;
  date: Date;
  entries: { activity: Activity; customer: Customer }[];
}

export function useHistory(filter: 'all' | 'collections' | 'visits'): HistoryGroup[] {
  const customers = useApp((s) => s.customers);
  const activities = useApp((s) => s.activities);

  return useMemo(() => {
    const byId = new Map(customers.map((c) => [c.id, c]));
    const sorted = activities
      .filter((a) => filter === 'all' || (filter === 'collections' ? a.kind === 'collection' : a.kind === 'visit'))
      .sort((a, b) => (b.at > a.at ? 1 : -1));

    const groups: HistoryGroup[] = [];
    for (const activity of sorted) {
      const key = activity.at.slice(0, 10);
      let group = groups.find((g) => g.key === key);
      if (!group) {
        group = { key, date: new Date(`${key}T00:00:00`), entries: [] };
        groups.push(group);
      }
      const customer = byId.get(activity.customerId);
      if (customer) group.entries.push({ activity, customer });
    }
    return groups;
  }, [customers, activities, filter]);
}

export function useMonthPerformance() {
  const { collected } = useToday();
  const month = performance.currentMonth;
  const monthCollected = month.collectedBeforeToday + collected;
  return {
    ...month,
    collected: monthCollected,
    percent: Math.min(100, Math.round((monthCollected / month.target) * 100)),
  };
}
