export interface Interview {
  id: string;
  position: string;
  company: string;
  status: InterviewStatus;
  interviewer: string;
  notes: string;
}

export enum InterviewStatus {
    APPLIED = "APPLIED",
    INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED",
    INTERVIEWED = "INTERVIEWED",
    OFFERED = "OFFERED",
    REJECTED = "REJECTED",
    ACCEPTED = "ACCEPTED"
}

