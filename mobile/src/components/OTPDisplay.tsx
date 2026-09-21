import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { TotpService } from '../services/totpService';
import { AuthenticatorAccount } from '../types';
import { Typography } from '../theme/typography';
import { Metrics } from '../theme/metrics';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  account: AuthenticatorAccount;
  theme: any;
};

export const OTPDisplay: React.FC<Props> = ({ account, theme }) => {
  const [token, setToken] = useState('');
  const [remaining, setRemaining] = useState(30);
  const [copied, setCopied] = useState(false);
  const progressAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const updateToken = () => {
    try {
      const newToken = TotpService.generateToken({
        secret: account.secret,
        algorithm: account.algorithm,
        digits: account.digits,
        period: account.period,
      });
      setToken(newToken);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = async () => {
    if (!token || copied) return;
    await Clipboard.setStringAsync(token);
    
    // Cross-fade animation
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setCopied(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
      
      setTimeout(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
          setCopied(false);
          Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
        });
      }, 2000);
    });
  };

  useEffect(() => {
    updateToken();

    const interval = setInterval(() => {
      const secondsLeft = TotpService.calculateRemainingSeconds(account.period);
      setRemaining(secondsLeft);
      
      Animated.timing(progressAnim, {
        toValue: secondsLeft / account.period,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      if (secondsLeft === account.period) {
        updateToken();
        progressAnim.setValue(1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [account]);

  const isExpiring = remaining <= 5;
  const timerColor = isExpiring ? theme.danger : theme.primary;

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.7} onPress={handleCopy} style={styles.row}>
        <Animated.View style={{ opacity: fadeAnim, flexDirection: 'row', alignItems: 'center' }}>
          {copied ? (
            <>
              <Ionicons name="checkmark-circle" size={32} color={theme.success || '#34C759'} style={{ marginRight: 12 }} />
              <Text style={[Typography.code, styles.otpText, { color: theme.success || '#34C759' }]}>
                Copied
              </Text>
            </>
          ) : (
            <Text style={[Typography.code, styles.otpText, { color: timerColor }]}>
              {token ? `${token.slice(0, 3)} ${token.slice(3)}` : '------'}
            </Text>
          )}
        </Animated.View>
      </TouchableOpacity>
      <View style={[styles.progressContainer, { backgroundColor: theme.border }]}>
        <Animated.View 
          style={[
            styles.progressBar, 
            { 
              backgroundColor: timerColor,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Metrics.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.spacing.md,
  },
  otpText: {
    letterSpacing: 6,
    fontVariant: ['tabular-nums'],
    fontSize: 36, // Huge size for modern OTP display
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  }
});
