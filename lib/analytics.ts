import posthog from 'posthog-js';

// PostHog configuration
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_API_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

// Initialize PostHog
export function initAnalytics() {
  if (typeof window === 'undefined') return;

  if (!POSTHOG_KEY) {
    console.warn('PostHog API key not found. Analytics disabled.');
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    session_recording: {
      recordCrossOriginIframes: false,
    },
    loaded: (posthog) => {
      if (import.meta.env.DEV) {
        posthog.debug();
      }
    },
  });
}

// Analytics event tracking functions
export const analytics = {
  // Page views (automatically tracked by PostHog)
  pageView: (pageName?: string) => {
    if (pageName) {
      posthog.capture('$pageview', { page: pageName });
    }
  },

  // User interactions
  track: (eventName: string, properties?: Record<string, any>) => {
    posthog.capture(eventName, properties);
  },

  // Modal events
  modalOpened: (mode: 'form' | 'chat', trigger: 'auto' | 'button' | 'cta') => {
    posthog.capture('modal_opened', {
      mode,
      trigger,
      timestamp: new Date().toISOString(),
    });
  },

  modalClosed: (mode: 'form' | 'chat', duration?: number) => {
    posthog.capture('modal_closed', {
      mode,
      duration_seconds: duration,
      timestamp: new Date().toISOString(),
    });
  },

  // Form events
  formStarted: () => {
    posthog.capture('waitlist_form_started');
  },

  formFieldFocused: (fieldName: string) => {
    posthog.capture('form_field_focused', { field: fieldName });
  },

  formSubmitted: (email: string, firstName: string) => {
    posthog.capture('waitlist_form_submitted', {
      email_domain: email.split('@')[1],
      timestamp: new Date().toISOString(),
    });

    // Identify user for future tracking
    posthog.identify(email, {
      email,
      first_name: firstName,
      signup_date: new Date().toISOString(),
      source: 'website',
    });
  },

  formSuccess: () => {
    posthog.capture('waitlist_signup_success');
  },

  formError: (errorMessage: string) => {
    posthog.capture('waitlist_form_error', {
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
  },

  // Chat events
  chatModeEntered: (source: 'button' | 'modal_link') => {
    posthog.capture('chat_mode_entered', { source });
  },

  chatMessageSent: (messageLength: number, isFirstMessage: boolean) => {
    posthog.capture('chat_message_sent', {
      message_length: messageLength,
      is_first_message: isFirstMessage,
      timestamp: new Date().toISOString(),
    });
  },

  chatSuggestionClicked: (suggestionText: string) => {
    posthog.capture('chat_suggestion_clicked', {
      suggestion: suggestionText,
    });
  },

  chatLimitReached: (interactionCount: number) => {
    posthog.capture('chat_limit_reached', {
      total_interactions: interactionCount,
      timestamp: new Date().toISOString(),
    });
  },

  chatResponseReceived: (responseLength: number, timeToRespond?: number) => {
    posthog.capture('chat_response_received', {
      response_length: responseLength,
      response_time_ms: timeToRespond,
    });
  },

  // CTA events
  ctaClicked: (location: 'hero' | 'floating_button') => {
    posthog.capture('cta_clicked', {
      location,
      timestamp: new Date().toISOString(),
    });
  },

  // Engagement metrics
  timeOnPage: (seconds: number) => {
    posthog.capture('time_on_page', {
      duration_seconds: seconds,
    });
  },

  // User identification
  identify: (email: string, properties?: Record<string, any>) => {
    posthog.identify(email, properties);
  },

  // Reset on logout/clear
  reset: () => {
    posthog.reset();
  },
};

export default analytics;
