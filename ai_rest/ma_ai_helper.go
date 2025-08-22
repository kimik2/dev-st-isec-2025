package main

/*

#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <stdio.h>

// Add missing C function declarations
void* AICodeInit(void* funcPtr);
void AICodeUninit(void* funcPtr, void* obj);
long AISetParam(void *funcPtr, void *pObj, int ParamType, void* ParamValue, int ParamCount);
int GetAIDetectionCode(void* funcPtr, void* obj, int mode, unsigned char* inputImage, int inputWidth, int inputHeight, int inputType, unsigned char** outputImage, int* outputWidth, int* outputHeight, int* outputType, char** extMsg);

*/
import (
	"C"
)

import (
	"errors"
	"fmt"
	"image"
	"image/color"
	"image/jpeg"
	"image/png"
	"os"
	"path/filepath"
	"reflect"
	"runtime"
	"strings"
	"syscall"
	"unsafe"

	log "github.com/sirupsen/logrus"
)

type ImageData struct {
	Data     []byte
	Width    int
	Height   int
	Channels int
}

type MAModuleHelper struct {
	PtrHandle       syscall.Handle
	Libname         string
	ptrFuncInit     uintptr
	ptrFuncUnInit   uintptr
	ptrFuncProcess  uintptr
	ptrFuncSetParam uintptr
}

func (h *MAModuleHelper) GetOS() string {
	return runtime.GOOS
}

func (h *MAModuleHelper) GetArch() string {
	return runtime.GOARCH
}

/*
모듈을 로딩하고
함수 시작 포인터를 얻어오는 함수
*/
func (h *MAModuleHelper) InitModule(modulePath string) error {
	log.Debugf("InitModule")

	var err error
	if h.PtrHandle == 0 {
		if err := h.LoadModule(modulePath); err != nil {
			log.Errorf("Error LoadModule [%v]", err.Error())
			return err
		}
	}

	h.ptrFuncInit, err = h.GetProcAddress("ST_EXT_AI_Init")
	if err != nil {
		return errors.New("ERROR CallFunction ST_EXT_AI_Init is nil")
	}

	h.ptrFuncUnInit, err = h.GetProcAddress("ST_EXT_AI_Uninit")
	if err != nil {
		return errors.New("ERROR CallFunction h.ptrFuncUnInit is nil")
	}
	log.Debugf("GetProcAddress Success [%v] ", h.ptrFuncUnInit)

	h.ptrFuncProcess, err = h.GetProcAddress("ST_EXT_AI_Proc")
	if err != nil {
		return errors.New("ERROR CallFunction h.ptrFuncProcess is nil")
	}
	log.Debugf("GetProcAddress Success [%v] ", h.ptrFuncProcess)

	h.ptrFuncSetParam, err = h.GetProcAddress("ST_EXT_AI_SetParam")
	if err != nil {
		return errors.New("ERROR CallFunction h.ptrFuncSetParam is nil")
	}
	log.Debugf("GetProcAddress Success [%v] ", h.ptrFuncSetParam)

	return nil
}

func (h *MAModuleHelper) LoadModule(modulePath string) (err error) {
	log.Debugf("LoadModule [%v]", modulePath)
	h.PtrHandle, err = syscall.LoadLibrary(modulePath)
	if err != nil {
		log.Errorf("Error LoadLibrary [%v]", err.Error())
		return err
	}

	h.Libname = modulePath
	log.Debugf("LoadModule Success [%v]", modulePath)
	return nil
}

func (h *MAModuleHelper) GetProcAddress(funcName string) (uintptr, error) {
	addr, err := syscall.GetProcAddress(h.PtrHandle, funcName)
	if err != nil {
		err := errors.New(err.Error())
		log.Errorf("Error GetProcAddress [%v] [%v]", funcName, err.Error())
		return 0, err
	}

	log.Debugf("GetProcAddress Success [%v]", funcName)
	return addr, nil
}

func (h *MAModuleHelper) LoadImage(fileName string) ([]byte, *ImageData, error) {
	file, err := os.Open(fileName)
	if err != nil {
		log.Errorf("Error opening image file [%v]", err.Error())
		return nil, nil, err
	}
	defer file.Close()

	var img image.Image
	ext := strings.ToLower(filepath.Ext(fileName))

	switch ext {
	case ".jpg", ".jpeg":
		img, err = jpeg.Decode(file)
	case ".png":
		img, err = png.Decode(file)
	default:
		// Try to decode as generic image
		img, _, err = image.Decode(file)
	}

	if err != nil {
		log.Errorf("Error decoding image [%v]", err.Error())
		return nil, nil, err
	}

	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	// Convert to BGR format (3 channels)
	data := make([]byte, width*height*3)

	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			r, g, b, _ := img.At(x, y).RGBA()
			idx := (y*width + x) * 3
			// Convert from 16-bit to 8-bit and BGR format
			data[idx] = byte(b >> 8)   // B
			data[idx+1] = byte(g >> 8) // G
			data[idx+2] = byte(r >> 8) // R
		}
	}

	imageData := &ImageData{
		Data:     data,
		Width:    width,
		Height:   height,
		Channels: 3,
	}

	return data, imageData, nil
}

func (h *MAModuleHelper) FreeModule() error {
	log.Debugf("FreeModule")
	if h.PtrHandle != 0 {
		defer syscall.FreeLibrary(h.PtrHandle)
		log.Infof("FreeModule [%v]", h.Libname)
		return nil
	}

	return errors.New("is not call dlopen")
}

func (h *MAModuleHelper) SaveImage(data []byte, width, height, imageType int, filename string) error {
	if len(data) == 0 {
		return errors.New("Image data is empty")
	}

	// Determine actual channels from data size
	actualChannels := len(data) / (width * height)
	if len(data) != width*height*actualChannels {
		log.Errorf("Invalid data size for image dimensions: data size %d doesn't match width*height*channels", len(data))
		return errors.New("Invalid data size for image dimensions")
	}

	log.Infof("SaveImage: width=%d, height=%d, actualChannels=%d, imageType=%d", width, height, actualChannels, imageType)

	// Create image
	img := image.NewRGBA(image.Rect(0, 0, width, height))

	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			idx := (y*width + x) * actualChannels

			var r, g, b, a uint8 = 0, 0, 0, 255

			if actualChannels == 1 {
				// Grayscale
				r = data[idx]
				g = data[idx]
				b = data[idx]
			} else if actualChannels == 3 {
				// Assume BGR format (from LoadImage)
				b = data[idx]
				g = data[idx+1]
				r = data[idx+2]
			} else if actualChannels == 4 {
				// Assume BGRA format
				b = data[idx]
				g = data[idx+1]
				r = data[idx+2]
				a = data[idx+3]
			}

			img.Set(x, y, color.RGBA{R: r, G: g, B: b, A: a})
		}
	}

	// Create output file
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	// Get file extension
	ext := strings.ToLower(filepath.Ext(filename))

	// Encode image based on extension
	switch ext {
	case ".jpg", ".jpeg":
		err = jpeg.Encode(file, img, &jpeg.Options{Quality: 95})
	case ".png":
		err = png.Encode(file, img)
	default:
		err = png.Encode(file, img)
	}

	if err != nil {
		return err
	}

	log.Infof("Image saved to %s", filename)
	return nil
}

const (
	MODE_EXT     = 0
	MODE_ADDRESS = 1
)

func (h *MAModuleHelper) GetDetectionCode(modulePath, fileName, address string) (string, string, error) {
	log.Infof("GetDetectionCode [%v] [%v]", modulePath, fileName)

	// 모듈 초기화
	h.InitModule(modulePath)

	// 이미지 로드
	inputImage, imgData, err := h.LoadImage(fileName)
	if inputImage == nil {
		log.Errorf("Error LoadImage [%v]", fileName)
		return "", "", errors.New("Error LoadImage")
	}

	log.Infof("LoadImage Success [%v]x[%v]", imgData.Width, imgData.Height)

	myCObject := C.AICodeInit(unsafe.Pointer(h.ptrFuncInit))
	if myCObject == nil {
		log.Errorf("Error AICodeInit is nil")
		return "", "", errors.New("Error AICodeInit is nil")
	}
	defer C.AICodeUninit(unsafe.Pointer(h.ptrFuncInit), myCObject)

	outputImage := make([]byte, 0)
	outputWidth := imgData.Width
	outputHeight := imgData.Height
	outputType := 1 // BGR format

	var extMsg string

	// Set parameters if needed

	// 2: ex_mode 설정
	// AI detail 검출 방법 (Mode: 1: Ellipse 4-part AI, 2: AI iou , 3: 기존 방법 Ellipse fit )
	ext_mode := 92
	_ = C.AISetParam(unsafe.Pointer(h.ptrFuncSetParam), myCObject, C.int(MODE_EXT), unsafe.Pointer(&ext_mode), C.int(1))

	// 1: AI 서버 IP 설정
	addressCStr := C.CString(address)
	defer C.free(unsafe.Pointer(addressCStr))
	_ = C.AISetParam(unsafe.Pointer(h.ptrFuncSetParam), myCObject, C.int(MODE_ADDRESS), unsafe.Pointer(addressCStr), C.int(len(address)))

	// // 3: ImageSize 설정 - 호출 안해도됨. 내부에서 테스트용임
	// imageSize := C.int(imgData.Width * imgData.Height * imgData.Channels)
	// ret = C.AISetParam(unsafe.Pointer(h.ptrFuncSetParam), myCObject, C.int(2), unsafe.Pointer(&outputType), C.int(1))

	// extMsgCStr := C.CString(extMsg)
	// defer C.free(unsafe.Pointer(extMsgCStr))
	// ret = C.AISetParam(unsafe.Pointer(h.ptrFuncSetParam), myCObject, C.int(3), unsafe.Pointer(extMsgCStr), C.int(1))

	ret, err := GetAIDetectionCodeGo(h.ptrFuncProcess, myCObject, inputImage, imgData.Width, imgData.Height, &outputImage, &outputWidth, &outputHeight, &outputType, &extMsg)
	if err != nil || ret < 0 {
		return "", "", errors.New("Error GetAIDetectionCode")
	}

	/*
		InputImage: 입력 이미지 데이터,
		Input_width: 입력 이미지 너비,
		Input_height: 입력 이미지 높이,
		Input_type: 입력 이미지 타입, // 0: GRAY, 1:BGR , 2: RGB, 3: BGRA, 4: RGBA, 5: Binary
		OutputImage: 출력 이미지 데이터 포인터,
		Output_width: 출력 이미지 너비,
		Output_height: 출력 이미지 높이,
		Output_type: 출력 이미지 타입, // 0: GRAY, 1:BGR , 2: RGB, 3: BGRA, 4: RGBA, 5: Binary
		ext_msg: extract watermark message
	*/

	log.Infof("GetAIDetectionCode ret [%v]", ret)
	log.Infof("GetAIDetectionCode outputWidth [%v]", outputWidth)
	log.Infof("GetAIDetectionCode outputHeight [%v]", outputHeight)
	log.Infof("GetAIDetectionCode outputType [%v]", outputType)
	log.Infof("GetAIDetectionCode extMsg [%v]", extMsg)

	// Generate timestamp and extract filename
	// timestamp := time.Now().Format("20060102_150405")
	inputFileName := filepath.Base(fileName)
	nameWithoutExt := strings.TrimSuffix(inputFileName, filepath.Ext(inputFileName))
	outputFileName := fmt.Sprintf("./output/%s.png", nameWithoutExt)

	outputFileNameOnly := fmt.Sprintf("%s.png", nameWithoutExt)

	// Ensure output directory exists
	if err := os.MkdirAll("./output", 0o755); err != nil {
		log.Errorf("Error creating output directory: %v", err)
	}

	h.SaveImage(outputImage, outputWidth, outputHeight, outputType, outputFileName)
	return extMsg, outputFileNameOnly, nil
}

//export GetAIDetectionCodeGo
func GetAIDetectionCodeGo(f uintptr, pObj unsafe.Pointer, inputImage []byte, inputWidth, inputHeight int, outputImage *[]byte, outputWidth *int, outputHeight *int, outputType *int, extMsg *string) (int, error) {
	var cOutputImage *C.uchar
	var cOutputWidth, cOutputHeight, cOutputType C.int
	var cExtMsg *C.char

	ret := C.GetAIDetectionCode(
		unsafe.Pointer(f),
		pObj,
		C.int(1), // Mode, set as needed
		(*C.uchar)(unsafe.Pointer(&inputImage[0])),
		C.int(inputWidth),
		C.int(inputHeight),
		C.int(1), // Input type: BGR
		&cOutputImage,
		&cOutputWidth,
		&cOutputHeight,
		&cOutputType,
		&cExtMsg,
	)

	if ret < 0 {
		return int(ret), errors.New("C.GetAIDetectionCode failed")
	}

	// Copy output image data
	length := int(cOutputWidth) * int(cOutputHeight) * 3 // Assuming 3 channels
	if cOutputType == 0 {
		length = int(cOutputWidth) * int(cOutputHeight) // GRAY
	} else if cOutputType == 3 || cOutputType == 4 {
		length = int(cOutputWidth) * int(cOutputHeight) * 4 // BGRA/RGBA
	}

	sliceHeader := &reflect.SliceHeader{
		Data: uintptr(unsafe.Pointer(cOutputImage)),
		Len:  length,
		Cap:  length,
	}
	*outputImage = *(*[]byte)(unsafe.Pointer(sliceHeader))
	*outputWidth = int(cOutputWidth)
	*outputHeight = int(cOutputHeight)
	*outputType = int(cOutputType)
	if cExtMsg != nil {
		*extMsg = C.GoString(cExtMsg)
	}

	return int(ret), nil
}
