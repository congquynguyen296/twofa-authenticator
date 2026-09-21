import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { Typography } from '../theme/typography';

import { Metrics } from '../theme/metrics';

type Props = TouchableOpacityProps & {
  title: string;
  theme: any;
  loading?: boolean;
};

export const PrimaryButton: React.FC<Props> = ({ title, theme, loading, style, ...props }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: theme.primary }, style]}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <Text style={[Typography.bodyMedium, { color: '#FFF' }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: Metrics.spacing.lg,
    borderRadius: Metrics.borderRadius.md,
    alignItems: 'center',
    marginTop: Metrics.spacing.sm,
  }
});
