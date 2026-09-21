import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../theme/typography';
import { Colors } from '../theme/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useVaultStore } from '../stores/vaultStore';
import { TotpService } from '../services/totpService';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export const ScannerScreen: React.FC<Props> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const addAccount = useVaultStore((state) => state.addAccount);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ type, data }: { type: string, data: string }) => {
    if (scanned) return;
    setScanned(true);
    
    try {
      const config = TotpService.parseUri(data);
      
      await addAccount({
        issuer: config.issuer || 'Unknown',
        accountName: config.label || 'Unknown',
        secret: config.secret,
        algorithm: config.algorithm || 'SHA1',
        digits: config.digits || 6,
        period: config.period || 30,
      });

      navigation.navigate('Home');
    } catch (e: any) {
      Alert.alert(
        'Invalid QR Code',
        e.message || 'This QR code is not a supported TOTP configuration.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={[Typography.h3, { marginBottom: 20 }]}>Camera Access Required</Text>
        <Text style={[Typography.body, { textAlign: 'center', marginBottom: 20 }]}>
          VaultOTP needs camera access to scan authentication QR codes.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={[Typography.bodyMedium, { color: '#FFF' }]}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => navigation.goBack()}>
          <Text style={[Typography.body, { color: Colors.light.primary }]}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <SafeAreaView style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={[Typography.body, { color: '#FFF' }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[Typography.h3, { color: '#FFF' }]}>Scan QR Code</Text>
            <View style={{ width: 60 }} />
          </View>
          
          <View style={styles.targetBox} />
          
          <View style={styles.footer}>
            <Text style={[Typography.body, { color: '#FFF', textAlign: 'center' }]}>
              Point your camera at the authentication QR code.
            </Text>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backButton: { width: 60 },
  targetBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#4F46E5',
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  footer: {
    padding: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  button: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  }
});
