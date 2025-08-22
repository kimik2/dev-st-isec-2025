// scr_tracer_ext.h : Defines the exported functions header for the DLL application.
//
#ifndef _MA_ST_PART_AI_API_H_
#define _MA_ST_PART_AI_API_H_

#ifdef __cplusplus
extern "C" {
#endif

#define STEXTAICORE_EXPORTS
#define RELEASE

#if defined(_WIN32) || defined(_WIN64)
#ifdef STEXTAICORE_EXPORTS
#define MA_API __declspec(dllexport)
#else
#define MA_API __declspec(dllimport)
#endif

#else //defined(_WIN32) || defined(_WIN64)

#define MA_API

#endif //defined(_WIN32) || defined(_WIN64)

MA_API void* ST_EXT_AI_Init();

MA_API long ST_EXT_AI_SetParam(void* pObject, int ParamType, void* ParamValue, int ParamCount);

MA_API long ST_EXT_AI_Proc(void* pObject, int Mode, unsigned char* InputImage, int Input_width, int Input_height, int Input_type, unsigned char** OutputImage, int* Output_width, int* Output_height, int* Output_type, char** ext_msg);

MA_API void ST_EXT_AI_Uninit(void* pObject);


#ifdef __cplusplus
}
#endif

#endif	//_MA_ST_PART_AI_API_H_
