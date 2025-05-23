import React, { useState, ChangeEvent } from 'react';
import { Camera, Edit2, Check, X, User, Mail, FileText } from 'lucide-react';
import './user-profile.scss';

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  profileImage: string | null;
}

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    bio: 'Full-stack developer passionate about creating user-friendly applications. I love exploring new technologies and contributing to open-source projects.',
    profileImage: null,
  });

  const [editData, setEditData] = useState<ProfileData>({ ...profileData });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...profileData });
  };

  const handleSave = () => {
    setProfileData({ ...editData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const imageUrl = e.target?.result as string;
        if (imageUrl) {
          if (isEditing) {
            setEditData(prev => ({ ...prev, profileImage: imageUrl }));
          } else {
            setProfileData(prev => ({ ...prev, profileImage: imageUrl }));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const displayData = isEditing ? editData : profileData;

  return (
    <div className="user-profile">
      <div className="profile-container">
        {/* Header */}
        <div className="header">
          <h1>Profile Settings</h1>
          <p>Manage your personal information and preferences</p>
        </div>

        {/* Main Profile Card */}
        <div className="profile-card">
          {/* Profile Header Section */}
          <div className="profile-header">
            <div className="profile-picture-container">
              <div className="profile-picture-wrapper">
                <div className="profile-picture">
                  {displayData.profileImage ? (
                    <img src={displayData.profileImage} alt="Profile" />
                  ) : (
                    <div className="avatar-placeholder">
                      <User />
                    </div>
                  )}
                </div>
                {/* Camera Button */}
                <label htmlFor="profile-upload" className="camera-button">
                  <Camera />
                </label>
                <input id="profile-upload" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="profile-content">
            {/* Name Section */}
            <div className="name-section">
              {isEditing ? (
                <input type="text" value={editData.name} onChange={e => handleInputChange('name', e.target.value)} />
              ) : (
                <h2>{displayData.name}</h2>
              )}
            </div>

            {/* Information Fields */}
            <div className="info-fields">
              {/* Email Field */}
              <div className="info-field">
                <div className="field-header">
                  <Mail />
                  <label>Email</label>
                </div>
                {isEditing ? (
                  <input type="email" value={editData.email} onChange={e => handleInputChange('email', e.target.value)} />
                ) : (
                  <p className="field-content">{displayData.email}</p>
                )}
              </div>

              {/* Bio Field */}
              <div className="info-field">
                <div className="field-header">
                  <FileText />
                  <label>Bio</label>
                </div>
                {isEditing ? (
                  <textarea
                    value={editData.bio}
                    onChange={e => handleInputChange('bio', e.target.value)}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="field-content bio">{displayData.bio}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="save-button">
                    <Check />
                    Save Changes
                  </button>
                  <button onClick={handleCancel} className="cancel-button">
                    <X />
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={handleEdit} className="edit-button">
                  <Edit2 />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="account-info-card">
          <h3>Account Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Member since:</span>
              <span className="value">January 2024</span>
            </div>
            <div className="info-item">
              <span className="label">Profile completion:</span>
              <span className="value completion">85%</span>
            </div>
            <div className="info-item">
              <span className="label">Account status:</span>
              <span className="value active">Active</span>
            </div>
            <div className="info-item">
              <span className="label">Last updated:</span>
              <span className="value">2 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
