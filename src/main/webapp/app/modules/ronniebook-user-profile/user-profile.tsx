import React, { useState, ChangeEvent, useEffect } from 'react';
import { Camera, Edit2, Check, X, User, Mail, FileText } from 'lucide-react';
import './user-profile.scss';
import { useAppSelector } from '../../config/store';
import toast, { Toaster } from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
}

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    profileImage: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const [editData, setEditData] = useState<ProfileData>({ ...profileData });
  const account = useAppSelector(state => state.authentication.account);
  const cached = sessionStorage.getItem('cachedUserProfile');
  const [createdDate, setCreatedDate] = useState('');

  useEffect(() => {
    if (cached) {
      const cachedData = JSON.parse(cached);
      setProfileData(cachedData);
      setEditData(cachedData);
    } else if (account) {
      const initialData: ProfileData = {
        firstName: account.firstName || '',
        lastName: account.lastName || '',
        email: account.email || '',
        profileImage: account.imageUrl || null,
      };
      setProfileData(initialData);
      setEditData(initialData);
    }

    fetchUserInfo();
  }, [account]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...profileData });
  };

  const fetchUserInfo = () => {
    fetch('http://localhost:9000/api/user-profile/info')
      .then(response => response.json())
      .then(data => {
        if (data && data.imageUrl) {
          setProfileData(prev => ({ ...prev, profileImage: data.imageUrl }));
          setEditData(prev => ({ ...prev, profileImage: data.imageUrl }));
        }
        setCreatedDate(data.createdDate);
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
      });
  };

  const getXsrfToken = () => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? match[1] : null;
  };

  const handleSave = () => {
    const token = getXsrfToken();

    if (!token) {
      console.error('XSRF token is missing');
      toast.error('Failed to update profile: XSRF token is missing');
      return;
    }

    setIsLoading(true);

    const userProfileData = {
      firstName: editData.firstName,
      lastName: editData.lastName,
      email: editData.email,
    };

    fetch(`http://localhost:9000/api/user-profile/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'X-XSRF-TOKEN': token,
      },
      body: JSON.stringify(userProfileData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Profile updated:', data);
        setProfileData({ ...editData });
        setIsEditing(false);
        sessionStorage.setItem('cachedUserProfile', JSON.stringify(data)); // Cache the updated profile data
        toast.success('Profile updated successfully');
      })
      .catch(error => {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
      })
      .finally(() => {
        setIsLoading(false);
      });
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
      const token = getXsrfToken();

      if (!token) {
        console.error('XSRF token is missing');
        toast.error('Failed to upload image: XSRF token is missing');
        return;
      }

      setIsLoading(true);

      const formData = new FormData();
      formData.append('image', file);

      fetch(`http://localhost:9000/api/user-profile/upload-image`, {
        method: 'POST',
        headers: {
          Accept: '*/*',
          'X-XSRF-TOKEN': token,
        },
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          console.log('Image uploaded:', data);
          const newImageUrl = data.imageUrl || null;
          setProfileData(prev => ({ ...prev, profileImage: newImageUrl }));
          if (isEditing) {
            setEditData(prev => ({ ...prev, profileImage: newImageUrl }));
          }
          toast.success('Image uploaded successfully');
        })
        .catch(error => {
          console.error('Error uploading image:', error);
          toast.error('Failed to upload image');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const displayData = isEditing ? editData : profileData;

  // Format dates and calculate profile completion
  const memberSince = createdDate ? dayjs(createdDate).format('MM/YYYY') : 'N/A';
  const lastUpdated = account?.lastModifiedDate ? dayjs(account.lastModifiedDate).fromNow() : 'N/A';
  const accountStatus = account?.activated ? 'Active' : 'Inactive';
  const statusClass = accountStatus === 'Active' ? 'active' : 'inactive';

  // Profile completion calculation based on ProfileData fields
  const profileFields = Object.values(profileData);
  const filledFields = profileFields.filter(v => v !== null && v !== undefined && v !== '').length;
  const profileCompletion = Math.round((filledFields / profileFields.length) * 100);

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
                <label htmlFor="profile-upload" className={`camera-button ${isLoading ? 'disabled' : ''}`}>
                  <Camera />
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="profile-content">
            {/* Name Section */}
            <div className="name-section">
              {isEditing ? (
                <div className="name-inputs">
                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={e => handleInputChange('firstName', e.target.value)}
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={e => handleInputChange('lastName', e.target.value)}
                    placeholder="Last Name"
                  />
                </div>
              ) : (
                <h2>
                  {displayData.firstName} {displayData.lastName}
                </h2>
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

              {/* First Name Field */}
              <div className="info-field">
                <div className="field-header">
                  <User />
                  <label>First Name</label>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={e => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter your first name..."
                  />
                ) : (
                  <p className="field-content">{displayData.firstName}</p>
                )}
              </div>

              {/* Last Name Field */}
              <div className="info-field">
                <div className="field-header">
                  <User />
                  <label>Last Name</label>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={e => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter your last name..."
                  />
                ) : (
                  <p className="field-content">{displayData.lastName}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="save-button" disabled={isLoading}>
                    <Check />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={handleCancel} className="cancel-button" disabled={isLoading}>
                    <X />
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={handleEdit} className="edit-button" disabled={isLoading}>
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
              <span className="value">{memberSince}</span>
            </div>
            <div className="info-item">
              <span className="label">Profile completion:</span>
              <span className="value completion">{profileCompletion}%</span>
            </div>
            <div className="info-item">
              <span className="label">Account status:</span>
              <span className={`value ${statusClass}`}>{accountStatus}</span>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
