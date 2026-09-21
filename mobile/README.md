# VaultOTP Mobile & Web App

A modern, cross-platform 2FA (Two-Factor Authentication) Authenticator app built with **React Native** and **Expo**. It supports iOS, Android, and Web platforms natively with a premium, smooth, and dynamic UI.

## Features

- **Cross-Platform**: Runs beautifully on Web, iOS, and Android.
- **Dynamic UX**: Premium animations, glassmorphism, dynamic gradients, and custom alerts.
- **Group Management**: Organize your 2FA accounts into custom groups (folders).
- **Zero-Knowledge Cloud Sync**: Backup and restore your 2FA tokens. Everything is encrypted *client-side* using `crypto-js` (AES-256) before it ever leaves your device.
- **Security First**: 
  - Local authentication/lock screen (FaceID/Biometrics on mobile, PIN/Password fallback).
  - Secure storage using `expo-secure-store`.
  - SQLite local database via `expo-sqlite`.
- **Search & Filter**: Real-time searching and filtering of your accounts.
- **QR Scanner**: Built-in camera scanner for adding new accounts instantly using `expo-camera`.

## Tech Stack

- **Framework**: [Expo](https://expo.dev/) & [React Native](https://reactnative.dev/)
- **Navigation**: [React Navigation v7](https://reactnavigation.org/) (Bottom Tabs & Native Stack)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Cryptography**: `crypto-js` & `otpauth` for generating TOTP tokens.
- **Storage**: `expo-sqlite` and `expo-secure-store`.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. Install the dependencies:
   ```bash
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npx expo start
   ```

### Running on specific platforms:
- **Web**: Press `w` in the terminal, or run `npx expo start --web`
- **iOS**: Press `i` in the terminal (Requires macOS and Xcode)
- **Android**: Press `a` in the terminal (Requires Android Studio/Emulator)

## Project Structure
- `src/components/` - Reusable UI components (CustomAlert, TextField, AccountCard, etc.)
- `src/screens/` - Main screen views (Home, Groups, Sync, Settings, etc.)
- `src/navigation/` - React Navigation configuration and tab layouts.
- `src/services/` - Core logic services (security, vault encryption, TOTP generation).
- `src/stores/` - Zustand global state managers.
- `src/theme/` - Centralized design system (colors, typography, metrics, spacing).

## Security Disclaimer
This application encrypts your vault locally before pushing it to the cloud. Make sure you remember your **Device ID** and **Master Password** (if configured), as it is impossible to recover your vault without them.
