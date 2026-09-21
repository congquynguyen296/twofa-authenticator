import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Metrics } from '../theme/metrics';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: 'default' | 'destructive';
  theme: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    danger?: string;
    border: string;
  };
};

export const CustomAlert: React.FC<Props> = ({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  confirmStyle = 'default',
  theme,
}) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: theme.surface }]}>
          <Text style={[Typography.h3, { color: theme.text, marginBottom: 8 }]}>{title}</Text>
          <Text style={[Typography.bodyMedium, { color: theme.textSecondary, marginBottom: 24 }]}>{message}</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={onCancel}>
              <Text style={[Typography.bodyMedium, { color: theme.textSecondary, fontWeight: '600' }]}>{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
              <Text 
                style={[
                  Typography.bodyMedium, 
                  { 
                    color: confirmStyle === 'destructive' ? (theme.danger || '#FF3B30') : theme.primary,
                    fontWeight: 'bold' 
                  }
                ]}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: '80%',
    maxWidth: 400,
    borderRadius: Metrics.borderRadius.lg,
    padding: Metrics.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  button: {
    paddingVertical: Metrics.spacing.sm,
    paddingHorizontal: Metrics.spacing.md,
    marginLeft: Metrics.spacing.sm,
  },
  confirmButton: {
    backgroundColor: 'transparent',
  }
});
