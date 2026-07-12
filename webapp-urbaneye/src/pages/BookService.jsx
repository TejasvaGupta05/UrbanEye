import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, ChevronLeft, Check, Clock, MapPin, CreditCard, User, Zap, Crown, Loader } from 'lucide-react';
import './BookService.css';

const STEPS = ['Select Issue', 'Choose Service', 'Time Slot', 'Payment', 'Confirmed'];

const TIME_SLOTS = [
    { id: 'today_morning', label: 'Today Morning', time: '8 AM - 12 PM', available: true },
    { id: 'today_evening', label: 'Today Evening', time: '2 PM - 6 PM', available: true },
    { id: 'tomorrow_morning', label: 'Tomorrow Morning', time: '8 AM - 12 PM', available: true },
    { id: 'tomorrow_evening', label: 'Tomorrow Evening', time: '2 PM - 6 PM', available: true },
];

const BookService = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preSelectedReportId = searchParams.get('report');

    const [step, setStep] = useState(preSelectedReportId ? 2 : 1);
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [serviceType, setServiceType] = useState('express');
    const [timeSlot, setTimeSlot] = useState('today_morning');
    const [booking, setBooking] = useState(null);

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        if (preSelectedReportId && reports.length > 0) {
            const report = reports.find(r => r.id === preSelectedReportId);
            if (report) {
                setSelectedReport(report);
                setStep(2);
            }
        }
    }, [preSelectedReportId, reports]);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/v1/reports/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) {
                setReports(res.data.reports.filter(r => r.status === 'open'));
            }
        } catch (err) {
            console.error('Failed to fetch reports', err);
        }
    };

    const handleBooking = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/v1/bookings`, {
                report_id: selectedReport?.id,
                service_type: serviceType,
                time_slot: timeSlot
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                setBooking(res.data.booking);
                setStep(5);
            }
        } catch (err) {
            console.error('Booking failed', err);
            alert('Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="step-indicator">
            {STEPS.map((s, idx) => (
                <div key={idx} className={`step ${step > idx + 1 ? 'completed' : ''} ${step === idx + 1 ? 'active' : ''}`}>
                    <div className="step-circle">
                        {step > idx + 1 ? <Check size={16} /> : idx + 1}
                    </div>
                    <span className="step-label">{s}</span>
                </div>
            ))}
        </div>
    );

    const renderStep1 = () => (
        <div className="step-content">
            <h2>Select an Issue to Book Service For</h2>
            <p className="text-muted">Choose from your open reported issues</p>

            {reports.length === 0 ? (
                <div className="empty-state glass-panel">
                    <p>No open issues found.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/analyze')}>
                        Report New Issue
                    </button>
                </div>
            ) : (
                <div className="issue-list">
                    {reports.map(report => (
                        <div
                            key={report.id}
                            className={`issue-card glass-panel ${selectedReport?.id === report.id ? 'selected' : ''}`}
                            onClick={() => setSelectedReport(report)}
                        >
                            <div className="issue-info">
                                <h4>{report.category?.replace('_', ' ').toUpperCase()}</h4>
                                <p>{report.description?.substring(0, 80)}...</p>
                                <span className="issue-meta">
                                    <MapPin size={14} /> {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}
                                </span>
                            </div>
                            {selectedReport?.id === report.id && (
                                <div className="selected-check">
                                    <Check size={20} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="step-actions">
                <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
                    Cancel
                </button>
                <button
                    className="btn btn-primary"
                    disabled={!selectedReport}
                    onClick={() => setStep(2)}
                >
                    Continue <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="step-content">
            <h2>Choose Service Tier</h2>
            <p className="text-muted">Select the speed of resolution you need</p>

            <div className="service-options">
                <div
                    className={`service-card glass-panel ${serviceType === 'express' ? 'selected' : ''}`}
                    onClick={() => setServiceType('express')}
                >
                    <div className="service-icon express">
                        <Zap size={32} />
                    </div>
                    <div className="service-details">
                        <h3>Express Service</h3>
                        <p>Resolved within 4 hours</p>
                        <ul>
                            <li>✓ Verified worker</li>
                            <li>✓ Real-time tracking</li>
                            <li>✓ Quality guarantee</li>
                        </ul>
                    </div>
                    <div className="service-price">₹299</div>
                </div>

                <div
                    className={`service-card glass-panel ${serviceType === 'premium' ? 'selected' : ''}`}
                    onClick={() => setServiceType('premium')}
                >
                    <div className="service-icon premium">
                        <Crown size={32} />
                    </div>
                    <div className="service-details">
                        <h3>Premium Service</h3>
                        <p>Resolved within 1 hour</p>
                        <ul>
                            <li>✓ Top-rated worker</li>
                            <li>✓ Priority support</li>
                            <li>✓ Photo verification</li>
                        </ul>
                    </div>
                    <div className="service-price">₹499</div>
                </div>
            </div>

            <div className="step-actions">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>
                    <ChevronLeft size={18} /> Back
                </button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>
                    Continue <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="step-content">
            <h2>Select Time Slot</h2>
            <p className="text-muted">When do you want the worker to arrive?</p>

            <div className="time-slots">
                {TIME_SLOTS.map(slot => (
                    <div
                        key={slot.id}
                        className={`time-slot glass-panel ${timeSlot === slot.id ? 'selected' : ''} ${!slot.available ? 'disabled' : ''}`}
                        onClick={() => slot.available && setTimeSlot(slot.id)}
                    >
                        <Clock size={24} />
                        <div className="slot-info">
                            <h4>{slot.label}</h4>
                            <span>{slot.time}</span>
                        </div>
                        {timeSlot === slot.id && <Check size={20} className="check-icon" />}
                    </div>
                ))}
            </div>

            <div className="step-actions">
                <button className="btn btn-ghost" onClick={() => setStep(2)}>
                    <ChevronLeft size={18} /> Back
                </button>
                <button className="btn btn-primary" onClick={() => setStep(4)}>
                    Continue <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="step-content">
            <h2>Confirm & Pay</h2>
            <p className="text-muted">Review your booking details</p>

            <div className="booking-summary glass-panel">
                <div className="summary-row">
                    <span>Issue</span>
                    <strong>{selectedReport?.category?.replace('_', ' ')}</strong>
                </div>
                <div className="summary-row">
                    <span>Service</span>
                    <strong>{serviceType === 'premium' ? '👑 Premium' : '⚡ Express'}</strong>
                </div>
                <div className="summary-row">
                    <span>Time Slot</span>
                    <strong>{TIME_SLOTS.find(s => s.id === timeSlot)?.label}</strong>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                    <span>Total Amount</span>
                    <strong>₹{serviceType === 'premium' ? 499 : 299}</strong>
                </div>
            </div>

            <div className="payment-methods glass-panel">
                <h4><CreditCard size={18} /> Payment Method</h4>
                <div className="payment-option selected">
                    <input type="radio" checked readOnly />
                    <span>Simulate Payment (Demo)</span>
                </div>
            </div>

            <div className="step-actions">
                <button className="btn btn-ghost" onClick={() => setStep(3)}>
                    <ChevronLeft size={18} /> Back
                </button>
                <button className="btn btn-primary btn-lg" onClick={handleBooking} disabled={loading}>
                    {loading ? <><Loader className="spin" size={18} /> Processing...</> : `Pay ₹${serviceType === 'premium' ? 499 : 299}`}
                </button>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="step-content success-step">
            <div className="success-icon">
                <Check size={48} />
            </div>
            <h2>Booking Confirmed! 🎉</h2>
            <p className="text-muted">Your worker has been assigned</p>

            {booking && (
                <div className="worker-card glass-panel">
                    <div className="worker-avatar">
                        <User size={40} />
                    </div>
                    <div className="worker-info">
                        <h4>{booking.worker?.name}</h4>
                        <p>⭐ {booking.worker?.rating} Rating</p>
                        <p>📞 {booking.worker?.phone}</p>
                    </div>
                    <div className="eta-badge">
                        ETA: {booking.eta_minutes} mins
                    </div>
                </div>
            )}

            <div className="booking-id">
                Booking ID: <code>{booking?.id?.slice(0, 8)}</code>
            </div>

            <div className="step-actions">
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                </button>
            </div>
        </div>
    );

    return (
        <div className="book-service-page container">
            <h1 className="page-title">Book a Service</h1>
            {renderStepIndicator()}

            <div className="booking-container">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
            </div>
        </div>
    );
};

export default BookService;
