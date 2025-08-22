import React, { useState } from 'react';
import { Image, Eye, Download } from 'lucide-react';
import ImageViewer from './ImageViewer';

interface RequestDetailsProps {
  file: File | null;
  onReset: () => void;
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ file, onReset }) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const getImageUrl = (file: File) => {
    return URL.createObjectURL(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    if (!file) return;

    const url = getImageUrl(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // URL 정리
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleViewImage = () => {
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
  };

  return (
    <>
      <div className="panel-title">
        <h2>요청 세부정보</h2>
      </div>
      
      <div className="request-details">
        <div className="attached-section">
          <div className="attached-label">
            <Image size={14} style={{ color: '#A5ACBA' }} />
            <span>첨부됨</span>
          </div>
          
          <div className="preview-area">
            {file && (
              <>
                <img
                  src={getImageUrl(file)}
                  alt="Uploaded file"
                  className="attached-image"
                  onClick={handleViewImage}
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  }}
                  title="클릭하여 이미지 크게 보기"
                />
                <div className="file-info">
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    flex: 1
                  }}>
                    <span className="file-name">{file.name}</span>
                    <span style={{
                      fontSize: '12px',
                      color: '#A5ACBA',
                      fontFamily: 'Pretendard'
                    }}>
                      {formatFileSize(file.size)} • {file.type}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    padding: '0px',
                    gap: '8px',
                    width: '80px',
                    height: '36px'
                  }}>
                    <button 
                      onClick={handleViewImage}
                      style={{
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '8px',
                        gap: '8px',
                        width: '36px',
                        height: '36px',
                        background: '#222C3D',
                        border: '1px solid #3D4B64',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2A3441';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#222C3D';
                      }}
                      title="이미지 크게 보기"
                    >
                      <Eye size={20} style={{ color: '#FFFFFF' }} />
                    </button>
                    <button 
                      onClick={handleDownload}
                      style={{
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '8px',
                        gap: '8px',
                        width: '36px',
                        height: '36px',
                        background: '#222C3D',
                        border: '1px solid #3D4B64',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2A3441';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#222C3D';
                      }}
                      title="이미지 다운로드"
                    >
                      <Download size={20} style={{ color: '#FFFFFF' }} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {file && (
        <ImageViewer
          isOpen={isViewerOpen}
          imageUrl={getImageUrl(file)}
          fileName={file.name}
          onClose={handleCloseViewer}
          onDownload={handleDownload}
        />
      )}
    </>
  );
};

export default RequestDetails;
