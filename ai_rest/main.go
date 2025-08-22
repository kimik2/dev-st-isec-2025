package main

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

/*
#include "./lib/ext_ai_core_api.h" // Include the C header
*/
const (
	WM_MODULE_PATH = "./"
	WM_AI_MODULE   = "ST_EXT_AI_Core.dll"
)

func LoadEnv() (string, string) {
	GIN_MODE := os.Getenv("GIN_MODE")
	if GIN_MODE == "" {
		GIN_MODE = gin.ReleaseMode // Default to release mode
	}

	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = ":8080" // Default port
	}
	if PORT[0] != ':' {
		PORT = ":" + PORT // Add colon if not present
	}

	return GIN_MODE, PORT
}

func main() {
	GIN_MODE, PORT := LoadEnv()
	gin.SetMode(GIN_MODE)
	r := gin.New()

	// Add CORS middleware to handle cross-origin requests
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Header("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	AI_SERVER_ADDRESS := os.Getenv("AI_SERVER")
	LIB_MODULE := WM_MODULE_PATH + WM_AI_MODULE
	log.Infof("Starting server on port %s with mode %s", PORT, GIN_MODE)

	r.GET("/ai", func(c *gin.Context) {
		// Get filename from query parameter
		fileName := c.Query("filename")
		if fileName == "" {
			log.Error("Filename parameter is required")
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Filename parameter is required",
			})
			return
		}

		// Construct output file path
		outputDir := "./output"
		filePath := outputDir + "/" + fileName

		// Check if file exists
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			log.Errorf("File not found: %s", filePath)
			c.JSON(http.StatusNotFound, gin.H{
				"error": "File not found",
			})
			return
		}

		// Serve the file
		c.File(filePath)
	})

	r.POST("/detection", func(c *gin.Context) {
		// Get uploaded file from form data
		file, err := c.FormFile("file")
		if err != nil {
			log.Errorf("Failed to get uploaded file: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "No file uploaded or invalid file",
			})
			return
		}

		// Create uploads directory if it doesn't exist
		uploadsDir := "./uploads"
		if _, err := os.Stat(uploadsDir); os.IsNotExist(err) {
			os.MkdirAll(uploadsDir, 0o755)
		}

		// Save uploaded file to local directory
		// Generate timestamp prefix for filename
		timestamp := time.Now().Format("20060102_150405_")
		fileName := uploadsDir + "/" + timestamp + file.Filename
		if err := c.SaveUploadedFile(file, fileName); err != nil {
			log.Errorf("Failed to save uploaded file: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to save file",
			})
			return
		}

		log.Printf("File saved: %s", fileName)

		moduleHelper := &MAModuleHelper{}
		// Process the saved file
		extMsg, outFileName, err := moduleHelper.GetDetectionCode(LIB_MODULE, fileName, AI_SERVER_ADDRESS)
		if err != nil {
			log.Errorf("GetDetectionCode Error [%v]", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to process file",
			})
			return
		}

		log.Printf(" -> extMsg [%v]", string(extMsg))
		// Parse the detection result and create DetectionResult struct
		detectionResult := DetectionResult{
			Status: "detected",
			LeakerInfo: LeakerInfo{
				Name:   "데이브 존스", // Replace with actual parsed name
				Avatar: "avatar", // Replace with actual parsed avatar URL
			},
			Company:     "마크애니",                 // Replace with actual parsed company
			Team:        "인사팀",                  // Replace with actual parsed team
			Email:       "john.doe@markany.com", // Replace with actual parsed email
			Contact:     "+82-10-1234-5678",     // Replace with actual parsed contact
			Device:      "MacOS 세쿼이아 15.11",     // Replace with actual parsed device
			Serial:      "293EDCVBE251",         // Replace with actual parsed serial
			IP:          "192.168.1.100",        // Replace with actual parsed IP
			Time:        "2024-11-27 14:30:25",  // Replace with actual parsed time
			Ext:         extMsg,
			OutFileName: outFileName, // Include the output file name in the response
		}

		log.Infof("Detection Result: %+v", detectionResult)
		c.JSON(http.StatusOK, detectionResult)
	})

	r.Run(PORT)
}

type LeakerInfo struct {
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
}
type DetectionResult struct {
	Status      string     `json:"status"`
	LeakerInfo  LeakerInfo `json:"leaker_info"`
	Company     string     `json:"company"`
	Team        string     `json:"team"`
	Email       string     `json:"email"`
	Contact     string     `json:"contact"`
	Device      string     `json:"device"`
	Serial      string     `json:"serial"`
	IP          string     `json:"ip"`
	Time        string     `json:"time"`
	Ext         string     `json:"ext"`
	OutFileName string     `json:"outFileName"`
}
