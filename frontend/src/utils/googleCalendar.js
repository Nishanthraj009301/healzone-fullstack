import { gapi } from 'gapi-script';
 
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const API_KEY = 'YOUR_GOOGLE_API_KEY';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
 
export const initGoogleApi = () =>
  new Promise((resolve, reject) => {
    gapi.load('client:auth2', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        });
 
        const auth = gapi.auth2.getAuthInstance();
        if (!auth.isSignedIn.get()) {
          await auth.signIn();
        }
 
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
 
export const GoogleCalendar = async appointment => {
  const event = {
    summary: `Appointment with ${appointment.appointment_with}`,
    location: 'Your Clinic/Spa Location',
    description: appointment.remarks || 'Appointment Details',
    start: {
      dateTime: new Date(
        `${appointment.appointment_date}T${appointment.appointment_time}`,
      ).toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: new Date(
        new Date(`${appointment.appointment_date}T${appointment.appointment_time}`).getTime() +
          30 * 60000,
      ).toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 10 },
        { method: 'email', minutes: 30 },
      ],
    },
  };
 
  try {
    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    console.log('Event created:', response);
    alert('Google Calendar event created!');
  } catch (err) {
    console.error('Failed to create calendar event:', err);
  }
};