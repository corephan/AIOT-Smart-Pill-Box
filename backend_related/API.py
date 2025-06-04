import datetime
import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Permission to create and manage calendar events
SCOPES = ["https://www.googleapis.com/auth/calendar.events"]
DEFAULT_TIMEZONE = "Asia/Bangkok"
EVENT_DURATION_MINUTES = 15

class GoogleCalendarAPI:
    """"Declare file of Google Calendar API"""
    def __init__(self, token_path = "token.json", credentials_path = "credentials.json"):
        self.token_path = token_path
        self.credentials_path = credentials_path
    
    def authenticate_google_calendar(self):
        creds = None
        if os.path.exists("token.json"):
            creds = Credentials.from_authorized_user_file("token.json", SCOPES)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
                creds = flow.run_local_server(port=0)
            with open("token.json", "w") as token:
                token.write(creds.to_json())

        return build("calendar", "v3", credentials=creds)

    def check_time_input(self, time_str: str):
        try:
            hour, minute = map(int, time_str.split(":"))
            if 0 <= hour < 24 and 0 <= minute < 60:
                return datetime.time(hour, minute)
        except (ValueError, TypeError):
            return None

    def algorithm(self, service: any, user_email: str, input_time_str: str, duration_days: int, timezone: str = DEFAULT_TIMEZONE):
        scheduled_time = self.check_time_input(input_time_str)
        if scheduled_time is None:
            raise ValueError("Invalid time format. Please use HH:MM format.")
        if duration_days <= 0:
            raise ValueError("Duration must be a positive integer.")
        
        today = datetime.date.today()
        event_start = datetime.datetime.combine(today, scheduled_time)
        event_end = event_start + datetime.timedelta(minutes=EVENT_DURATION_MINUTES)

        event = {
            "summary": "Pill Reminder",
            "location": "Online",
            "description": "This is a pill reminder. Please join via your calendar.",
            "start": {
                "dateTime": event_start.isoformat(),
                "timeZone": timezone,
            },
            "end": {
                "dateTime": event_end.isoformat(),
                "timeZone": timezone,
            },
            "recurrence": [
                f"RRULE:FREQ=DAILY;COUNT={duration_days}"
            ],
            "attendees": [
                {"email": user_email}
            ],
            "reminders": {"useDefault": True}
        }

        try:
            created_event = service.events().insert(calendarId='primary', body=event, sendUpdates="all").execute()
            print(f"Event created and invitation sent to {user_email}: {created_event.get('htmlLink')}")
            return created_event 
        except HttpError as error:
            print(f"Failed to create event for {user_email}: {error}")
            return None