import datetime
import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Permission to create and manage calendar events
SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

def authenticate_google_calendar():
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


def algorithm(service, user_email, input_time_str, duration_days=14):
    today = datetime.date.today()
    hour, minute = map(int, input_time_str.split(":"))

    event_start = datetime.datetime.combine(today, datetime.time(hour, minute))
    event_end = event_start + datetime.timedelta(minutes=15)

    event = {
        "summary": "Pill Reminder",
        "location": "Online",
        "description": "This is a pill reminder. Please join via your calendar.",
        "start": {
            "dateTime": event_start.isoformat(),
            "timeZone": "Asia/Bangkok",
        },
        "end": {
            "dateTime": event_end.isoformat(),
            "timeZone": "Asia/Bangkok",
        },
        "recurrence": [
            f"RRULE:FREQ=DAILY;COUNT={duration_days}"
        ],
        "attendees": [
            {"email": user_email}
        ],
    }

    try:
        created_event = service.events().insert(calendarId='primary', body=event, sendUpdates="all").execute()
        print(f"Event created and invitation sent to {user_email}: {created_event.get('htmlLink')}")
    except HttpError as error:
        print(f"Failed to create event for {user_email}: {error}")