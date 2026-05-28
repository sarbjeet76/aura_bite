import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SellerSettings = () => {
  const { user, updateRestaurantLink } = useAuth();
  
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form inputs
  const [name, setName] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [address, setAddress] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageSourceType, setImageSourceType] = useState('url'); // 'url' or 'file'

  // Slidebar images gallery states
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState('');
  const [newImageSourceType, setNewImageSourceType] = useState('url');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size exceeds the 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result);
    };
    reader.onerror = () => {
      setFormError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleAddGalleryImage = () => {
    if (!newImage.trim()) return;
    if (images.length >= 10) {
      setFormError('Maximum of 10 gallery images allowed.');
      return;
    }
    setImages([...images, newImage.trim()]);
    setNewImage('');
  };

  const handleRemoveGalleryImage = (indexToRemove) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMoveGalleryImage = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    
    const updatedImages = [...images];
    const temp = updatedImages[index];
    updatedImages[index] = updatedImages[newIndex];
    updatedImages[newIndex] = temp;
    setImages(updatedImages);
  };

  const handleGalleryImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size exceeds the 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (images.length >= 10) {
        setFormError('Maximum of 10 gallery images allowed.');
        return;
      }
      setImages([...images, reader.result]);
    };
    reader.onerror = () => {
      setFormError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const fetchRestaurant = async () => {
    if (!user?.restaurantId) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`http://localhost:5000/api/restaurants/${user.restaurantId}`);
      if (res.data.success) {
        const rest = res.data.data.restaurant;
        setRestaurant(rest);
        
        setName(rest.name);
        setCuisineType(rest.cuisineType);
        setAddress(rest.address);
        setOpeningHours(rest.openingHours);
        setDescription(rest.description);
        setImageUrl(rest.imageUrl);
        setImages(rest.images || []);
        if (rest.imageUrl && rest.imageUrl.startsWith('data:image')) {
          setImageSourceType('file');
        } else {
          setImageSourceType('url');
        }
      }
    } catch (error) {
      console.error('Error fetching restaurant settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitLoading(true);

    if (!name || !cuisineType || !address || !openingHours || !description) {
      setFormError('Please fill in all required fields.');
      setSubmitLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        cuisineType,
        address,
        openingHours,
        description,
        imageUrl: imageUrl.trim() || undefined,
        images: images
      };

      let res;
      if (restaurant) {
        // Edit existing
        res = await axios.put(`http://localhost:5000/api/restaurants/${restaurant._id}`, payload);
      } else {
        // Create new
        res = await axios.post('http://localhost:5000/api/restaurants', payload);
      }

      if (res.data.success) {
        setFormSuccess(restaurant ? 'Storefront details saved successfully!' : 'Restaurant storefront established successfully!');
        const updatedRest = res.data.data;
        setRestaurant(updatedRest);
        
        // Sync context
        if (!restaurant) {
          updateRestaurantLink(updatedRest._id);
        }
      }
    } catch (error) {
      setFormError(error.response?.data?.message || 'Action failed. Name might already be taken.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        gap: '1rem'
      }}>
        <div className="pulse-glow-box" style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '3px solid var(--accent-gold)',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)' }}>Configuring settings board...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ marginTop: '3rem', paddingBottom: '5rem', maxWidth: '800px' }}>
      <h1 style={{
        fontFamily: 'var(--font-title)',
        fontSize: '2.2rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <i className="fa-solid fa-gears" style={{ color: 'var(--accent-gold)' }}></i>
        Storefront Configurations
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
        {restaurant
          ? 'Modify and fine-tune your public store card and kitchen hours.'
          : 'Establish your brand storefront. Create restaurant details to start building menus and receiving customer orders.'}
      </p>

      <div className="glass-panel" style={{ padding: '2.5rem 2rem', background: 'var(--bg-secondary)' }}>
        
        {formError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            color: 'var(--accent-coral)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.85rem'
          }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '0.5rem' }}></i>
            {formError}
          </div>
        )}

        {formSuccess && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            borderColor: 'rgba(245, 158, 11, 0.3)',
            color: 'var(--accent-gold)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.85rem'
          }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: '0.5rem' }}></i>
            {formSuccess}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="restName">Brand Store Name</label>
              <input
                id="restName"
                type="text"
                className="form-input"
                placeholder="e.g. Trattoria Toscana"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="restCuisine">Cuisine Genre</label>
              <input
                id="restCuisine"
                type="text"
                className="form-input"
                placeholder="e.g. Italian, Japanese Fusion"
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="restAddress">Physical Address</label>
              <input
                id="restAddress"
                type="text"
                className="form-input"
                placeholder="e.g. 42 Gourmet Way, Suite 1B"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="restHours">Opening Hours</label>
              <input
                id="restHours"
                type="text"
                className="form-input"
                placeholder="e.g. 11:00 AM - 11:00 PM"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="restDesc">Brand Story / Short Description</label>
            <textarea
              id="restDesc"
              className="form-input"
              rows="4"
              placeholder="Tell your customers about your culinary heritage, chef credentials, or kitchen environment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          <div className="form-group">
            <label>Cover Showcase Image</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <button 
                type="button" 
                onClick={() => setImageSourceType('url')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: imageSourceType === 'url' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                  color: imageSourceType === 'url' ? '#000' : 'var(--text-secondary)',
                  border: '1px solid var(--border-glass)',
                  transition: 'all 0.2s'
                }}
              >
                <i className="fa-solid fa-link" style={{ marginRight: '0.25rem' }}></i>
                Image URL
              </button>
              <button 
                type="button" 
                onClick={() => setImageSourceType('file')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: imageSourceType === 'file' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                  color: imageSourceType === 'file' ? '#000' : 'var(--text-secondary)',
                  border: '1px solid var(--border-glass)',
                  transition: 'all 0.2s'
                }}
              >
                <i className="fa-solid fa-cloud-arrow-up" style={{ marginRight: '0.25rem' }}></i>
                Upload JPEG/PNG
              </button>
            </div>

            {imageSourceType === 'url' ? (
              <input
                id="restCover"
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            ) : (
              <div style={{ position: 'relative' }}>
                <input
                  id="restCoverFile"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageFileUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="restCoverFile" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.25rem 1rem',
                  border: '2px dashed var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  background: 'rgba(0,0,0,0.15)',
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}>
                  <i className="fa-solid fa-image" style={{ fontSize: '1.5rem', color: 'var(--accent-gold)' }}></i>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                    {imageUrl && imageUrl.startsWith('data:image') ? '✓ Cover Loaded successfully' : 'Choose local JPEG/PNG file'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Max size: 5MB</span>
                </label>
              </div>
            )}

            {/* Dynamic Thumbnail Preview */}
            {imageUrl && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginTop: '0.75rem',
                padding: '0.5rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)'
              }}>
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cover Preview Loaded</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setImageUrl('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-coral)',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Interactive Slidebar Gallery Images Manager */}
          <div className="form-group" style={{ marginTop: '2rem', borderTop: '1px solid var(--border-glass)', paddingTop: '2rem' }}>
            <label style={{ color: 'var(--accent-gold)', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-images"></i>
              Storefront Slidebar Showcase Photos (Max 10)
            </label>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
              Configure a beautiful photo slideshow to showcase your ambiance, signature dishes, or team! If left empty, it will fall back to displaying your single cover image.
            </p>

            {/* Grid display of current gallery images */}
            {images.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'rgba(0,0,0,0.15)',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)'
              }}>
                {images.map((img, idx) => (
                  <div key={idx} style={{
                    position: 'relative',
                    aspectRatio: '16/10',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-glass)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <img 
                      src={img} 
                      alt={`Slide ${idx + 1}`} 
                      style={{ width: '100%', height: '70%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150'; }}
                    />
                    <div style={{
                      height: '30%',
                      background: 'rgba(0,0,0,0.6)',
                      display: 'flex',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                      padding: '0 0.25rem'
                    }}>
                      <button 
                        type="button" 
                        onClick={() => handleMoveGalleryImage(idx, -1)}
                        disabled={idx === 0}
                        style={{ background: 'none', border: 'none', color: idx === 0 ? 'var(--text-muted)' : 'var(--text-primary)', cursor: idx === 0 ? 'default' : 'pointer', fontSize: '0.75rem' }}
                      >
                        <i className="fa-solid fa-arrow-left"></i>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveGalleryImage(idx)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-coral)', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleMoveGalleryImage(idx, 1)}
                        disabled={idx === images.length - 1}
                        style={{ background: 'none', border: 'none', color: idx === images.length - 1 ? 'var(--text-muted)' : 'var(--text-primary)', cursor: idx === images.length - 1 ? 'default' : 'pointer', fontSize: '0.75rem' }}
                      >
                        <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Form to add a new image to gallery */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed var(--border-glass)',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Add New Gallery Photo</label>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={() => setNewImageSourceType('url')}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: newImageSourceType === 'url' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                    color: newImageSourceType === 'url' ? '#000' : 'var(--text-secondary)',
                    border: '1px solid var(--border-glass)',
                    transition: 'all 0.2s'
                  }}
                >
                  Image URL
                </button>
                <button 
                  type="button" 
                  onClick={() => setNewImageSourceType('file')}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: newImageSourceType === 'file' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                    color: newImageSourceType === 'file' ? '#000' : 'var(--text-secondary)',
                    border: '1px solid var(--border-glass)',
                    transition: 'all 0.2s'
                  }}
                >
                  Upload JPEG/PNG
                </button>
              </div>

              {newImageSourceType === 'url' ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    style={{ flexGrow: 1, marginBottom: 0 }}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddGalleryImage}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    Add Slide
                  </button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <input
                    id="galleryImageFile"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleGalleryImageFileUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="galleryImageFile" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    border: '2px dashed var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    background: 'rgba(0,0,0,0.15)',
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.2s'
                  }}>
                    <i className="fa-solid fa-plus" style={{ fontSize: '1.2rem', color: 'var(--accent-gold)' }}></i>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Select and Add Local JPEG/PNG File</span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Max size: 5MB</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitLoading} style={{
            width: '100%',
            padding: '0.9rem',
            fontSize: '1.05rem',
            marginTop: '1.5rem'
          }}>
            {submitLoading ? 'Saving Configurations...' : restaurant ? 'Save Configurations' : 'Establish Storefront'}
          </button>
        </form>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SellerSettings;
