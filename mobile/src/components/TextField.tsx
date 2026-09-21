import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Typography } from '../theme/typography';

import { Metrics } from '../theme/metrics';

type Props = TextInputProps & {
  label: string;
  theme: any;
};

export const TextField: React.FC<Props> = ({ label, theme, style, ...props }) => {
  return (
    <View style={styles.container}>
      <Text style={[Typography.caption, { color: theme.textSecondary, marginBottom: Metrics.spacing.sm }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input, 
          { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border },
          style
        ]}
        placeholderTextColor={theme.textSecondary}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Metrics.spacing.xl,
  },
  input: {
    borderWidth: 1,
    borderRadius: Metrics.borderRadius.md,
    padding: Metrics.spacing.lg,
    fontSize: 16,
  }
});
