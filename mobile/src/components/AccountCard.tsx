import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, Dimensions } from 'react-native';
import { AuthenticatorAccount } from '../types';
import { OTPDisplay } from './OTPDisplay';
import { Typography } from '../theme/typography';
import { Metrics } from '../theme/metrics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useVaultStore } from '../stores/vaultStore';
import { CustomAlert } from './CustomAlert';

type Props = {
  account: AuthenticatorAccount;
  theme: any;
};

export const AccountCard: React.FC<Props> = ({ account, theme }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPos, setModalPos] = useState({ top: 0, right: 0 });
  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
  const buttonRef = useRef<View>(null);
  const removeAccount = useVaultStore((state) => state.removeAccount);

  const handleOpenMenu = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      const screenWidth = Dimensions.get('window').width;
      setModalPos({
        top: y + height + 5,
        right: screenWidth - (x + width),
      });
      setModalVisible(true);
    });
  };

  const handleDelete = () => {
    setDeleteAlertVisible(true);
  };

  const confirmDelete = async () => {
    setDeleteAlertVisible(false);
    try {
      await removeAccount(account.id);
    } catch (e: any) {
      if (typeof window !== 'undefined' && window.alert) window.alert(e.message);
      else Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.cardShadow, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
            <Text style={[Typography.h3, { color: theme.primary }]}>
              {account.issuer ? account.issuer.charAt(0).toUpperCase() : account.accountName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={[Typography.bodyMedium, { color: theme.text }]}>{account.issuer || account.accountName}</Text>
            <Text style={[Typography.caption, { color: theme.textSecondary }]}>{account.accountName}</Text>
          </View>
        </View>
        <View ref={buttonRef}>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={handleOpenMenu}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.divider} />
      <OTPDisplay account={account} theme={theme} />

      <Modal transparent visible={modalVisible} animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={[
            styles.modalContent, 
            { backgroundColor: theme.surface, borderColor: theme.border, top: modalPos.top, right: modalPos.right }
          ]}>
            <TouchableOpacity 
              style={styles.modalOption} 
              onPress={() => {
                setModalVisible(false);
                setTimeout(() => navigation.navigate('EditAccount', { account }), 150);
              }}
            >
              <Ionicons name="pencil-outline" size={20} color={theme.text} style={{ marginRight: 12 }} />
              <Text style={{ color: theme.text, fontSize: 16, fontWeight: '500' }}>Edit Account</Text>
            </TouchableOpacity>
            <View style={[styles.modalDivider, { backgroundColor: theme.border }]} />
            <TouchableOpacity 
              style={styles.modalOption} 
              onPress={() => {
                setModalVisible(false);
                setTimeout(() => handleDelete(), 150);
              }}
            >
              <Ionicons name="trash-outline" size={20} color={theme.danger} style={{ marginRight: 12 }} />
              <Text style={{ color: theme.danger, fontSize: 16, fontWeight: '500' }}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      <CustomAlert
        visible={deleteAlertVisible}
        theme={theme}
        title="Delete Account"
        message={`Are you sure you want to delete ${account.accountName}?`}
        confirmText="Delete"
        confirmStyle="destructive"
        onCancel={() => setDeleteAlertVisible(false)}
        onConfirm={confirmDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Metrics.spacing.xl,
    marginBottom: Metrics.spacing.lg,
    padding: Metrics.spacing.xl,
    borderRadius: 24, // More rounded for modern iOS look
    borderWidth: 1, 
    ...Metrics.shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Metrics.spacing.md,
  },
  editButton: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
    marginVertical: Metrics.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    position: 'absolute',
    width: 220,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    ...Metrics.shadows.card,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  modalDivider: {
    height: 1,
    width: '100%',
  }
});
