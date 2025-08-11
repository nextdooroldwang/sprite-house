import React from 'react';
import { generateAvatarList, getAvatarSelectorStyle } from '../utils/avatarUtils';

interface AvatarSelectorProps {
  selectedAvatar: string;
  onAvatarSelect: (avatarId: string) => void;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ selectedAvatar, onAvatarSelect }) => {
  const avatarList = generateAvatarList();

  return (
    <div className="avatar-selector">
      <div className="avatar-grid">
        {avatarList.map((avatar) => (
          <div
            key={avatar.id}
            className={`avatar-option ${selectedAvatar === avatar.id ? 'selected' : ''}`}
            onClick={() => onAvatarSelect(avatar.id)}
            style={{
              ...getAvatarSelectorStyle(avatar, 64),
              cursor: 'pointer',
              border: selectedAvatar === avatar.id ? '3px solid #3498db' : '2px solid #ddd',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              transform: selectedAvatar === avatar.id ? 'scale(1.1)' : 'scale(1)',
              boxShadow: selectedAvatar === avatar.id ? '0 4px 8px rgba(52, 152, 219, 0.3)' : 'none'
            }}
            title={avatar.name}
          />
        ))}
      </div>
      
      <style>{`
        .avatar-selector {
          margin: 1rem 0;
        }
        
        .avatar-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          max-width: 240px;
          margin: 0 auto;
        }
        
        .avatar-option {
          position: relative;
        }
        
        .avatar-option:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
        }
      `}</style>
    </div>
  );
};

export default AvatarSelector;