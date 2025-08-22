import React from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageViewerProps {
  isOpen: boolean;
  imageUrl: string;
  fileName: string;
  onClose: () => void;
  onDownload: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  imageUrl,
  fileName,
  onClose,
  onDownload
}) => {
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 마우스 휠 이벤트 핸들러
  React.useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isOpen) return;
      
      e.preventDefault();
      
      const delta = e.deltaY;
      const zoomStep = 0.1;
      
      setZoom(prevZoom => {
        if (delta > 0) {
          // 휠을 아래로 스크롤 (축소)
          return Math.max(prevZoom - zoomStep, 0.25);
        } else {
          // 휠을 위로 스크롤 (확대)
          return Math.min(prevZoom + zoomStep, 3);
        }
      });
    };

    if (isOpen) {
      window.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 1001
      }}>
        <div style={{
          color: '#FFFFFF',
          fontSize: '16px',
          fontWeight: 600,
          fontFamily: 'Pretendard'
        }}>
          {fileName}
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            onClick={handleZoomOut}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '4px',
              padding: '8px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="축소"
          >
            <ZoomOut size={20} />
          </button>
          
          <span style={{
            color: '#FFFFFF',
            fontSize: '14px',
            minWidth: '60px',
            textAlign: 'center'
          }}>
            {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={handleZoomIn}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '4px',
              padding: '8px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="확대"
          >
            <ZoomIn size={20} />
          </button>
          
          <button
            onClick={handleRotate}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '4px',
              padding: '8px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="회전"
          >
            <RotateCw size={20} />
          </button>
          
          <button
            onClick={handleReset}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'Pretendard'
            }}
            title="원본 크기"
          >
            원본
          </button>
          
          <button
            onClick={onDownload}
            style={{
              background: '#3A87EE',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontFamily: 'Pretendard'
            }}
            title="다운로드"
          >
            <Download size={16} />
            다운로드
          </button>
          
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '4px',
              padding: '8px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="닫기"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px 20px',
          overflow: 'hidden',
          width: '100%',
          height: '100%'
        }}
        onClick={onClose}
      >
        <img
          src={imageUrl}
          alt={fileName}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.3s ease',
            cursor: zoom > 1 ? 'grab' : 'zoom-in',
            objectFit: 'contain'
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (zoom === 1) {
              handleZoomIn();
            }
          }}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>

      {/* Footer Info */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40px',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#A5ACBA',
        fontSize: '14px',
        fontFamily: 'Pretendard'
      }}>
        이미지를 클릭하면 확대됩니다. 마우스 휠로 확대/축소, 배경을 클릭하면 닫힙니다.
      </div>
    </div>
  );
};

export default ImageViewer;
