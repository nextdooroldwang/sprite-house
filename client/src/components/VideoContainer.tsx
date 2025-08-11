import React from 'react';
import { UI_CONFIG } from '../config/constants';

interface VideoContainerProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
}

const VideoContainer: React.FC<VideoContainerProps> = ({ localStream, remoteStreams }) => {
  return (
    <div className="video-container">
      {localStream && (
        <video
          autoPlay
          muted
          playsInline
          className={UI_CONFIG.LOCAL_VIDEO_CLASS}
          ref={(video) => {
            if (video && localStream) {
              video.srcObject = localStream;
            }
          }}
        />
      )}
      
      {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
        <video
          key={userId}
          autoPlay
          playsInline
          className={UI_CONFIG.VIDEO_ELEMENT_CLASS}
          ref={(video) => {
            if (video && stream) {
              video.srcObject = stream;
            }
          }}
        />
      ))}
    </div>
  );
};

export default VideoContainer;