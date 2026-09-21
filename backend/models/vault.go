package models

import (
	"time"

	"gorm.io/gorm"
)

// VaultPayload represents the encrypted vault data synced from a device.
type VaultPayload struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	DeviceID  string         `gorm:"uniqueIndex;not null" json:"deviceId"`
	Data      string         `gorm:"type:text;not null" json:"data"` // Encrypted JSON string from mobile
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
