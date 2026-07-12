import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Upload, Loader, AlertTriangle, CheckCircle, Sparkles, MapPin, Zap, Building, X } from 'lucide-react';

const Analyze = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [currentReportId, setCurrentReportId] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [location, setLocation] = useState({ lat: '28.6139', lng: '77.2090' }); // Default: Delhi
    const [locationStatus, setLocationStatus] = useState('detecting'); // detecting, success, error

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude.toString(),
                        lng: position.coords.longitude.toString()
                    });
                    setLocationStatus('success');
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocationStatus('error');
                }
            );
        } else {
            setLocationStatus('error');
        }
    }, []);

    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setResult(null);
            setError(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const selectedFile = e.dataTransfer.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setResult(null);
            setError(null);
        }
    };

    const getLiveLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation not supported"));
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude.toString(),
                        lng: position.coords.longitude.toString()
                    });
                },
                (error) => {
                    reject(error);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    };

    const analyzeImage = async () => {
        if (!file) return;

        setLoading(true);
        setError('');
        setResult(null);

        // Capture live location right before sending
        let submissionLocation = location;
        try {
            setLocationStatus('detecting');
            const liveLoc = await getLiveLocation();
            submissionLocation = liveLoc;
            setLocation(liveLoc);
            setLocationStatus('success');
        } catch (err) {
            console.warn("Using fallback/cached location:", err);
            // If live fetch fails, we stick to the last known 'location' state
            // and keep the status as is (or set to error if strictly required)
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('latitude', submissionLocation.lat);
        formData.append('longitude', submissionLocation.lng);

        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/v1/detection/analyze`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.data.success) {
                setResult(res.data);
                if (res.data.issues_detected && res.data.saved_reports && res.data.saved_reports.length > 0) {
                    setCurrentReportId(res.data.saved_reports[0].id);
                    setShowServiceModal(true);
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleServiceSelect = async (type) => {
        if (type === 'gig') {
            try {
                const token = localStorage.getItem('token');
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                await axios.post(`${API_URL}/api/v1/gig/jobs`, {
                    report_id: currentReportId,
                    service_type: 'gig'
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                alert('Express Service Requested! A worker will be assigned shortly.');
            } catch (err) {
                console.error("Failed to create job", err);
                alert('Failed to request express service.');
            }
        } else {
            alert('Report submitted to Municipal Corporation. Thank you!');
        }
        setShowServiceModal(false);
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-amber-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-slate-500';
        }
    };


    const imageContainerRef = useRef(null);

    const renderBoundingBoxes = () => {
        if (!result?.issues || !preview || !imageContainerRef.current) return null;

        return result.issues.map((issue, index) => {
            // Robust validation for box_2d
            if (!issue.box_2d || !Array.isArray(issue.box_2d) || issue.box_2d.length < 4) return null;

            const [ymin, xmin, ymax, xmax] = issue.box_2d;

            // Convert 0-1000 scale to percentages
            const top = (ymin / 1000) * 100;
            const left = (xmin / 1000) * 100;
            const height = ((ymax - ymin) / 1000) * 100;
            const width = ((xmax - xmin) / 1000) * 100;

            const colorClass = getSeverityColor(issue.severity);
            const borderColor = issue.severity?.toLowerCase() === 'high' ? 'border-red-500' :
                issue.severity?.toLowerCase() === 'medium' ? 'border-amber-500' : 'border-green-500';

            return (
                <div
                    key={index}
                    className={`absolute border-2 ${borderColor} shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out`}
                    style={{
                        top: `${top}%`,
                        left: `${left}%`,
                        width: `${width}%`,
                        height: `${height}%`,
                        // Use box-shadow to make it visible on any background
                    }}
                >
                    <div className={`absolute -top-7 left-0 px-2 py-0.5 text-xs font-bold text-white rounded shadow-sm whitespace-nowrap ${colorClass}`}>
                        {issue.category?.replace('_', ' ')}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
            {/* Service Selection Modal */}
            {showServiceModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Speed Up Resolution?</h2>
                                        <p className="text-white/70 text-sm">{result?.issues?.length || 0} issue(s) detected & localized!</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowServiceModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <div
                                onClick={() => handleServiceSelect('mcd')}
                                className="border-2 border-slate-200 rounded-2xl p-5 cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-all group"
                            >
                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Building size={24} className="text-slate-600" />
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">FREE</span>
                                <h3 className="font-bold text-slate-800 mt-2 mb-1">Municipal</h3>
                                <ul className="text-xs text-slate-500 space-y-1">
                                    <li>• Assigned to Dept</li>
                                    <li>• Standard Timeline</li>
                                    <li>• Auto-tracking</li>
                                </ul>
                            </div>
                            <div
                                onClick={() => handleServiceSelect('gig')}
                                className="border-2 border-indigo-200 bg-indigo-50/50 rounded-2xl p-5 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-2 right-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 rounded-full">⭐ FAST</div>
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Zap size={24} className="text-indigo-600" />
                                </div>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">₹300</span>
                                <h3 className="font-bold text-slate-800 mt-2 mb-1">Express Gig</h3>
                                <ul className="text-xs text-slate-500 space-y-1">
                                    <li>• Immediate Assign</li>
                                    <li>• Verified Worker</li>
                                    <li>• Live Tracking</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Hero Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
                        <Sparkles size={16} /> Powered by UrbanAI Engine
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
                        AI Civic Issue Detection
                    </h1>
                    <p className="text-slate-500 text-lg max-w-xl mx-auto">
                        Real-time spatial analysis of civic infrastructure using advanced Multimodal AI.
                    </p>
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="space-y-6">
                        <div
                            ref={imageContainerRef}
                            className={`
                                relative rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
                                ${dragActive ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'}
                                ${preview ? 'border-solid border-indigo-500' : ''}
                            `}
                            style={{ minHeight: preview ? 'auto' : '360px' }} // Dynamic height for preview
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => !result && fileInputRef.current.click()} // Only click if no result (user can click 'change image' button instead)
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                hidden
                                accept="image/*"
                            />

                            {preview ? (
                                <div className="relative w-full">
                                    <img src={preview} alt="Preview" className="w-full h-auto object-contain rounded-3xl" />

                                    {/* Bounding Box Overlay */}
                                    {result && (
                                        <div className="absolute inset-0 z-10 pointer-events-none">
                                            {renderBoundingBoxes()}
                                        </div>
                                    )}

                                    {!result && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-3xl pointer-events-none" />}

                                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                                            className="text-white/80 text-sm font-medium hover:text-white bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm transition-colors"
                                        >
                                            Click to change image
                                        </button>
                                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-bold">
                                            {result ? 'Analysis Complete' : 'Ready to analyze'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-16 px-8">
                                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all ${dragActive ? 'bg-indigo-100 scale-110' : 'bg-slate-100'}`}>
                                        <Upload size={36} className={dragActive ? 'text-indigo-600' : 'text-slate-400'} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-700 mb-2">Drop image here or click to upload</h3>
                                    <p className="text-slate-400 text-sm">Supports: JPG, PNG, WEBP (max 10MB)</p>
                                </div>
                            )}
                        </div>

                        {/* Location Indicator */}
                        <div className="flex items-center justify-center gap-2 text-sm mb-2">
                            {locationStatus === 'success' ? (
                                <span className="text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                    <MapPin size={14} /> GPS Location Active
                                </span>
                            ) : locationStatus === 'detecting' ? (
                                <span className="text-slate-500 flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                    <Loader size={14} className="animate-spin" /> Detecting Location...
                                </span>
                            ) : (
                                <span className="text-amber-600 flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                    <MapPin size={14} /> Using Default Location (Delhi)
                                </span>
                            )}
                        </div>

                        {/* Analyze Button */}
                        <button
                            onClick={analyzeImage}
                            disabled={!file || loading || result}
                            className={`
                                w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all
                                ${file && !loading && !result
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                            `}
                        >
                            {loading ? (
                                <>
                                    <Loader size={22} className="animate-spin" />
                                    Analyzing with UrbanAI Engine...
                                </>
                            ) : result ? (
                                <>
                                    <CheckCircle size={22} />
                                    Analysis Complete
                                </>
                            ) : (
                                <>
                                    <Sparkles size={22} />
                                    Analyze Image
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl">
                                <AlertTriangle size={20} />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    <div>
                        {result ? (
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden h-full">
                                {result.issues_detected ? (
                                    <>
                                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                                                    <AlertTriangle size={28} className="text-white" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-white">Issues Detected</h2>
                                                    <p className="text-white/70">{result.issues?.length || 0} issue(s) identified & localized</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                                            {result.issues?.map((issue, index) => (
                                                <div key={index} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-indigo-200 transition-colors">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <span className={`text-xs font-bold text-white px-3 py-1 rounded-full uppercase ${getSeverityColor(issue.severity)}`}>
                                                            {issue.severity} Severity
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-medium">{issue.department || 'General'}</span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-slate-800 capitalize mb-2">{issue.category?.replace('_', ' ')}</h4>
                                                    <p className="text-slate-500 text-sm leading-relaxed mb-2">{issue.description}</p>
                                                    {issue.box_2d && (
                                                        <div className="text-xs text-indigo-500 font-medium flex items-center gap-1">
                                                            <MapPin size={12} /> Spatial Coordinates: [{issue.box_2d.join(', ')}]
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            <div className="pt-4 border-t border-slate-100 mt-4">
                                                <button
                                                    onClick={() => setShowServiceModal(true)}
                                                    className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors"
                                                >
                                                    View Service Options
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-12 text-center h-full flex flex-col items-center justify-center">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle size={40} className="text-green-500" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-800 mb-2">All Clear!</h2>
                                        <p className="text-slate-500">No infrastructure issues detected in this image.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center" style={{ minHeight: '360px' }}>
                                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                                    <MapPin size={36} className="text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">Analysis Results</h3>
                                <p className="text-slate-400 max-w-xs">Upload an image and click analyze to see AI-powered detection results here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Feature Pills */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-12">
                    {['🔍 Pothole Detection', '🚮 Garbage Detection', '💡 Streetlight Issues', '🚧 Road Damage', '🌊 Waterlogging'].map((feat, i) => (
                        <span key={i} className="bg-white border border-slate-200 px-4 py-2 rounded-full text-sm font-medium text-slate-600 shadow-sm">
                            {feat}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analyze;
