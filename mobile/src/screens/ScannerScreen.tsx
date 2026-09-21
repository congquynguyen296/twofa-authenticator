import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../theme/typography';
import { Colors } from '../theme/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useVaultStore } from '../stores/vaultStore';
import { TotpService } from '../services/totpService';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Buffer } from 'buffer';
import * as jpeg from 'jpeg-js';
import jsQR from 'jsqr';

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

  const processQRCode = async (data: string) => {
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

      navigation.navigate('MainTabs');
    } catch (e: any) {
      Alert.alert(
        'Invalid QR Code',
        e.message || 'This QR code is not a supported TOTP configuration.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string, data: string }) => {
    if (scanned) return;
    setScanned(true);
    await processQRCode(data);
  };

  const pickImage = async () => {
    if (scanned) return;
    try {
      setScanned(true); // Pause camera scanning while picking image
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) {
        setScanned(false);
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        
        // 1. Resize and convert to base64 JPEG to ensure it's manageable
        const manipResult = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 800 } }], // Resize for faster processing
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );

        if (!manipResult.base64) {
          throw new Error('Failed to get base64 from image');
        }

        // 2. Decode JPEG to RGBA pixel data
        const jpegData = Buffer.from(manipResult.base64, 'base64');
        const rawImageData = jpeg.decode(jpegData, { useTArray: true }); // returns { width, height, data: Uint8Array }

        // 3. Scan QR from raw pixel data
        const code = jsQR(
          new Uint8ClampedArray(rawImageData.data.buffer), 
          rawImageData.width, 
          rawImageData.height
        );

        if (code && code.data) {
          await processQRCode(code.data);
        } else {
          Alert.alert('Error', 'No QR code found in the image.', [{ text: 'OK', onPress: () => setScanned(false) }]);
        }
      } else {
        setScanned(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process image.', [{ text: 'OK', onPress: () => setScanned(false) }]);
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
      />
      <SafeAreaView style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <Ionicons name="close" size={32} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
              <Ionicons name="image" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.targetWrapper}>
            <View style={styles.targetBox}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
          </View>
          
          <BlurView intensity={80} tint="dark" style={styles.footer}>
            <Ionicons name="qr-code-outline" size={24} color="#FFF" style={{ marginBottom: 8 }} />
            <Text style={[Typography.bodyMedium, { color: '#FFF', textAlign: 'center' }]}>
              Align QR code within the frame
            </Text>
            <Text style={[Typography.caption, { color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 4 }]}>
              Or tap the image icon to select from gallery
            </Text>
          </BlurView>
        </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  camera: { ...StyleSheet.absoluteFillObject },
  overlay: { 
    position: 'absolute', 
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'space-between' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetBox: {
    width: 260,
    height: 260,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#0A84FF',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  footer: {
    padding: 30,
    paddingBottom: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  button: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  }
});
