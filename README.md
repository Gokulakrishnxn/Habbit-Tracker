<div align="center">

<img src="docs/logo.svg" alt="Habit Tracker logo" width="96" height="96" />

# Habit Tracker

### Every habit. One place.

My personal habit tracker, built for myself and now free for everyone.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)

<br />

<img src="docs/screenshot-light.jpg" alt="Habit Tracker in light mode" width="300" />
&nbsp;&nbsp;&nbsp;
<img src="docs/screenshot-dark.jpg" alt="Habit Tracker in dark mode" width="300" />

</div>

<br />

## Meet Habit Tracker.

Skin care. Water. The gym. Work. Side projects. Reading.

The things that make a good day are scattered across notes, apps and memory. I wanted one place for all of them. One that is quick enough to use in a second, and beautiful enough that I actually want to open it.

So I built it.

Every habit gets its own colour, its own icon and its own heatmap. Tap a square and it fills in. Do that day after day and you can see the shape of your life on one screen.

No sign-up. No account. No noise.

<br />

## Simple on the surface.

**One tap.** Log a day by tapping its square. Tap again to undo.

**Every date, at a glance.** Each habit has a GitHub-style heatmap with every day numbered, and today wears a coloured border so you always know where you are. It fits as many months as your screen can hold: two on a phone, half a year on a desktop.

**Yours, completely.** Add any habit you like. Pick from 24 colours and 36 icons. Tick it off, count it (8 glasses of water), or split it by time of day. Choose the days it belongs to: every day, weekdays, weekends, or your own mix.

**Morning. Evening. Night.** Some habits happen more than once a day. Skin care in the morning and at night, for example. Split a habit into times of day and tap its square to tick each one off. The square fills in as you go, with a small dot for every time of day, and the day is complete when they are all done.

**Forgot to log? Fix it.** Any past day can be filled in later, from the heatmap or from the calendar.

**See how you did.** Open a habit's calendar to see exactly which days you completed and which you missed, with the dates listed.

**Streaks that are fair.** A streak only counts the days a habit is scheduled for, so a rest day never breaks it.

**Light and dark.** Follows your device by default, with a small sun and moon switch in the top bar when you want to choose.

**Made for every screen.** Designed for the phone first, with big tap targets and the notch and home bar respected. It scales up to tablet and desktop, and you can add it to your Home Screen like a native app.

**Private by design.** Everything lives in your browser. Nothing is sent anywhere.

<br />

## Everything in its place.

| Where | What you find there |
| --- | --- |
| **Home** | Today's progress and a heatmap for every habit |
| **Sidebar** | All your habits and how today is going. Tap one to jump to it |
| **Calendar** (tap a habit's name) | A full month, with completed and missed days |
| **Settings** | Edit or delete any habit |
| **Top bar** | Switch between light and dark |

<br />

## How to use.

1. **Add your habits.** Tap the **+** button. Give it a name, pick a colour and an icon, choose *done / not done*, a *count* (like 8 glasses) or *times of day* (like morning and night), and pick the days it belongs to. Six starter habits are already there: Skin care, Water intake, Gym, Work, Projects and Reading. Edit or delete any of them in Settings.
2. **Log a day.** Tap its square in the habit's heatmap. Tap again to undo. For a counted habit like water, each tap adds one until you reach your goal. For a habit split by time of day, a sheet opens so you can tick off morning, evening or night.
   Forgot yesterday? Tap that day's square and fill it in.
3. **Look back and fix a day.** Tap a habit's name to open its calendar. You can log any past day there, and see which days you completed and which you missed.
4. **Move through time.** Use the arrows next to *Activity* to go forward or back.
5. **Pick your look.** The sun and moon icon in the top bar switches between light and dark.

<br />

## Make it yours: fork and deploy.

Habit Tracker is free to copy. Run your own version on [Vercel](https://vercel.com) in a few minutes, and use it from anywhere.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FGokulakrishnxn%2FHabbit-Tracker)

Or do it step by step:

1. **Fork** this repository with the **Fork** button at the top of the GitHub page.
2. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
3. **Import** your fork. Vercel detects Next.js on its own. Leave the settings as they are. No environment variables are needed.
4. Click **Deploy**. In about a minute you get a live address like `your-project.vercel.app`.
5. *Optional:* add your own domain under **Project → Settings → Domains**.

From then on, every push to `main` deploys automatically.

Prefer the command line? Run `npx vercel` in the project folder and follow the prompts.

> **Good to know.** Your habits are saved in each person's own browser, not on a server. Everyone who opens your deployment gets their own private tracker.

<br />

## Add it to your Home Screen.

Open your deployed app in your phone's browser, then add it like any other app. It opens full screen, with its own icon and no browser bars.

| Device | Steps |
| --- | --- |
| **iPhone / iPad** (Safari) | Tap **Share**, then **Add to Home Screen**, then **Add** |
| **Android** (Chrome) | Tap the **⋮** menu, then **Add to Home screen** (or **Install app**) |
| **Desktop** (Chrome or Edge) | Click the **install** icon at the right of the address bar |

> **Tip for iPhone.** An app added to the Home Screen can keep its own storage, separate from Safari, so it may start empty the first time you open it.

<br />

## Run it locally.

You need [Node.js](https://nodejs.org) 20.9 or newer.

```bash
git clone https://github.com/Gokulakrishnxn/Habbit-Tracker.git
cd Habbit-Tracker
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Check the code |

<br />

## Under the hood.

| | |
| --- | --- |
| **Framework** | [Next.js](https://nextjs.org) (App Router) |
| **UI** | [React](https://react.dev) 19 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) 4, with light and dark themes built on CSS variables |
| **Language** | TypeScript |
| **Storage** | Your browser's `localStorage`, shared across open tabs |

```
src/
├── app/
│   ├── layout.tsx            Root layout, viewport and theme boot script
│   ├── page.tsx              Home: the habit tracker
│   ├── settings/page.tsx     Settings: manage and delete habits
│   ├── manifest.ts           Web app manifest (Add to Home Screen)
│   ├── icon.svg              App icon (light and dark)
│   ├── apple-icon.tsx        iPhone home-screen icon
│   └── pwa-icon/[size]/      Android and desktop install icons
├── components/
│   ├── HabitTracker.tsx      Header, month navigation and the list of habits
│   ├── HabitHeatmap.tsx      One habit's heatmap
│   ├── HabitCalendar.tsx     Month calendar with completed and missed days
│   ├── HabitForm.tsx         Add and edit a habit
│   ├── HabitIcon.tsx         The icon set
│   ├── SettingsHabits.tsx    Habit management for Settings
│   ├── SlotPicker.tsx        Tick off times of day for one date
│   ├── Sidebar.tsx           Top bar, menu, habit list and Settings link
│   └── ThemeToggle.tsx       Sun and moon switch
└── lib/
    ├── habits.ts             Types, defaults, colours, streak logic
    ├── logo.tsx              The logo mark used by the generated icons
    ├── store.ts              The shared localStorage store
    └── theme.ts              Theme helpers
```

<br />

## Your data.

Two keys live in your browser:

| Key | Holds |
| --- | --- |
| `habits:list:v1` | Your habits: name, colour, icon, goal and routine |
| `habits:v1` | What you logged, by habit and date (`YYYY-MM-DD`) |

Clear your browser's site data and your history goes with it. There is no sync between devices.

<br />

## What's next.

- Reminders for the habits you schedule
- Sync across your devices
- Weekly and monthly summaries

<br />

## Open source.

Habit Tracker is free and open source, released under the [MIT License](LICENSE). Use it, change it, share it.

Found a bug or have an idea? Open an issue. Want to help? Fork the repo, make your change on a branch, run `npm run lint`, and open a pull request.

<br />

<div align="center">

*Make every day count.*

</div>
