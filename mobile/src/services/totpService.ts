import * as OTPAuth from 'otpauth';
import { Algorithm, TotpConfig } from '../types';

export class TotpService {
  /**
   * Generates a TOTP token based on the provided configuration.
   * @param config The TOTP configuration
   * @param timestamp Optional Unix timestamp in milliseconds to generate the token for
   */
  static generateToken(config: TotpConfig, timestamp: number = Date.now()): string {
    const totp = new OTPAuth.TOTP({
      issuer: config.issuer || '',
      label: config.label || '',
      algorithm: config.algorithm || 'SHA1',
      digits: config.digits || 6,
      period: config.period || 30,
      secret: OTPAuth.Secret.fromBase32(this.normalizeSecret(config.secret)),
    });

    return totp.generate({ timestamp });
  }

  /**
   * Normalizes a base32 secret by removing spaces and standardizing casing.
   */
  static normalizeSecret(secret: string): string {
    return secret.replace(/\s+/g, '').toUpperCase();
  }

  /**
   * Calculates the remaining time in seconds for the current TOTP period.
   * countdown = period - (unixTime % period)
   */
  static calculateRemainingSeconds(period: number = 30, timestamp: number = Date.now()): number {
    const unixTimeSeconds = Math.floor(timestamp / 1000);
    return period - (unixTimeSeconds % period);
  }
  
  /**
   * Parses an otpauth:// URI into a TotpConfig object
   */
  static parseUri(uri: string): TotpConfig {
    const parsed = OTPAuth.URI.parse(uri);
    if (!(parsed instanceof OTPAuth.TOTP)) {
      throw new Error("Invalid QR Code: This QR code is not a supported TOTP configuration.");
    }

    return {
      issuer: parsed.issuer,
      label: parsed.label,
      algorithm: parsed.algorithm as Algorithm,
      digits: parsed.digits as 6 | 8,
      period: parsed.period,
      secret: parsed.secret.base32,
    };
  }
}
