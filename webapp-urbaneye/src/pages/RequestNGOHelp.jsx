import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, MapPin, AlertCircle, Check, Loader, ChevronLeft } from 'lucide-react';
import './RequestNGOHelp.css';

const CATEGORIES = [
    { id: 'environment', label: 'Environment', icon: '🌿', description: 'Tree planting, pollution, green initiatives' },
    { id: 'animal_welfare', label: 'Animal Welfare', icon: '🐕', description: 'Stray animals, injured animals, shelters' },
    { id: 'sanitation', label: 'Sanitation', icon: '🧹', description: 'Clean-up drives, waste management' },
    { id: 'community', label: 'Community Development', icon: '🏘️', description: 'Infrastructure, education, health camps' },
    { id: 'other', label: 'Other', icon: '📋', description: 'Any other community issue' },
];

const SCALES = [
    { id: 'small', label: 'Small', description: '1-5 people can handle', color: '#22c55e' },
    { id: 'medium', label: 'Medium', description: '5-15 volunteers needed', color: '#f59e0b' },
    { id: 'large', label: 'Large', description: '15+ volunteers required', color: '#ef4444' },
];

const RequestNGOHelp = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [ngoResponse, setNgoResponse] = useState(null);

    const [formData, setFormData] = useState({
        description: '',
        category: '',
        scale: 'medium',
        address: '',
        latitude: 28.6139,
        longitude: 77.2090
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.description || !formData.category) {
            alert('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/v1/ngo/requests`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                setNgoResponse(res.data.request);
                setSubmitted(true);
            }
        } catch (err) {
            console.error('Failed to submit request', err);
            alert('Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted && ngoResponse) {
        return (
            <div className="ngo-help-page container">
                <div className="success-container">
                    <div className="success-icon">
                        <Check size={48} />
                    </div>
                    <h1>Request Submitted! 🙏</h1>
                    <p className="text-muted">An NGO partner will review your request within 24 hours.</p>

                    <div className="ngo-card glass-panel">
                        <div className="ngo-icon">
                            <Heart size={32} />
                        </div>
                        <div className="ngo-info">
                            <h3>{ngoResponse.ngo?.name}</h3>
                            <p>📧 {ngoResponse.ngo?.contact}</p>
                            <p className="status">Status: <span className="badge reviewing">Reviewing</span></p>
                        </div>
                    </div>

                    <div className="request-details glass-panel">
                        <h4>Your Request</h4>
                        <div className="detail-row">
                            <span>Category</span>
                            <strong>{formData.category?.replace('_', ' ')}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Scale</span>
                            <strong>{formData.scale}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Request ID</span>
                            <code>{ngoResponse.id?.slice(0, 8)}</code>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="ngo-help-page container">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
                <ChevronLeft size={20} /> Back to Dashboard
            </button>

            <div className="page-header">
                <div className="header-icon">
                    <Heart size={32} />
                </div>
                <h1>Request NGO Assistance</h1>
                <p className="text-muted">Get free help from verified NGO partners for community issues</p>
            </div>

            <form onSubmit={handleSubmit} className="ngo-form">
                {/* Category Selection */}
                <div className="form-section">
                    <label>Issue Category *</label>
                    <div className="category-grid">
                        {CATEGORIES.map(cat => (
                            <div
                                key={cat.id}
                                className={`category-card glass-panel ${formData.category === cat.id ? 'selected' : ''}`}
                                onClick={() => setFormData({ ...formData, category: cat.id })}
                            >
                                <span className="cat-icon">{cat.icon}</span>
                                <h4>{cat.label}</h4>
                                <p>{cat.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div className="form-section">
                    <label>Describe the Issue *</label>
                    <textarea
                        className="form-input"
                        rows={4}
                        placeholder="Please describe the issue in detail. Include location specifics, urgency, and any other relevant information..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                {/* Scale */}
                <div className="form-section">
                    <label>Scale of Issue</label>
                    <div className="scale-options">
                        {SCALES.map(scale => (
                            <div
                                key={scale.id}
                                className={`scale-option glass-panel ${formData.scale === scale.id ? 'selected' : ''}`}
                                onClick={() => setFormData({ ...formData, scale: scale.id })}
                                style={{ '--scale-color': scale.color }}
                            >
                                <div className="scale-indicator"></div>
                                <div>
                                    <h4>{scale.label}</h4>
                                    <p>{scale.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Address */}
                <div className="form-section">
                    <label>
                        <MapPin size={16} /> Location / Address
                    </label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Enter the address or landmark"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                </div>

                {/* Info Box */}
                <div className="info-box glass-panel">
                    <AlertCircle size={20} />
                    <div>
                        <strong>What happens next?</strong>
                        <p>A matching NGO will review your request within 24 hours. They will contact you directly if they can help.</p>
                    </div>
                </div>

                {/* Submit */}
                <button type="submit" className="btn btn-primary btn-lg submit-btn" disabled={loading}>
                    {loading ? <><Loader className="spin" size={18} /> Submitting...</> : 'Submit Request'}
                </button>
            </form>
        </div>
    );
};

export default RequestNGOHelp;
