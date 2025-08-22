// #include "./lib/ext_ai_core_api.h"

//st_ext_core.c
//동적 로딩..
void *AICodeInit(void *f){

    void *(*ST_EXT_AI_Init)();
	ST_EXT_AI_Init=(void *(*)())f;
	return ST_EXT_AI_Init(); //Object
}

void AICodeUninit(void *f, void* pObj){

	void (*ST_EXT_AI_Uninit)(void*);
	ST_EXT_AI_Uninit = (void (*)(void*))f;
	ST_EXT_AI_Uninit(pObj);
}

long AISetParam(void *f, void *pObj, int ParamType, void* ParamValue, int ParamCount){

	long ret = 0;

	long (*ST_EXT_AI_SetParam)(void *, int, void *, int);
	ST_EXT_AI_SetParam = (long (*)(void *, int, void *, int))f;
	ST_EXT_AI_SetParam(pObj, ParamType, ParamValue, ParamCount);

	return ret;
}

int GetAIDetectionCode(void *f, void *pObj, int Mode, unsigned char* InputImage, int Input_width, int Input_height, int Input_type, unsigned char** OutputImage, int* Output_width, int* Output_height, int* Output_type, char** ext_msg){

	long ret = 0;

	int (*ST_EXT_AI_Proc)(void *, int, unsigned char *, int, int, int, unsigned char **, int *, int *, int *, char **);
	ST_EXT_AI_Proc = (int (*)(void *, int, unsigned char *, int, int, int, unsigned char **, int *, int *, int *, char **))f;
	ret = ST_EXT_AI_Proc(pObj, Mode, InputImage, Input_width, Input_height, Input_type, OutputImage, Output_width, Output_height, Output_type, ext_msg);

	return ret;
}

