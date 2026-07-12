import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/v1/reports`);
            if (res.data.success) {
                setTasks(res.data.reports);
            }
        } catch (err) {
            console.error("Failed to fetch tasks", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.put(`${API_URL}/api/v1/reports/${id}/status`, { status: newStatus });
            fetchTasks(); // Refresh
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    if (loading) return <div>Loading tasks...</div>;

    return (
        <div className="task-list-container">
            <h3>Department Tasks</h3>
            <div className="task-grid">
                {tasks.length === 0 ? (
                    <p className="no-tasks">No active tasks for your department.</p>
                ) : (
                    tasks.map(task => (
                        <motion.div
                            key={task.id}
                            className="task-card glass-panel"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="task-header">
                                <span className={`severity-badge ${task.severity}`}>
                                    {task.severity}
                                </span>
                                <span className="task-time">
                                    {new Date(task.timestamp * 1000).toLocaleDateString()}
                                </span>
                            </div>

                            <h4>{task.category}</h4>
                            <p>{task.description}</p>

                            <div className="task-actions">
                                <div className="current-status">
                                    Status: <strong>{task.status.toUpperCase()}</strong>
                                </div>

                                {task.status === 'open' && (
                                    <button onClick={() => updateStatus(task.id, 'in_progress')} className="btn btn-sm btn-primary">
                                        Start Work <ArrowRight size={16} />
                                    </button>
                                )}

                                {task.status === 'in_progress' && (
                                    <button onClick={() => updateStatus(task.id, 'resolved')} className="btn btn-sm btn-success">
                                        Mark Resolved <CheckCircle size={16} />
                                    </button>
                                )}

                                {task.status === 'resolved' && (
                                    <span className="resolved-text">
                                        <CheckCircle size={16} /> Completed
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TaskList;
