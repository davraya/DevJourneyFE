export interface WeeklyGoalsResponse {
    weekStartDate: string; // ISO date string for the start of the week
    id: string; // Unique identifier for the weekly goals
    informationalInterviews: GoalMetrics; // Metrics for informational interviews
    attemptedContacts: GoalMetrics; // Metrics for attempted contacts
    jobApplications: GoalMetrics; // Metrics for job applications
    hoursSpentDeveloping: GoalMetrics; // Metrics for hours spent developing
    hoursSpentPracticing: GoalMetrics; // Metrics for hours spent practicing
  }
  
export interface GoalMetrics {
    goal: number; // Goal value for the metric
    actual: number; // Actual value achieved for the metric
  }