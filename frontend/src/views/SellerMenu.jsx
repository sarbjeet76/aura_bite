import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SellerMenu = () => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for Add/Edit
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Mains');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageSourceType, setImageSourceType] = useState('url'); // 'url' or 'file'

  const [formError, setFormError] = useState('');
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

  const fetchMenu = async () => {
    if (!user?.restaurantId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/restaurants/${user.restaurantId}`);
      if (res.data.success) {
        setMenuItems(res.data.data.menuItems);
      }
    } catch (err) {
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !description || !price || !category) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        restaurantId: user.restaurantId,
        name,
        description,
        price: parseFloat(price),
        category,
        imageUrl: imageUrl.trim() || undefined,
        isAvailable
      };

      let res;
      if (isEditing) {
        res = await axios.put(`http://localhost:5000/api/menu/${editingId}`, payload);
      } else {
        res = await axios.post('http://localhost:5000/api/menu', payload);
      }

      if (res.data.success) {
        resetForm();
        fetchMenu();
      }
    } catch (error) {
      setFormError(error.response?.data?.message || 'Action failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStartEdit = (item) => {
    setIsEditing(true);
    setEditingId(item._id);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setCategory(item.category);
    setImageUrl(item.imageUrl);
    setIsAvailable(item.isAvailable);
    setFormError('');
    if (item.imageUrl && item.imageUrl.startsWith('data:image')) {
      setImageSourceType('file');
    } else {
      setImageSourceType('url');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const res = await axios.delete(`http://localhost:5000/api/menu/${itemId}`);
      if (res.data.success) {
        fetchMenu();
      }
    } catch (error) {
      alert('Delete failed.');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Mains');
    setImageUrl('');
    setIsAvailable(true);
    setFormError('');
    setImageSourceType('url');
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
        <p style={{ color: 'var(--text-secondary)' }}>Retrieving your menu catalogue...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user?.restaurantId) {
    return (
      <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
          <i className="fa-solid fa-store-slash" style={{ fontSize: '3.5rem', color: 'var(--accent-coral)', marginBottom: '1.5rem' }}></i>
          <h2>No Associated Restaurant Found</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem 0' }}>
            To begin publishing menu items, you must configure and register your restaurant storefront details first.
          </p>
          <a href="/seller/settings" className="btn btn-primary">Establish Your Storefront</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ marginTop: '3rem', paddingBottom: '5rem' }}>
      <h1 style={{
        fontFamily: 'var(--font-title)',
        fontSize: '2.2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <i className="fa-solid fa-pizza-slice" style={{ color: 'var(--accent-gold)' }}></i>
        Menu Workspace
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '3rem',
        alignItems: 'start'
      }}>
        {/* Left Side: Table List of items */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', marginBottom: '1.5rem' }}>
            Published Items ({menuItems.length})
          </h2>

          {menuItems.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>
              Your menu is empty. Publish dishes using the editor form on the right.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {menuItems.map((item) => (
                <div key={item._id} className="glass-panel" style={{
                  padding: '1rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  background: 'rgba(0, 0, 0, 0.15)'
                }}>
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    style={{
                      width: '65px',
                      height: '65px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=60';
                    }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</h4>
                      <span className="badge badge-gold" style={{ fontSize: '0.6rem' }}>{item.category}</span>
                      {!item.isAvailable && <span className="badge badge-coral" style={{ fontSize: '0.6rem' }}>Inactive</span>}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      {item.description.substring(0, 75)}...
                    </p>
                    <p style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 700, marginTop: '0.25rem' }}>
                      ₹{item.price.toFixed(2)}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={() => handleStartEdit(item)} style={{ padding: '0.5rem', borderRadius: '8px' }}>
                      <i className="fa-solid fa-pencil" style={{ fontSize: '0.85rem' }}></i>
                    </button>
                    <button className="btn btn-coral" onClick={() => handleDelete(item._id)} style={{ padding: '0.5rem', borderRadius: '8px' }}>
                      <i className="fa-solid fa-trash" style={{ fontSize: '0.85rem' }}></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Form Add/Edit */}
        <div className="glass-panel" style={{ padding: '2rem', background: 'var(--bg-secondary)' }}>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', marginBottom: '1.5rem' }}>
            {isEditing ? 'Modify Menu Item' : 'Publish New Dish'}
          </h2>

          {formError && (
            <div style={{ color: 'var(--accent-coral)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '0.25rem' }}></i>
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="itemName">Item Name</label>
              <input
                id="itemName"
                type="text"
                className="form-input"
                placeholder="e.g. Sizzling Garlic Prawns"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="itemPrice">Price (₹)</label>
                <input
                  id="itemPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder="e.g. 15.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="itemCategory">Category</label>
                <select
                  id="itemCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="Appetizers">Appetizers</option>
                  <option value="Mains">Mains</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Desserts">Desserts</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="itemDescription">Description</label>
              <textarea
                id="itemDescription"
                className="form-input"
                rows="3"
                placeholder="Detail the ingredients, portion sizes, or spice levels..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>

            <div className="form-group">
              <label>Dish Presentation Image</label>
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
                  id="itemImage"
                  type="url"
                  className="form-input"
                  placeholder="Paste an image URL (e.g. Unsplash)..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              ) : (
                <div style={{ position: 'relative' }}>
                  <input
                    id="itemImageFile"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageFileUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="itemImageFile" style={{
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
                      {imageUrl && imageUrl.startsWith('data:image') ? '✓ Image Loaded successfully' : 'Choose local JPEG/PNG file'}
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
                    style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Image Preview Loaded</span>
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

            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
              <input
                id="itemAvailable"
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--accent-gold)',
                  cursor: 'pointer'
                }}
              />
              <label htmlFor="itemAvailable" style={{ cursor: 'pointer', userSelect: 'none' }}>
                Item is available for ordering
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" type="submit" disabled={submitLoading} style={{ flex: 1 }}>
                {submitLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Dish'}
              </button>
              {isEditing && (
                <button className="btn btn-secondary" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 992px) {
          .container {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SellerMenu;
