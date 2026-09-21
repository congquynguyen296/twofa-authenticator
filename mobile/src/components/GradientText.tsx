import React from 'react';
import { Text, TextProps, Platform, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Colors } from '../theme/colors';

type Props = TextProps & {
  colors?: readonly [string, string, ...string[]];
  theme?: any;
};

export const GradientText: React.FC<Props> = ({ 
  colors = ['#007AFF', '#5AC8FA'], 
  style, 
  theme = Colors.light,
  children, 
  ...props 
}) => {
  if (Platform.OS === 'web') {
    return (
      <Text
        style={[
          style,
          {
            backgroundImage: `linear-gradient(45deg, ${colors[0]}, ${colors[1]})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          } as any
        ]}
        {...props}
      >
        {children}
      </Text>
    );
  }

  // On Native (iOS/Android), use MaskedView and LinearGradient
  return (
    <MaskedView
      maskElement={
        <Text style={[style, { backgroundColor: 'transparent' }]} {...props}>
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[style, { opacity: 0 }]} {...props}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
};
