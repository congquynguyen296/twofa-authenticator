package controllers

import (
	"net/http"
	"vaultotp-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SyncController struct {
	DB *gorm.DB
}

func NewSyncController(db *gorm.DB) *SyncController {
	return &SyncController{DB: db}
}

type SyncRequest struct {
	Data string `json:"data" binding:"required"`
}

// SyncData handles uploading the encrypted vault data
func (sc *SyncController) SyncData(c *gin.Context) {
	deviceID := c.GetHeader("X-Device-ID")
	if deviceID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "X-Device-ID header is required"})
		return
	}

	var req SyncRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var vault models.VaultPayload
	result := sc.DB.Where("device_id = ?", deviceID).First(&vault)

	if result.Error == gorm.ErrRecordNotFound {
		// Create new
		vault = models.VaultPayload{
			DeviceID: deviceID,
			Data:     req.Data,
		}
		sc.DB.Create(&vault)
	} else {
		// Update existing
		vault.Data = req.Data
		sc.DB.Save(&vault)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Vault synced successfully"})
}

// GetData handles downloading the encrypted vault data
func (sc *SyncController) GetData(c *gin.Context) {
	deviceID := c.GetHeader("X-Device-ID")
	if deviceID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "X-Device-ID header is required"})
		return
	}

	var vault models.VaultPayload
	if err := sc.DB.Where("device_id = ?", deviceID).First(&vault).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "No vault data found for this device"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": vault.Data, "updatedAt": vault.UpdatedAt})
}
