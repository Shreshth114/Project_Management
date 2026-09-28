import React, { useState, useRef, useEffect } from 'react';
import { User, Edit, Camera, CheckCircle, Mail, Phone, BookOpen, Clock, Shield, Upload, X, Link } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { authService } from '../../services/authService';
import { supabase } from '../../lib/supabase';

import { predefinedAvatars } from '../../components/common/Avatar';

export const Profile = () => {
  const { currentUser, currentRole, data, refreshProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    phone: '',
    bio: '',
    linkedin_url: '',
    github_url: ''
  });

  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarFormData, setAvatarFormData] = useState({ avatar_url: '' });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        gender: currentUser.gender || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || '',
        linkedin_url: currentUser.linkedin_url || '',
        github_url: currentUser.github_url || ''
      });
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="stagger-1">
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)' }}>Account Profile</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Manage your personal information and profile settings.
        </p>
      </div>

      {success && (
        <div className="alert alert-success stagger-1">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger stagger-1">
          <X size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid-2 stagger-2">
        <Card title="Profile">
          {!isEditingAvatar ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
              <button
                type="button"
                className="avatar-edit-wrapper"
                onClick={() => setIsEditingAvatar(true)}
                aria-label="Change profile picture"
                title="Change Profile Picture"
              >
                <Avatar user={currentUser} size={100} style={{ border: '4px solid var(--bg-page)' }} />
                <div className="avatar-edit-overlay">
                  <Edit size={16} />
                </div>
              </button>

              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                  {currentUser.name}
                </h2>
                <div style={{ marginTop: '6px' }}>
                  <Badge variant={currentRole === 'STUDENT' ? 'info' : (currentRole === 'ADMIN' ? 'danger' : 'magenta')}>
                    {currentRole}
                  </Badge>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Mail size={14} />
                  {currentUser.email}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveAvatar} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>Change Profile Picture</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '600px' }}>
                {predefinedAvatars.map(avatar => (
                  <button
                    type="button"
                    key={avatar.id}
                    onClick={() => setAvatarFormData({ avatar_url: avatar.id })}
                    className={`avatar-select-btn ${avatarFormData.avatar_url === avatar.id ? 'active' : ''}`}
                    aria-label={`Select avatar ${avatar.id.replace('avatar_', '')}`}
                  >
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
                      {avatar.svg}
                    </div>
                  </button>
                ))}

                {/* Initials Option */}
                <button
                  type="button"
                  onClick={() => setAvatarFormData({ avatar_url: 'initials' })}
                  className={`avatar-select-btn ${avatarFormData.avatar_url === 'initials' || !avatarFormData.avatar_url ? 'active' : ''}`}
                  aria-label="Select initials avatar"
                  title="Initials"
                >
                  <Avatar user={{ name: formData.name || currentUser.name, avatar_url: 'initials' }} size={50} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
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
          )}
        </Card>

        <Card title="Personal Information" action={
          !isEditing ? (
            <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(true)}>
              <Edit size={14} style={{ marginRight: '6px' }} />
              Edit Profile
            </button>
          ) : null
        }>
          {!isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="grid-2">
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>Full Name</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>{currentUser.name || 'Not provided'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>Gender</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>{currentUser.gender || 'Prefer not to say'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>Phone Number</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>{currentUser.phone || 'Not provided'}</div>
                </div>
                {currentUser.bio && (
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>About Me</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{currentUser.bio}</div>
                  </div>
                )}
              </div>

              {(currentUser.github_url || currentUser.linkedin_url) && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '16px' }}>Professional Links</div>
                  <div className="grid-2">
                    {currentUser.github_url && (
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-disabled)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                          <Link size={12} /> GitHub
                        </div>
                        <a href={currentUser.github_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--rit-orange-red)', textDecoration: 'none', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {currentUser.github_url.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                      </div>
                    )}
                    {currentUser.linkedin_url && (
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-disabled)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                          <Link size={12} /> LinkedIn
                        </div>
                        <a href={currentUser.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--rit-orange-red)', textDecoration: 'none', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {currentUser.linkedin_url.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Removed Avatar Selector from here */}

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

              <div className="grid-2">
                <div>
                  <label className="form-label">Gender</label>
                  <select
                    className="form-input"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91..."
                  />
                </div>
              </div>

              <div>
                <label className="form-label">About Me (Optional)</label>
                <textarea
                  className="form-input form-textarea"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us a little about yourself..."
                  maxLength={300}
                  style={{ height: '80px', resize: 'vertical' }}
                />
                <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-disabled)', marginTop: '4px' }}>
                  {formData.bio.length} / 300
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label className="form-label">LinkedIn Profile (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/your-profile"
                    pattern="^https:\/\/(www\.)?linkedin\.com\/.*$"
                    title="Must be a valid LinkedIn URL"
                  />
                </div>
                <div>
                  <label className="form-label">GitHub Profile (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/username"
                    pattern="^https:\/\/(www\.)?github\.com\/.*$"
                    title="Must be a valid GitHub URL"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </Card>
      </div>

      <div className="stagger-3">
        <Card title="Academic / Role Information">
          <div className="grid-3" style={{ gap: '20px' }}>
            {currentRole === 'STUDENT' && (
              <>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>USN</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>{currentUser.usn || currentUser.student_id || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>Department</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>{currentUser.department || 'Computer Science'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>Academic Year</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>{currentUser.year || '4th Year'}</div>
                </div>
              </>
            )}

            {(currentRole === 'FACULTY' || currentRole === 'COORDINATOR') && (
              <>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>Faculty ID</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>{currentUser.faculty_id || currentUser.user_id || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>Department</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>{currentUser.department || 'Computer Science'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>Role Details</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>{currentUser.is_coordinator ? 'Coordinator' : 'Faculty Guide'}</div>
                </div>
              </>
            )}

            {currentRole === 'ADMIN' && (
              <>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>Admin ID</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>{currentUser.admin_id || currentUser.user_id || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>Access Level</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>System Administrator</div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="stagger-4">
        <Card title="Account Security">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={16} color="var(--badge-success-text)" />
              <span style={{ fontSize: '14px', color: 'var(--text-heading)' }}>Email verification status: <span style={{ color: 'var(--badge-success-text)', fontWeight: 700 }}>Verified ✓</span></span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} />
              Account ID: {currentUser.auth_id || currentUser.user_id}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              To change your email address or password, please contact the system administrator.
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
};
