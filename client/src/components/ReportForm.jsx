import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';
import './ReportForm.css';

const ReportForm = ({ selectedLocation, onClearLocation, onRefreshReports }) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const categories = [
    { value: 'parking', label: '🚗 Parking Issue', description: 'Parking unavailability, broken barriers, etc.' },
    { value: 'traffic', label: '🚦 Traffic Condition', description: 'Heavy traffic, roadblocks, accidents' },
    { value: 'facility', label: '🏢 Facility Issue', description: 'Broken elevators, water, security' },
    { value: 'metro', label: '🚇 Metro/Transit', description: 'Delays, closures, service issues' },
    { value: 'safety', label: '⚠️ Safety Concern', description: 'Security, lighting, suspicious activity' },
    { value: 'general', label: '📝 General', description: 'Other issues or information' }
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      return data.imageUrl;
    } catch (err) {
      alert('Image upload failed. Submitting report without image.');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      alert('Please click on the map to select a location for your report.');
      return;
    }
    
    if (!description.trim()) {
      alert('Please enter a description for your report.');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      let imageUrl = null;
      
      // Upload image if selected
      if (selectedImage) {
        setIsUploadingImage(true);
        imageUrl = await uploadImage(selectedImage);
        setIsUploadingImage(false);
      }

      // Convert selectedLocation to array format [lat, lng] if it's an object
      let locationArray;
      if (Array.isArray(selectedLocation)) {
        locationArray = selectedLocation;
      } else if (selectedLocation.lat !== undefined && selectedLocation.lng !== undefined) {
        locationArray = [selectedLocation.lat, selectedLocation.lng];
      } else {
        locationArray = selectedLocation;
      }

      const reportData = {
        location: locationArray,
        description: description.trim(),
        category: category,
        imageUrl: imageUrl
      };

      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });
      
      if (response.ok) {
        setSuccessMessage('Report submitted successfully!');
        setDescription('');
        setSelectedImage(null);
        setImagePreview(null);
        
        // Refresh the reports list to show the new report on the map
        if (onRefreshReports) {
          onRefreshReports();
        }
        
        if (onClearLocation) {
          setTimeout(() => {
            onClearLocation();
          }, 500);
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-form-content">
      <h3>Submit a Report</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="location">Location:</label>
          <input 
            type="text" 
            id="location"
            className="location-display"
            value={selectedLocation ? 
              (Array.isArray(selectedLocation) 
                ? `${selectedLocation[0].toFixed(4)}, ${selectedLocation[1].toFixed(4)}`
                : selectedLocation.lat !== undefined && selectedLocation.lng !== undefined
                  ? `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`
                  : 'Invalid location format'
              ) : 
              'Click on the map to select a location'
            }
            readOnly
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <select 
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="category-select"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <small>{categories.find(c => c.value === category)?.description}</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail..."
            rows="4"
            required
            minLength="10"
            maxLength="1000"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Image (Optional):</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageSelect}
            className="image-input"
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <button type="button" onClick={removeImage} className="remove-image-btn">
                Remove Image
              </button>
            </div>
          )}
          <small>Maximum file size: 5MB. Supported formats: JPG, PNG, GIF</small>
        </div>
        
        <button 
          type="submit" 
          className="btn"
          disabled={isSubmitting || !selectedLocation || isUploadingImage}
        >
          {isSubmitting ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LoadingSpinner size="small" text="" />
              {isUploadingImage ? 'Uploading image...' : 'Submitting...'}
            </div>
          ) : 'Submit Report'}
        </button>
        
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
      </form>
      
      <div className="help-text">
        <p><strong>How to use:</strong></p>
        <ol>
          <li>Click anywhere on the map to select a location</li>
          <li>Enter a description of the issue or information</li>
          <li>Click "Submit Report" to send your report</li>
        </ol>
        <p>Your reports help improve the Park & Ride+ Delhi NCR service for everyone!</p>
        <p><small>Report issues like: parking unavailability, metro delays, traffic conditions, facility problems, etc.</small></p>
      </div>
    </div>
  );
};

export default ReportForm;
