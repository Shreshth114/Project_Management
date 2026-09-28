import React, { useState, useEffect } from 'react';
import { Edit, CheckCircle, Mail, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { authService } from '../../services/authService';
import { predefinedAvatars } from '../../components/common/Avatar';

export const Profile = () => {
  const { currentUser, currentRole, refreshProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({ name: '' });
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarFormData, setAvatarFormData] = useState({ avatar_url: '' });

  useEffect(() => {
    if (currentUser) {
      setFormData({ name: currentUser.name || '' });
      setAvatarFormData({
        avatar_url: currentUser.avatar_url || 'initials'
      });
    }
  }, [currentUser]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3500);
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authService.updateProfile(currentUser.user_id, formData);
      if (typeof refreshProfile === 'function') {
        await refreshProfile();
      }
      showSuccess('Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      showError('Failed to save profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAvatar = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authService.updateProfile(currentUser.user_id, avatarFormData);
      if (typeof refreshProfile === 'function') {
        await refreshProfile();
      }
      showSuccess('Profile picture updated.');
      setIsEditingAvatar(false);
    } catch (err) {
      console.error(err);
      showError('Failed to save profile picture: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ width: '100%', maxWidth: '650px', marginBottom: '24px' }} className="stagger-1">
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)' }}>Account Profile</h1>
      </div>

      {success && (
        <div className="alert alert-success stagger-1" style={{ width: '100%', maxWidth: '650px', marginBottom: '16px' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger stagger-1" style={{ width: '100%', maxWidth: '650px', marginBottom: '16px' }}>
          <X size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{
        width: '100%',
        maxWidth: '650px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        overflow: 'hidden'
      }} className="stagger-2">
        {/* TOP BANNER */}
        <div style={{
          height: '100px',
          background: 'linear-gradient(135deg, #8E00A8 0%, #B8115B 100%)',
          position: 'relative'
        }}></div>

        <div style={{ padding: '0 32px 32px 32px', position: 'relative' }}>
          {/* AVATAR */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '-50px', 
            marginBottom: '20px' 
          }}>
            <button
              type="button"
              onClick={() => setIsEditingAvatar(true)}
              aria-label="Change profile picture"
              title="Change Profile Picture"
              style={{
                position: 'relative',
                display: 'inline-block',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <Avatar user={currentUser} size={100} style={{ border: '4px solid var(--bg-surface)' }} />
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                backgroundColor: 'var(--rit-magenta)',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid var(--bg-surface)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                zIndex: 2,
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Edit size={14} />
              </div>
            </button>
          </div>

          {/* AVATAR EDIT FORM */}
          {isEditingAvatar && (
            <div style={{ 
              marginBottom: '32px', 
              padding: '20px', 
              backgroundColor: 'var(--bg-sidebar)', 
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <form onSubmit={handleSaveAvatar} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>Choose Profile Picture</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                  {predefinedAvatars.map(avatar => (
                    <button
                      type="button"
                      key={avatar.id}
                      onClick={() => setAvatarFormData({ avatar_url: avatar.id })}
                      style={{
                        padding: '4px',
                        border: avatarFormData.avatar_url === avatar.id ? '2px solid var(--rit-magenta)' : '2px solid transparent',
                        borderRadius: '50%',
                        background: 'transparent',
                        cursor: 'pointer'
                      }}
                      aria-label={`Select avatar ${avatar.id.replace('avatar_', '')}`}
                    >
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden' }}>
                        {avatar.svg}
                      </div>
                    </button>
                  ))}

                  {/* Initials Option */}
                  <button
                    type="button"
                    onClick={() => setAvatarFormData({ avatar_url: 'initials' })}
                    style={{
                        padding: '4px',
                        border: (avatarFormData.avatar_url === 'initials' || !avatarFormData.avatar_url) ? '2px solid var(--rit-magenta)' : '2px solid transparent',
                        borderRadius: '50%',
                        background: 'transparent',
                        cursor: 'pointer'
                      }}
                    aria-label="Select initials avatar"
                    title="Initials"
                  >
                    <Avatar user={{ name: formData.name || currentUser.name, avatar_url: 'initials' }} size={40} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Avatar'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setAvatarFormData({ avatar_url: currentUser.avatar_url || 'initials' });
                      setIsEditingAvatar(false);
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* HEADER INFO */}
          {!isEditing ? (
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 8px 0' }}>
                {currentUser.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
                <Badge variant={currentRole === 'STUDENT' ? 'info' : (currentRole === 'ADMIN' ? 'danger' : 'magenta')}>
                  {currentRole}
                </Badge>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Mail size={16} />
                {currentUser.email}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: 'var(--bg-sidebar)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)} disabled={loading}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DIVIDER */}
          <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0 0 24px 0' }}></div>

          {/* ACADEMIC INFO */}
          <div className="grid-2" style={{ gap: '24px', marginBottom: '32px' }}>
            {currentRole === 'STUDENT' && (
              <>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>USN</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    {currentUser.usn || currentUser.student_id || 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Department</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    Information Science & Engineering
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Subject</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    {currentUser.subjectName 
                      ? `${currentUser.subjectCode ? currentUser.subjectCode + ' - ' : ''}${currentUser.subjectName}` 
                      : (currentUser.subject_name || currentUser.subject_code || 'N/A')}
                  </div>
                </div>
              </>
            )}

            {(currentRole === 'FACULTY' || currentRole === 'COORDINATOR') && (
              <>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Faculty ID</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    {currentUser.faculty_id || currentUser.user_id || 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Department</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    Information Science & Engineering
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Role Details</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    {currentUser.is_coordinator ? 'Coordinator' : 'Faculty Guide'}
                  </div>
                </div>
              </>
            )}

            {currentRole === 'ADMIN' && (
              <>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Admin ID</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    {currentUser.admin_id || currentUser.user_id || 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Access Level</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)' }}>
                    System Administrator
                  </div>
                </div>
              </>
            )}
          </div>

          {/* EDIT BUTTON */}
          {!isEditing && !isEditingAvatar && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setIsEditing(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Edit size={16} />
                Edit Profile
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
