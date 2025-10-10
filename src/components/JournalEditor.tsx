import React from "react";
import { formatDateTime } from "../utils/date";
import { GoalMetric } from "../types/JournalResponse";
import "./JournalEditor.css";

interface JournalEditorProps {
  title: string;
  content: string;
  dateTime?: string;
  isSaving: boolean;
  saveError: string | null;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onBackMobile?: () => void;
  goals?: GoalMetric[];
  onUpdateGoal?: (metricId: string, amount: number) => void;
  titleRef?: React.RefObject<HTMLInputElement>;
  contentRef?: React.RefObject<HTMLTextAreaElement>;
  hasUnsavedChanges?: boolean;
}

const JournalEditor = ({ title, content, dateTime, isSaving, saveError, onTitleChange, onContentChange, onBackMobile, goals, onUpdateGoal, titleRef, contentRef, hasUnsavedChanges }: JournalEditorProps) => {
  return (
    <div className="journal-editor">
      {onBackMobile && (
        <div className="back-button-container">
          <button className="back-button" onClick={onBackMobile}>Back to list</button>
        </div>
      )}
      <input
        ref={titleRef}
        defaultValue={title}
        onChange={(e) => {
          onTitleChange(e.target.value);
        }}
        onBlur={(e) => {
          onTitleChange(e.target.value);
        }}
        placeholder="Title"
        className="journal-title-input"
      />
      <div className="journal-date">
        {formatDateTime(dateTime)}
      </div>
      <textarea
        ref={contentRef}
        defaultValue={content}
        onChange={(e) => {
          onContentChange(e.target.value);
        }}
        onBlur={(e) => {
          onContentChange(e.target.value);
        }}
        placeholder="Start typing..."
        className="journal-content-textarea"
      />
      
      {goals && goals.length > 0 && (
        <div className="goals-section">
          <div className="goals-title">Weekly Goals</div>
          <div className="goals-list">
            {goals.map((goal) => (
              <div key={goal.id} className="goal-item">
                <div className="goal-header">
                  <div className="goal-name">{goal.name}</div>
                  <div className="goal-controls">
                    <div className="goal-progress-text">{goal.actual}/{goal.goal}</div>
                    {onUpdateGoal && (
                      <div className="goal-buttons">
                        <button
                          className="goal-button"
                          onClick={() => onUpdateGoal(goal.id, -1)}
                          disabled={goal.actual <= 0}
                        >
                          -
                        </button>
                        <button
                          className="goal-button"
                          onClick={() => onUpdateGoal(goal.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${goal.actual >= goal.goal ? 'progress-complete' : 'progress-incomplete'}`}
                    style={{ width: `${(goal.actual / goal.goal) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="save-status">
        {isSaving ? (
          <>
            <div className="spinner"></div>
            <span className="save-text">Saving...</span>
          </>
        ) : hasUnsavedChanges ? (
          <span className="save-text saving">Saving changes...</span>
        ) : (
          <span className="save-text">All changes saved.</span>
        )}
      </div>
      {saveError && (
        <div className="save-error">{saveError}</div>
      )}
    </div>
  );
};

export default JournalEditor;
