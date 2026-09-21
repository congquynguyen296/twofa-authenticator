import { StyleSheet } from 'react-native';

export const Typography = StyleSheet.create({
  h1: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  h3: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 17, // Standard iOS body size
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  bodyMedium: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  caption: {
    fontSize: 13, // Standard iOS caption size
    fontWeight: '400',
    letterSpacing: 0,
  },
  code: {
    fontSize: 34,
    fontWeight: '600',
    letterSpacing: 4,
    fontVariant: ['tabular-nums'],
  }
});
