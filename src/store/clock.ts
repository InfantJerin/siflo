import agentData from '@/mocks/agent.json';

// The mock data lives on 08 Sep 2026. The demo clock starts there and ticks in real time,
// so anything recorded in the app lands on the same "today" as the mock data.
const demoStart = new Date(agentData.demoClock.start).getTime();
const launchedAt = Date.now();

export function demoNow(): Date {
  return new Date(demoStart + (Date.now() - launchedAt));
}

/** Local ISO string without timezone, matching the mock JSON format. */
export function toLocalIso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
