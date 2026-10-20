# Siflo — Collections field app (Expo)

A cross-platform (Android + iOS) Expo app built from the **CollectEngine / siflo** Figma page.
All data is mock JSON; nothing talks to a backend.

## Run it

Everything — Node modules, JDK, Android SDK, emulator, virtual device and caches — installs into
this folder (`.tooling/`, ~4.5 GB). Delete the folder and it's all gone. Only Node 20+ is needed on
your Mac.

```bash
npm run setup     # one time: npm install + Android SDK/emulator into ./.tooling (Apple Silicon)
npm run android   # boots the "siflo-pixel" emulator (412dp wide, like the Figma) and opens the app
npm run stop      # shuts the emulator down
```

### Share it with someone

```bash
npm run share     # prints a QR code; scan it with the free Expo Go app (Android/iOS)
```

They only need Expo Go on their phone. A real phone is also the best way to try the camera and
voice notes — the emulator's camera shows a fake scene.

## Demo tips

| To see… | Do this |
| --- | --- |
| Collection journey (A1 → A2 → A3 → A4 → A1b) | Today → View customer → Record Collection → Save → Back to today |
| Issue journey + discard sheet | Customer → Record Issue → pick an outcome → press back |
| Chat "Not sent · Tap to retry" | Send any message containing the word **fail**, then tap it |
| Manager reply | Send any other message; Suresh replies ~3 s later |
| Referral OTP | Enter a 10-digit mobile → Send OTP → **1234** |
| Reset all data | Reload the app (shake → Reload, or `r` in the terminal) |

The app runs on a **demo clock** that starts at *Tue 08 Sep 2026, 10:40 AM* (the date in the
designs) and ticks in real time, so new records land on the same "today" as the mock data.

## Real vs mocked

| Feature | Behaviour |
| --- | --- |
| Call | Real — opens the phone dialer with the customer's number |
| Directions / Navigate | Real — opens Google Maps (app or browser) with directions |
| Take photo | Real camera (`expo-camera`) |
| Hold to record / Play voice note | Real recording & playback (`expo-audio`); seeded notes are TTS clips |
| Location (±12 m, "Location captured") | Mocked — no GPS access |
| OTP verification | Mocked — code is `1234` (`src/mocks/agent.json`) |
| Conversation | Mocked in-app chat with canned manager replies |
| Route map | Illustrated map (Figma: "Google Maps at implementation") |
| State | In memory only; resets on reload |

## Language

All copy lives in `src/i18n/en.json`. Profile → **Language** opens a picker (English ✓, Tamil and
Hindi marked *Coming soon*). To add a language, drop in `ta.json` and register it in
`src/i18n/index.ts`.

## Not designed yet (not built)

1. Login / onboarding / agent sign-in
2. Settings (row shows "This screen isn't designed yet")
3. New Referral: *Additional details* contents and the post-submit confirmation
4. UPI collection flow (QR / payment confirmation)
5. Payment receipt view/share
6. Record issue extras: promise amount & date for **Will pay** (currently assumes the amount due),
   reason for **Escalate**, description for **Others**
7. Issue-saved confirmation screen (a toast is shown instead)
8. Empty / offline / error / sync-failure states
9. Notifications ("Accountant notified", new manager messages)
10. Language picker visuals (built from existing sheet styles — please review)

Also intentionally not built: the in-app *Office call* and *Navigation* screens (Call/Navigate hand
off to the dialer and Google Maps instead), and the Figma *Prototype router* / *Demo* frames.

## Figma data that was corrected

- Agent is **Arun Prakash** everywhere (Figma mixed "Arun" and "K. Selvam").
- 10 scheduled customers: 2 received + 3 issues = 5 completed, 5 pending; totals are computed
  (₹17,000 of ₹50,200), not hard-coded.
- R. Karthik has his own loan, dues, outstanding balance and history (Figma reused Meena's).
- Issues tab shows each visit's real outcome (promise / not available / escalated), not only promises.
- Visit-history counts match the listed visits; Meena's assignment date matches the reassignment
  shown in the conversation.

## Project layout

```
src/app/            Expo Router screens (tabs, customer/[id]/…, route, history, referral…)
src/components/     UI kit (ui/) + domain components (map, activity sheet, voice player…)
src/mocks/          Mock JSON data + bundled voice notes
src/store/          Zustand store, derived selectors, demo clock
src/theme/tokens.ts Design tokens from the Figma variables
src/i18n/           Translations
scripts/            Self-contained Android tooling scripts
```

Checks: `npm run typecheck`, `npm run lint`, `npx expo-doctor`.
