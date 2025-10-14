import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Interview, InterviewStatus } from "../types/Interview";
import { getUserInterviews, addInterview, editInterview, deleteInterview } from "../api/interviews";
import { setInterviews as setInterviewsStore } from "../redux/interviewsSlice";
import DropdownMenu from "../components/DropdownMenu";
import "./InterviewsScreen.css";

const InterviewsScreen = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{title: string, status: 'success' | 'error'} | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const [isMobileView, setIsMobileView] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (title: string, status: 'success' | 'error') => {
    setToastMessage({ title, status });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Detect mobile screen size
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const dispatch = useDispatch();
  const jwtToken = useSelector((state: RootState) => state.app.jwtToken);
  const userId = useSelector((state: RootState) => state.user.userId);
  const cachedInterviews = useSelector((state: RootState) => state.interviews.items);
  const notesAutosaveTimers = useRef<Record<string, number | undefined>>({});
  const notesValues = useRef<Record<string, string>>({});
  const AUTOSAVE_MS = 600;
  const [savingNotesById, setSavingNotesById] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    position: "",
    company: "",
    status: InterviewStatus.APPLIED,
    interviewer: "",
    notes: "",
  });

const fetchInterviews = useCallback(async () => {
  if (!jwtToken || !userId) return;
  try {
    setLoading(true);
    setError(null);
    const data = await getUserInterviews(userId, jwtToken);
    setInterviews(data);
    setHasFetched(true);
  } catch (err) {
    setError("Failed to fetch interviews");
    console.error("Error fetching interviews:", err);
    setHasFetched(true);
  } finally {
    setLoading(false);
  }
}, [jwtToken, userId]);

useEffect(() => {
  if (!jwtToken || !userId) {
    setLoading(false);
    return;
  }
  
  // If we already have interviews in state, stop loading
  if (interviews.length > 0) {
    setLoading(false);
    return;
  }
  
  // If we have cached interviews, use them
  if (cachedInterviews && cachedInterviews.length > 0) {
    setInterviews(cachedInterviews);
    setLoading(false);
    setHasFetched(true);
    return;
  }
  
  // Only fetch if we haven't already fetched
  if (!hasFetched) {
    fetchInterviews();
  } else {
    // If we've already fetched and have no interviews, stop loading
    setLoading(false);
  }
}, [jwtToken, userId, cachedInterviews, fetchInterviews, interviews.length, hasFetched]);

useEffect(() => {
  dispatch(setInterviewsStore(interviews));
}, [interviews, dispatch]);

  // Menu event handlers removed - now handled by DropdownMenu component

  const handleAddInterview = () => {
    setEditingInterview(null);
    setFormData({
      position: "",
      company: "",
      status: InterviewStatus.APPLIED,
      interviewer: "",
      notes: "",
    });
    onOpen();
  };

  const handleDeleteInterview = async (interviewId: string) => {
    if (!jwtToken || !userId) return;
    
    try {
      await deleteInterview(userId, jwtToken, interviewId);
      const updatedInterviews = interviews.filter(i => i.id !== interviewId);
      setInterviews(updatedInterviews);
      dispatch(setInterviewsStore(updatedInterviews));
      showToast("Application deleted", "warning");
    } catch (err) {
      showToast("Failed to delete application", "error");
    }
  };
  const saveInterviewById = useCallback(async (id: string, overrides?: Partial<Interview>) => {
    if (!jwtToken || !userId) return;
    const current = interviews.find(i => i.id === id);
    if (!current) return;
    try {
      setSavingNotesById(prev => ({ ...prev, [id]: true }));
      const updated = await editInterview(
        userId,
        jwtToken,
        id,
        overrides?.position ?? current.position,
        overrides?.company ?? current.company,
        (overrides?.status as any) ?? current.status,
        overrides?.interviewer ?? current.interviewer,
        overrides?.notes ?? current.notes
      );
      setInterviews(prev => prev.map(i => (i.id === id ? updated : i)));
    } catch (err) {
      console.error("Autosave failed", err);
      showToast("Failed to autosave application", "error");
    } finally {
      setSavingNotesById(prev => ({ ...prev, [id]: false }));
    }
  }, [jwtToken, userId, interviews]);

  const scheduleNotesAutosave = (id: string, value: string) => {
    if (notesAutosaveTimers.current[id]) {
      window.clearTimeout(notesAutosaveTimers.current[id]);
    }
    notesAutosaveTimers.current[id] = window.setTimeout(() => {
      setInterviews(prev => prev.map(i => i.id === id ? { ...i, notes: value } : i));
      void saveInterviewById(id, { notes: value });
    }, AUTOSAVE_MS);
  };

  const handleSubmit = async () => {
    if (!jwtToken || !userId) return;

    try {
      const newInterview = await addInterview(
        userId,
        jwtToken,
        formData.position,
        formData.company,
        formData.status,
        formData.interviewer,
        formData.notes
      );
      setInterviews(prev => [newInterview, ...prev]);
      showToast("Application added", "success");
      onClose();
    } catch (err) {
      showToast("Failed to add application", "error");
    }
  };

  const handleInlineSave = async (id: string) => {
    if (!jwtToken || !userId) return;
    try {
      const updatedInterview = await editInterview(
        userId,
        jwtToken,
        id,
        formData.position,
        formData.company,
        formData.status,
        formData.interviewer,
        formData.notes
      );
      setInterviews(prev => prev.map(i => (i.id === id ? updatedInterview : i)));
      dispatch(setInterviewsStore(interviews.map(i => (i.id === id ? updatedInterview : i))));
      setEditingInterview(null);
      showToast("Application updated", "success");
    } catch (err) {
      showToast("Failed to update application", "error");
    }
  };

  const handleInlineCancel = () => {
    setEditingInterview(null);
  };

  const getStatusColor = (status: InterviewStatus) => {
    switch (status) {
      case InterviewStatus.APPLIED:
        return "blue";
      case InterviewStatus.INTERVIEW_SCHEDULED:
        return "orange";
      case InterviewStatus.INTERVIEWED:
        return "yellow";
      case InterviewStatus.OFFERED:
        return "purple";
      case InterviewStatus.REJECTED:
        return "red";
      case InterviewStatus.ACCEPTED:
        return "green";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <div className="interviews-screen-wrapper">
        <div className="interviews-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="interviews-screen">
      <div className="interviews-header">
        <button className="add-interview-button" onClick={handleAddInterview}>+ Add Application</button>
      </div>

      {error && (
        <div className="error-alert">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="interviews-list" ref={scrollContainerRef}>
            {interviews.length === 0 ? (
              <div className="empty-state-card">
                <div className="empty-state-content">
                  <p className="empty-state-text">No applications found. Add your first application!</p>
                </div>
              </div>
            ) : (
              interviews.map((interview) => (
                <div key={interview.id} className="interview-card">
                  {editingInterview && editingInterview.id === interview.id ? (
                    <div className="interview-edit-form">
                      <div className="edit-form-content">
                        <div className="edit-form-left">
                          <input
                            className="form-input"
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            placeholder="Position"
                          />
                          <input
                            className="form-input"
                            value={formData.interviewer}
                            onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
                            placeholder="Interviewer"
                          />
                          <input
                            className="form-input"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            placeholder="Company"
                          />
                          <select
                            className="form-select"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as InterviewStatus })}
                          >
                            <option value={InterviewStatus.APPLIED}>Applied</option>
                            <option value={InterviewStatus.INTERVIEW_SCHEDULED}>Interview Scheduled</option>
                            <option value={InterviewStatus.INTERVIEWED}>Interviewed</option>
                            <option value={InterviewStatus.OFFERED}>Offered</option>
                            <option value={InterviewStatus.REJECTED}>Rejected</option>
                            <option value={InterviewStatus.ACCEPTED}>Accepted</option>
                          </select>
                        </div>
                        <div className="edit-form-right">
                          <div className="edit-form-notes">
                            <textarea
                              className="form-textarea"
                              value={formData.notes}
                              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                              placeholder="Notes"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-actions">
                        <button className="button button-secondary" onClick={handleInlineCancel}>Cancel</button>
                        <button className="button button-primary" onClick={() => handleInlineSave(interview.id)}>Save</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="interview-info">
                        <div className="interview-title-section">
                          <h3 className="interview-position">{interview.position?.trim() || "Untitled Position"}</h3>
                          <p className="interview-company">{interview.company?.trim() || "Company not specified"}</p>
                        </div>
                        <div className="interview-interviewer">
                          <span className="interviewer-label">Interviewer:</span>
                          <span className="interviewer-name">{interview.interviewer?.trim() || "N/A"}</span>
                        </div>
                      </div>
                      
                      <div className="interview-right-section">
                        <div className="interview-status-section">
                          <div className="status-indicator" style={{ backgroundColor: getStatusColor(interview.status) }}></div>
                          <select
                            className="status-select"
                            value={interview.status}
                            onChange={(e) => {
                              const value = e.target.value as InterviewStatus;
                              setInterviews(prev => prev.map(i => i.id === interview.id ? { ...i, status: value } : i));
                              void saveInterviewById(interview.id, { status: value });
                            }}
                          >
                            <option value={InterviewStatus.APPLIED}>Applied</option>
                            <option value={InterviewStatus.INTERVIEW_SCHEDULED}>Interview Scheduled</option>
                            <option value={InterviewStatus.INTERVIEWED}>Interviewed</option>
                            <option value={InterviewStatus.OFFERED}>Offered</option>
                            <option value={InterviewStatus.REJECTED}>Rejected</option>
                            <option value={InterviewStatus.ACCEPTED}>Accepted</option>
                          </select>
                        </div>
                        
                        <div className="interview-actions">
                          <div className="saving-indicator">
                            {savingNotesById[interview.id] && <div className="spinner-small"></div>}
                          </div>
                          <DropdownMenu
                            items={[
                              {
                                label: 'Edit',
                                onClick: () => setEditingInterview(interview)
                              },
                              {
                                label: 'Delete',
                                onClick: () => handleDeleteInterview(interview.id),
                                isDestructive: true
                              }
                            ]}
                            scrollContainerRef={scrollContainerRef}
                          />
                        </div>
                      </div>
                      {!isMobileView && (
                        <div className="interview-notes-section">
                          <textarea
                            ref={(el) => {
                              if (el) {
                                notesValues.current[interview.id] = el.value;
                              }
                            }}
                            className="notes-textarea"
                            placeholder="Add notes..."
                            defaultValue={interview.notes || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              notesValues.current[interview.id] = value;
                              
                              // Clear existing timer for this interview
                              if (notesAutosaveTimers.current[interview.id]) {
                                clearTimeout(notesAutosaveTimers.current[interview.id]);
                              }
                              
                              // Set saving state
                              setSavingNotesById(prev => ({ ...prev, [interview.id]: true }));
                              
                              // Set new timer for autosave
                              notesAutosaveTimers.current[interview.id] = window.setTimeout(() => {
                                void saveInterviewById(interview.id, { notes: value }).finally(() => {
                                  setSavingNotesById(prev => ({ ...prev, [interview.id]: false }));
                                });
                              }, AUTOSAVE_MS);
                            }}
                          />
                        </div>
                      )}

                    </>
                  )}
                </div>
              ))
            )}
      </div>

      {/* Add/Edit Modal */}
      {isOpen && (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingInterview ? "Edit Application" : "Add Application"}
              </h2>
              <button className="modal-close-button" onClick={onClose}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-form">
                <div className="form-group">
                  <label className="form-label">Position</label>
                  <input
                    className="form-input"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input
                    className="form-input"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., Google"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as InterviewStatus })}
                  >
                    <option value={InterviewStatus.APPLIED}>Applied</option>
                    <option value={InterviewStatus.INTERVIEW_SCHEDULED}>Interview Scheduled</option>
                    <option value={InterviewStatus.INTERVIEWED}>Interviewed</option>
                    <option value={InterviewStatus.OFFERED}>Offered</option>
                    <option value={InterviewStatus.REJECTED}>Rejected</option>
                    <option value={InterviewStatus.ACCEPTED}>Accepted</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Interviewer</label>
                  <input
                    className="form-input"
                    value={formData.interviewer}
                    onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
                    placeholder="e.g., John Smith"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button className="button button-secondary" onClick={onClose}>
                    Cancel
                  </button>
                  <button className="button button-primary" onClick={handleSubmit}>
                    {editingInterview ? "Update" : "Add"} Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="toast-container">
          <div className={`toast ${toastMessage.status}`}>
            {toastMessage.title}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewsScreen;
