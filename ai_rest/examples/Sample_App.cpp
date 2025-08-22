// ST_EXT_AI_App.cpp : 이 파일에는 'main' 함수가 포함됩니다. 거기서 프로그램 실행이 시작되고 종료됩니다.
//

#include <iostream>
#include <string>
#include <time.h>

#include "opencv2/highgui.hpp"
#include "opencv2/imgproc.hpp"
#include "opencv2/photo.hpp"
#include "opencv2/imgcodecs.hpp"


#include"./ext_ai_lib/ext_ai_core_api.h"



#ifdef _WIN64
#ifdef _DEBUG
#pragma comment(lib, "../external/w64_debug/lib/opencv_world490d.lib")
#else
#pragma comment(lib, "../external/w64_release/lib/opencv_world490.lib" )
#endif //_DEBUG
#endif //_WIN64


#ifdef _WIN64
#ifdef _DEBUG
#pragma comment(lib, "../bin/x64_Debug/ST_EXT_AI_Core.lib")
#else
#pragma comment(lib, "../bin/x64_Release/ST_EXT_AI_Core.lib")
#endif //_DEBUG
#endif //_WIN64

int main(int argc, char* argv[])
{
	std::cout << ">> ST_EXT_AI_App Running...\n";

	long ret = 0;

	int ex_mode = 2; // Default mode: 1 - 4 part area, 2 - ellipse fit peak shape

	if(argc < 2) {
		std::cout << "->[!] Useage: ST_EXT_AI_App <image_path> (mode: 1 - 4 part area, 2 - ellipse fit peak shape ,default - 1)\n";
		return -1;
	}
	
	if(argc > 3) {
		std::cout << "->[!] Usage: ST_EXT_AI_App <image_path> (mode: 1 - 4 part area, 2 - ellipse fit peak shape ,default - 1)\n";
		return -1;
	}


	char loadName[256] = { 0, };
	strcpy_s(loadName, sizeof(loadName), argv[1]); // 이미지 경로 설정

	if (argc > 2) {
		ex_mode = atoi(argv[2]); // 모드 설정
		if(ex_mode < 1 || ex_mode > 99) {
			std::cout << "->[!] Invalid mode! Use 1 for 4 part area or 2 for ellipse fit peak shape.\n";
			std::cout << "->[!] Usage: ST_EXT_AI_App <image_path> (mode: 1 - 4 part area, 2 - ellipse fit peak shape ,default - 1)\n";
			return -1;
		}
	}


	clock_t tm_start, tm_end, tm_duration;


	tm_start = clock(); // 시작 시간 기록

	std::cout << ">> Input path: " << loadName << std::endl;

	cv::Mat Image = cv::imread(loadName, cv::IMREAD_ANYCOLOR);


	void* pObject = ST_EXT_AI_Init();
	if (pObject == NULL) {
		std::cout << "->[!] Fail to ST_EXT_AI_Init " << std::endl;;

		tm_end = clock(); // 종료 시간 기록
		tm_duration = tm_end - tm_start; // 경과 시간 계산
		std::cout << ">> Total processing time: " << static_cast<double>(tm_duration) / CLOCKS_PER_SEC << " seconds\n";

		return -1;
	}

	int setValue = 0;
	int setSize = 0;
	char setString[128] = { 0, };



	setValue = ex_mode;//1;//1;
	setSize = 1;
	ret = ST_EXT_AI_SetParam(pObject, 0, (void*)setValue, setSize); // AI detail 검출 방법 (Mode: 1: Ellipse 4-part AI, 2: AI iou , 3: 기존 방법 Ellipse fit )
	
	if (ret < 0) {
		std::cout << "->[!] Fail to ST_EXT_AI_SetParam (set Mode), Error code: " << ret << std::endl;
		ST_EXT_AI_Uninit(pObject);

		tm_end = clock(); // 종료 시간 기록
		tm_duration = tm_end - tm_start; // 경과 시간 계산
		std::cout << ">> Total processing time: " << static_cast<double>(tm_duration) / CLOCKS_PER_SEC << " seconds\n";

		return -1;
	}
	
#if 1
	strcpy_s(setString, sizeof(setString), Address);
	setSize = (int)strlen(setString);
	ret = ST_EXT_AI_SetParam(pObject, 1, (void*)setString, setSize); // 1: AI 서버 IP 설정
	if (ret < 0) {
		std::cerr << "->[!] Fail to ST_EXT_AI_SetParam (set AI IP address), Error code: " << ret << std::endl;
		ST_EXT_AI_Uninit(pObject);
		tm_end = clock(); // 종료 시간 기록
		tm_duration = tm_end - tm_start; // 경과 시간 계산
		std::cout << ">> Total processing time: " << static_cast<double>(tm_duration) / CLOCKS_PER_SEC << " seconds\n";
		return -1;
	}
#endif

	setValue = 960;
	setSize = 1;
	ret = ST_EXT_AI_SetParam(pObject, 2, (void*)setValue, setSize); // Image resize 크기 설정 
	if (ret < 0) {
		std::cout << "->[!] Fail to ST_EXT_AI_SetParam (set Resize scale), Error code: " << ret << std::endl;
		ST_EXT_AI_Uninit(pObject);

		tm_end = clock(); // 종료 시간 기록
		tm_duration = tm_end - tm_start; // 경과 시간 계산
		std::cout << ">> Total processing time: " << static_cast<double>(tm_duration) / CLOCKS_PER_SEC << " seconds\n";

		return -1;
	}


	unsigned char* inputImage = NULL; // 입력 이미지 데이터 (예시로 NULL로 설정)
	int inputWidth = Image.cols; // 입력 이미지 너비
	int inputHeight = Image.rows; // 입력 이미지 높이
	int inputType = 1; // 입력 이미지 타입 (예시로 1로 설정)	// 0: GRAY, 1:BGR , 2: RGB, 3: BGRA, 4: RGBA, 5: Binary
	int inputCh = Image.channels(); // 예시로 BGR 타입으로 설정

	if (inputCh == 1)
		inputType = 0; // GRAY
	else if(inputCh == 3)
		inputType = 1; // BGR
	else if(inputCh == 4)
		inputType = 3; // BGRA
	else if(inputCh == 2)
		inputType = 5; // Binary (예시로 설정, 실제로는 다른 타입일 수 있음)


	unsigned char* outputImage = NULL; // 출력 이미지 데이터
	int outputWidth = 0; // 출력 이미지 너비
	int outputHeight = 0; // 출력 이미지 높이
	int outputType = 0;

	char* extMsg = NULL; // 확장 메시지


	inputImage = (unsigned char*)calloc(inputWidth * inputHeight * inputCh, sizeof(unsigned char) ); // 예시로 RGB 이미지로 가정하여 메모리 할당

	for(int i = 0; i < inputHeight; i++) {
		for (int j = 0; j < inputWidth ; j++)
		{
			for(int k = 0; k < inputCh; k++)
			{
				if(inputType == 0) // GRAY
					inputImage[(i * inputWidth + j) * inputCh + k] = Image.at<uchar>(i, j);
				else if (inputType == 1 || inputType == 2) // BGR, RGB
					inputImage[(i * inputWidth + j) * inputCh + k] = Image.at<cv::Vec3b>(i, j)[k];
				else if(inputType == 3 || inputType == 4) // BGRA, RGBA
					inputImage[(i * inputWidth + j) * inputCh + k] = Image.at<cv::Vec4b>(i, j)[k];
				//else if (inputType == 5) // Binary
				//inputImage[(i * inputWidth + j) * inputCh + k] = Image.at<cv::Vec3b>(i, j)[k]; // OpenCV에서 BGR 이미지로 읽어오기
			}  
		}
	}

	int ai_mode = 0; //0->partial mode, 1-> full monitor mode
	if (ex_mode >= 90) {
		ai_mode = 1;
	}


	// ST_PartAI_Proc 호출
	ret = ST_EXT_AI_Proc(pObject, ai_mode, inputImage, inputWidth, inputHeight, inputType, &outputImage, outputWidth, outputHeight, outputType, &extMsg);
	// InputImage: 입력 이미지 데이터, 
	// Input_width: 입력 이미지 너비, 
	// Input_height: 입력 이미지 높이, 
	// Input_type: 입력 이미지 타입, // 0: GRAY, 1:BGR , 2: RGB, 3: BGRA, 4: RGBA, 5: Binary
	// OutputImage: 출력 이미지 데이터 포인터, 
	// Output_width: 출력 이미지 너비, 
	// Output_height: 출력 이미지 높이, 
	// Output_type: 출력 이미지 타입, // 0: GRAY, 1:BGR , 2: RGB, 3: BGRA, 4: RGBA, 5: Binary
	// ext_msg: extract watermark message


	if (inputImage != nullptr)
	{
		free(inputImage); // 입력 이미지 메모리 해제
		inputImage = NULL;
	}

	if (ret < 0) {
		std::cout << "->[!] Fail to extract message using AI, Error code: " << ret << std::endl;
	}
	else {
		// 출력 이미지 처리 (예: 저장, 표시 등)
		std::cout << ">> Success to extract using AI ..." <<  std::endl;


		if (outputImage != NULL) {
			// 예시로 출력 이미지 데이터를 처리하는 코드
			// 실제로는 OpenCV 등을 사용하여 이미지로 변환 후 저장하거나 표시할 수 있습니다.


			cv::Mat outImgage = cv::Mat(outputHeight, outputWidth, (outputType == 0) ? CV_8UC1 : (outputType == 1 || outputType == 2) ? CV_8UC3 : (outputType == 3 || outputType == 4) ? CV_8UC4 : CV_8UC1);
			int ouputCh = 0;

			if(outputType == 0)
				ouputCh = 1; // GRAY
			else if(outputType == 1 || outputType == 2)
				ouputCh = 3; // BGR, RGB
			else if(outputType == 3 || outputType == 4)
				ouputCh = 4; // BGRA, RGBA
			else if(outputType == 5)
				ouputCh = 1; // Binary

			//printf(">> Output Image Type: %d, Channels: %d\n", outputType, ouputCh);

			for(int i= 0; i < outputHeight; i++) {
				for (int j = 0; j < outputWidth; j++)
				{
					for(int k = 0; k < ouputCh; k++)
					{
						if(outputType == 0) // GRAY
							outImgage.at<uchar>(i, j) = outputImage[(i * outputWidth + j) * ouputCh + k];
						else if (outputType == 1 || outputType == 2) // BGR, RGB
							outImgage.at<cv::Vec3b>(i, j)[k] = outputImage[(i * outputWidth + j) * ouputCh + k];
						else if(outputType == 3 || outputType == 4) // BGRA, RGBA
							outImgage.at<cv::Vec4b>(i, j)[k] = outputImage[(i * outputWidth + j) * ouputCh + k];
						else if(outputType == 5) // Binary
							outImgage.at<uchar>(i, j) = outputImage[(i * outputWidth + j) * ouputCh + k];
					}  
				}
			}

			if(1) // save image
			{
				char outputFileName[256] = { 0, };
				char* dotPos = strrchr(loadName, '.'); // 파일 이름에서 확장자 위치 찾기
				if (dotPos != NULL) {
					*dotPos = '\0'; // 확장자 제거
				}

				//char* pathSep = strrchr(loadName, '/'); // 경로 구분자 위치 찾기
				char* pathSep = strrchr(loadName, '\\'); // 경로 구분자 위치 찾기
				if (pathSep != NULL) {
					pathSep++; // 경로 구분자 다음 위치로 이동
				}
				else {
					pathSep = loadName; // 경로 구분자가 없으면 전체 파일 이름 사용
				}

				sprintf_s(outputFileName, sizeof(outputFileName), "%s_output.png", pathSep);
				cv::imwrite(outputFileName, outImgage); // 출력 이미지 저장 (예시로 "output_image.png"로 저장)

				std::cout << ">> Image write : " << outputFileName << "...corrected image saved." << std::endl;
			}
		}

		if (extMsg != NULL) {
			std::cout << ">> Extract Message: " << extMsg << "\n";
		}
	}

	ST_EXT_AI_Uninit(pObject); // 객체 해제

	tm_end = clock(); // 종료 시간 기록
	tm_duration = tm_end - tm_start; // 경과 시간 계산
	std::cout << ">> Total processing time: " << static_cast<double>(tm_duration) / CLOCKS_PER_SEC << " seconds\n";

	if (outputImage != nullptr)
	{
		free(outputImage); // 입력 이미지 메모리 해제
		outputImage = NULL;
	}

	if(extMsg != NULL)
	{
		free(extMsg); // 확장 메시지 메모리 해제
		extMsg = NULL;
	}

	return 0;
}