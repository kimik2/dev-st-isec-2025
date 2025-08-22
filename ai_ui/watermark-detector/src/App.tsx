import React, { useState } from 'react';
import './App.css';
import UploadImage from './components/UploadImage';
import RequestDetails from './components/RequestDetails';
import DetectionDetails from './components/DetectionDetails';
import { Minus, Square, X } from 'lucide-react';
import { OutputFileType } from 'typescript';

export interface DetectionResult {
  status: 'detected' | 'not_detected';
  leaker_info?: {
    name?: string;
    avatar?: string;
  };
  company?: string;
  team?: string;
  email?: string;
  contact?: string;
  device?: string;
  serial?: string;
  ip?: string;
  time?: string;
  ext?: string;
  outFileName?: string;
  gps?: {
    location?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export type ProcessingState = 'upload' | 'in_queue' | 'in_progress' | 'completed';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('upload');
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setProcessingState('in_queue');
    
    // Simulate processing delay
    setTimeout(() => {
      setProcessingState('in_progress');
      processDetection(file);
    }, 1000);
  };

  const processDetection = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // API 서버 연결 확인 및 타임아웃 설정
      const controller = new AbortController();
      // const timeoutId = setTimeout(() => controller.abort(), 10000*6); // 60초 타임아웃

      const response = await fetch('http://127.0.0.1:8080/detection', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        mode: 'cors',
        headers: {
          // FormData 사용 시 Content-Type 자동 설정
          // 'Content-Type': 'multipart/form-data' 제거 (FormData가 자동으로 설정함)
        },
      });

      // clearTimeout(timeoutId);
      console.log('Sending file to detection API:', response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: DetectionResult = await response.json();
      
      console.log('result :', result);

      // API 응답 데이터 검증 및 결과 설정
      if (result.status === 'detected') {
        console.log('Detection successful:', {
          leaker: result.leaker_info?.name || 'Unknown',
          company: result.company || 'N/A',
          team: result.team || 'N/A',
          email: result.email || 'N/A',
          time: result.time || new Date().toLocaleString(), 
          ext: result.ext || 'N/A',
          outFileName: result.outFileName || 'N/A'
        });
        
        // 서버에서 받은 데이터 그대로 사용
        setDetectionResult(result);
      } else {
        // 'detected'가 아닌 경우 (not_detected 등)
        console.log('No watermark detected');
        setDetectionResult({ status: 'not_detected' });
      }
      
      setProcessingState('completed');
    } catch (error) {
      console.error('Detection API failed:', error);
      
      // CORS 에러 또는 네트워크 에러 처리
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn('CORS 또는 네트워크 연결 오류: API 서버에 연결할 수 없습니다.');
      } else if (error instanceof Error && error.message.includes('CORS')) {
        console.warn('CORS 오류: 서버의 CORS 설정을 확인하세요.');
      } else {
        console.warn('API 서버에 연결할 수 없습니다. 개발 모드에서 mock 데이터를 사용합니다.');
      }
      
      setTimeout(() => {
        const mockResult: DetectionResult = { status: 'not_detected' };
        
        setDetectionResult(mockResult);
        setProcessingState('completed');
      }, 2000);
    }
  };

  const handleCancel = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8080/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'cancel' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Detection cancelled successfully');
    } catch (error) {
      console.error('Cancel API failed:', error);
    }
    
    // 취소 후 초기 화면으로 돌아가기
    handleReset();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setProcessingState('upload');
    setDetectionResult(null);
  };

  const handleRestart = () => {
    if (selectedFile) {
      setProcessingState('in_progress');
      setDetectionResult(null);
      processDetection(selectedFile);
    }
  };

  const handleButtonClick = () => {
    if (processingState === 'in_progress') {
      handleCancel();
    } else {
      handleReset();
    }
  };

  const getButtonText = () => {
    return processingState === 'in_progress' ? '탐지 취소' : '새로운 탐지';
  };

  const handleMinimize = () => {
    // 최소화 기능 (실제 앱에서는 Electron API 사용)
    console.log('Minimize window');
  };

  const handleMaximize = () => {
    // 최대화 기능 (실제 앱에서는 Electron API 사용)
    console.log('Maximize window');
  };

  const handleClose = () => {
    // 종료 기능 (실제 앱에서는 Electron API 사용)
    console.log('Close window');
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <img 
            src="/screentracer-logo102x26 3x.png" 
            alt="ScreenTRACER Logo" 
            style={{ 
              width: '137.88px', 
              height: '28.16px' 
            }}
          />
          {/* <span className="header-logo-text">ScreenTRACER</span> */}
        </div>
        <div className="header-controls">
          <button className="header-icon minimize-btn" onClick={handleMinimize} title="최소화">
            <Minus size={14} color="#FFFFFF" />
          </button>
          <button className="header-icon maximize-btn" onClick={handleMaximize} title="최대화">
            <Square size={12} color="#FFFFFF" />
          </button>
          <button className="header-icon close-btn" onClick={handleClose} title="종료">
            <X size={14} color="#FFFFFF" />
          </button>
        </div>
      </header>

      {/* AI Correction 진행 중 알림 메시지 */}
        {processingState === 'in_progress' && (
          <div className="ai-correction-notification">
            <div className="spinner"></div>
            <div className="message">AI Correction in process...</div>
          </div>
      )}
      
      

        {/* Main Content */}
      <main className="main-content">
        <div className="frame-2627">
          {processingState === 'upload' ? (
            // 초기 상태: Upload Images 패널만 표시
            <div className="upload-only-container">
              <div className="left-panel">
                <UploadImage onFileSelect={handleFileSelect} />
              </div>
            </div>
          ) : (
            // 파일 업로드 후: 외부 패널 안에 두 패널 표시
            <div className="outer-panel">
              <button 
                className={`outer-panel-reset-button ${processingState === 'in_progress' ? 'cancel-mode' : ''}`}
                onClick={handleButtonClick}
              >
                {getButtonText()}
              </button>
              <div className="panels-container">
                <div className="left-panel">
                  <RequestDetails 
                    file={selectedFile} 
                    onReset={handleReset}
                  />
                </div>
                <div className="right-panel">
                  <DetectionDetails 
                    processingState={processingState}
                    detectionResult={detectionResult}
                    onRestart={handleRestart}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
