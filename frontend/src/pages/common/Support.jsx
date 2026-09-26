import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Send, LifeBuoy, AlertCircle, CheckCircle, X, Image as ImageIcon } from 'lucide-react';

const Support = () => {
  const { currentRole } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    issueType: '',
    subject: '',
    description: ''
  });

  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    // Get the current session to ensure we are authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (attachments.length + files.length > 3) {
      setError('You can only attach up to 3 images.');
      return;
    }

    const validFiles = [];
    for (const file of files) {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Only PNG, JPG, and WEBP are allowed.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`File too large: ${file.name}. Maximum size is 5MB.`);
        return;
      }
      validFiles.push(file);
    }
    
    setAttachments(prev => [...prev, ...validFiles]);
    setError(null);
    e.target.value = null;
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      setError('You must be logged in to send a support request.');
      return;
    }
    
    if (!formData.issueType || !formData.subject || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.subject.length < 5 || formData.subject.length > 150) {
      setError('Subject must be between 5 and 150 characters.');
      return;
    }

    if (formData.description.length < 10 || formData.description.length > 5000) {
      setError('Description must be between 10 and 5000 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const attachmentPaths = [];
      
      if (attachments.length > 0) {
        for (const file of attachments) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${session.user.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('support-attachments')
            .upload(filePath, file);
            
          if (uploadError) {
            console.error('Upload Error:', uploadError);
            throw new Error(`Storage Error (${uploadError.code}): ${uploadError.message}. Ensure bucket 'support-attachments' exists.`);
          }
          
          attachmentPaths.push(filePath);
        }
      }

      const { data, error: functionError } = await supabase.functions.invoke('support', {
        body: {
          issueType: formData.issueType,
          subject: formData.subject,
          description: formData.description,
          role: currentRole,
          attachments: attachmentPaths
        }
      });

      if (functionError) {
        let actualErrorMsg = functionError.message || 'Unknown Edge Function Error';
        if (functionError.context && typeof functionError.context.json === 'function') {
          try {
            const errBody = await functionError.context.json();
            console.error('Edge Function Body:', errBody);
            actualErrorMsg = errBody.error || JSON.stringify(errBody);
            if (errBody.details) {
               actualErrorMsg += ' - ' + JSON.stringify(errBody.details);
            }
          } catch (e) {
            console.error('Failed to parse Edge Function error body', e);
          }
        }
        throw new Error(`Edge Function Error: ${actualErrorMsg}`);
      }

      if (data?.error) {
        const detailMsg = data.details?.message || data.details?.error || JSON.stringify(data.details || '');
        throw new Error(`Backend Error: ${data.error}. ${detailMsg}`);
      }

      setSuccess(true);
      setFormData({
        issueType: '',
        subject: '',
        description: ''
      });
      setAttachments([]);
      
      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Support Error:', err);
      setError(err.message || 'Unable to send your support request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-anim">
      <div style={{ marginBottom: '24px' }}>
        <h1 className="h2" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LifeBuoy size={24} color="var(--rit-orange-red)" />
          Help & Support
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Having an issue with the Project Management Portal? Tell us what happened and we'll look into it.
        </p>
      </div>

      <div className="card stagger-1" style={{ maxWidth: '600px' }}>
        {success && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px 16px', 
            backgroundColor: 'rgba(114, 140, 94, 0.1)', // var(--rit-sage) with opacity
            color: 'var(--rit-sage)', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(114, 140, 94, 0.2)',
            marginBottom: '20px',
            fontWeight: 600
          }}>
            <CheckCircle size={18} />
            Support request sent successfully. We'll look into it.
          </div>
        )}

        {error && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px 16px', 
            backgroundColor: 'rgba(230, 59, 0, 0.1)', // var(--rit-orange-red) with opacity
            color: 'var(--rit-orange-red)', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(230, 59, 0, 0.2)',
            marginBottom: '20px',
            fontWeight: 600
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="issueType">Issue Type</label>
            <select 
              id="issueType"
              name="issueType"
              className="form-input" 
              value={formData.issueType}
              onChange={handleInputChange}
              required
              disabled={loading}
            >
              <option value="" disabled>Select an issue type...</option>
              <option value="Bug">Bug / Technical Error</option>
              <option value="Login / Authentication">Login / Authentication</option>
              <option value="Submission">Submission Issue</option>
              <option value="Task / Milestone">Task / Milestone Issue</option>
              <option value="Account / Profile">Account / Profile Issue</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="subject">Subject</label>
            <input 
              type="text" 
              id="subject"
              name="subject"
              className="form-input" 
              placeholder="Brief description of the problem"
              value={formData.subject}
              onChange={handleInputChange}
              required
              minLength={5}
              maxLength={150}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Describe the problem</label>
            <textarea 
              id="description"
              name="description"
              className="form-input" 
              placeholder="Please provide as much detail as possible to help us resolve the issue..."
              style={{ minHeight: '150px', resize: 'vertical' }}
              value={formData.description}
              onChange={handleInputChange}
              required
              minLength={10}
              maxLength={5000}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Attachments (optional)</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                PNG, JPG or WEBP • Max 5 MB each • Up to 3 images
              </span>
            </label>
            
            <div style={{ 
              border: '2px dashed var(--border-color)', 
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              backgroundColor: 'var(--bg-secondary)',
              transition: 'border-color 0.2s ease',
              marginBottom: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {attachments.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {attachments.map((file, index) => (
                    <div key={index} style={{ 
                      position: 'relative', 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      overflow: 'hidden',
                      backgroundColor: 'var(--bg-surface)'
                    }}>
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Attachment ${index + 1}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                      />
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        disabled={loading}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        aria-label="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  
                  {attachments.length < 3 && (
                    <label 
                      htmlFor="attachments" 
                      style={{ 
                        width: '80px', 
                        height: '80px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px dashed var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                        backgroundColor: 'rgba(0,0,0,0.02)',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <span style={{ fontSize: '24px', lineHeight: 1 }}>+</span>
                    </label>
                  )}
                </div>
              )}

              {attachments.length === 0 && (
                <label 
                  htmlFor="attachments" 
                  style={{ 
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: loading ? 0.5 : 1,
                    padding: '20px 0'
                  }}
                >
                  <ImageIcon size={32} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                  <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                    Click to add screenshots
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    or drag and drop here
                  </span>
                </label>
              )}

              <input
                type="file"
                id="attachments"
                multiple
                accept=".png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
                disabled={loading || attachments.length >= 3}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              <Send size={16} />
              <span>{loading ? 'Sending...' : 'Send Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Support;
