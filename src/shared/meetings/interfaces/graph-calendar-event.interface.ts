export interface GraphAttendee {
  emailAddress: {
    address: string;
    name?: string;
  };
  type: 'required' | 'optional';
}

export interface GraphCalendarEventCreatePayload {
  subject: string;
  body?: {
    contentType: 'HTML' | 'text';
    content: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  isOnlineMeeting: boolean;
  onlineMeetingProvider: 'teamsForBusiness';
  attendees?: GraphAttendee[];
  transactionId?: string;
}

export interface GraphCalendarEventUpdatePayload {
  subject?: string;
  body?: {
    contentType: 'HTML' | 'text';
    content: string;
  };
  start?: {
    dateTime: string;
    timeZone: string;
  };
  end?: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: GraphAttendee[];
}

export interface GraphOnlineMeetingInfo {
  joinUrl?: string;
  conferenceId?: string;
  tollNumber?: string;
}

export interface GraphCalendarEventResponse {
  id: string;
  iCalUId?: string;
  subject?: string;
  isOnlineMeeting?: boolean;
  onlineMeetingProvider?: string;
  onlineMeetingUrl?: string;
  onlineMeeting?: GraphOnlineMeetingInfo | null;
  webLink?: string;
  isCancelled?: boolean;
  start?: {
    dateTime: string;
    timeZone: string;
  };
  end?: {
    dateTime: string;
    timeZone: string;
  };
}

