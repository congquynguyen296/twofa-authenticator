import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Typography } from '../theme/typography';

type Props = {
  message: string;
  theme: any;
};

export const EmptyState: React.FC<Props> = ({ message, theme }) => {
  return (
    <View style={styles.emptyState}>
      <Text style={[Typography.body, { color: theme.textSecondary }, styles.emptyText]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  }
});
