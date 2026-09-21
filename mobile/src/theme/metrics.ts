import { Platform } from 'react-native';

export const Metrics = {
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  
  // Border Radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },

  // Shadows
  shadows: {
    card: Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(0,0,0,0.1)'
      } as any,
      default: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 3,
      }
    }),
    button: Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'
      } as any,
      default: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 2,
      }
    })
  }
};
