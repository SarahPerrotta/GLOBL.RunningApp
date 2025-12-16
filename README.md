# GLOBL. Running App

A React Native (Expo) app for social running: track progress, compare with friends, collect badges, and explore global heatmaps.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Design (Figma)](#design-figma)
- [Getting Started](#getting-started)


---

## Features

- **Badges hub** with 3 tabs:
  - **Leaders** — base mock friends + user-added friends merged and de-duplicated.
  - **Badges** — earned badges view (screen stub in repo).
  - **Available** — static list of unlockable badges with emoji + criteria.
- **Profile header** (name, level, progress bar) sourced from Firebase Auth/Firestore—falls back to email local-part while profile loads.
- **Friend suggestions → leaderboard**: suggested friends persist to AsyncStorage and appear on the Leaders tab when the screen regains focus.
- **Swipe-to-delete** non-base friends on the Leaders tab (Gesture Handler `Swipeable`).
- **Navigation stacks** for auth/app flows and a root navigator (AppStack, AuthStack, RootNavigator).
- **Incognito mode components** (context + toggle) scaffolded for privacy controls.

---

## Architecture

- **Navigation**
  - `stacks/AuthStack.js` (auth flow)
  - `stacks/AppStack.js` (main app)
  - `stacks/RootNavigator.js` (top-level switch)
  - `components/BottomNav.js` (tab bar)
- **Screens**
  - `screens/BadgesScreen.js` (container with tabs)
    - `screens/LeaderTabs/LeaderScreen.js`
    - `screens/LeaderTabs/EarnedBadgesScreen.js`
    - `screens/LeaderTabs/AvailableBadgesScreen.js`
  - Additional: onboarding, profile, settings, global heatmap, user location map, friend suggestions, etc.
- **State / Data**
  - Firebase Auth + Firestore for user profile (first name).
  - AsyncStorage for local app state (e.g., `leaderboard_friends`, cached user name).
  - No remote ParkRun/RunClub fetch yet—those labels are static placeholders today.

---

## Tech Stack

- **React Native** + **Expo**
- **React Navigation**
- **Firebase** (Auth, Firestore)
- **AsyncStorage**
- **react-native-gesture-handler** (Swipeable)
- **react-native-vector-icons** (Ionicons)

---

## Design (Figma)

Explore the app UI and flows in Figma:  
🔗 [View GLOBL UI on Figma](https://www.figma.com/design/QHLBErbPrzUSfvxefDz0Tu/GLOBL.-UI?node-id=1-39&t=viQfbbEorDK3c3lM-1)


## Getting Started

```bash
# 1) Install dependencies
npm install

# 2) Run (clearing Metro cache helps after big refactors)
npx expo start -c

# 3) Open on device/simulator from Expo Dev Tools 


