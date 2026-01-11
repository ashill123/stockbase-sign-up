import ReactGA from 'react-ga4';

// Google Analytics 4 configuration
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export function initAnalytics() {
  if (typeof window === 'undefined') return;

  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics Measurement ID not found. Analytics disabled.');
    return;
  }

  ReactGA.initialize(GA_MEASUREMENT_ID, {
    gaOptions: {
      debug_mode: import.meta.env.DEV,
    },
  });

  // Send initial pageview
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
}

// Analytics event tracking functions
export const analytics = {
  // Page views
  pageView: (pageName?: string) => {
    ReactGA.send({
      hitType: 'pageview',
      page: pageName || window.location.pathname,
    });
  },

  // Generic event tracking
  track: (eventName: string, parameters?: Record<string, any>) => {
    ReactGA.event(eventName, parameters);
  },

  // Modal events
  modalOpened: (mode: 'form' | 'chat', trigger: 'auto' | 'button' | 'cta') => {
    ReactGA.event('modal_opened', {
      mode,
      trigger,
      event_category: 'engagement',
      event_label: `${mode}_${trigger}`,
    });
  },

  modalClosed: (mode: 'form' | 'chat', duration?: number) => {
    ReactGA.event('modal_closed', {
      mode,
      duration_seconds: duration,
      event_category: 'engagement',
      event_label: mode,
    });
  },

  // Form events
  formStarted: () => {
    ReactGA.event('begin_checkout', {
      event_category: 'conversion',
      event_label: 'waitlist_form',
    });
  },

  formFieldFocused: (fieldName: string) => {
    ReactGA.event('form_field_focused', {
      field_name: fieldName,
      event_category: 'engagement',
      event_label: fieldName,
    });
  },

  formSubmitted: (email: string, firstName: string) => {
    const emailDomain = email.split('@')[1];

    ReactGA.event('generate_lead', {
      event_category: 'conversion',
      event_label: 'waitlist_submission',
      email_domain: emailDomain,
      user_type: emailDomain.includes('gmail') ? 'consumer' : 'business',
    });

    // Set user properties for enhanced tracking
    ReactGA.gtag('set', 'user_properties', {
      signup_date: new Date().toISOString().split('T')[0],
      source: 'website',
    });
  },

  formSuccess: () => {
    ReactGA.event('purchase', {
      event_category: 'conversion',
      event_label: 'waitlist_signup_success',
      value: 1, // Assign value to track conversion value
      currency: 'USD',
    });
  },

  formError: (errorMessage: string) => {
    ReactGA.event('exception', {
      description: errorMessage,
      fatal: false,
      event_category: 'error',
      event_label: 'waitlist_form_error',
    });
  },

  // Chat events
  chatModeEntered: (source: 'button' | 'modal_link') => {
    ReactGA.event('chat_mode_entered', {
      source,
      event_category: 'engagement',
      event_label: `chat_from_${source}`,
    });
  },

  chatMessageSent: (messageLength: number, isFirstMessage: boolean) => {
    ReactGA.event('chat_message_sent', {
      message_length: messageLength,
      is_first_message: isFirstMessage,
      event_category: 'engagement',
      event_label: isFirstMessage ? 'first_message' : 'subsequent_message',
    });
  },

  chatSuggestionClicked: (suggestionText: string) => {
    ReactGA.event('select_content', {
      content_type: 'chat_suggestion',
      item_id: suggestionText.substring(0, 50),
      event_category: 'engagement',
      event_label: 'suggestion_clicked',
    });
  },

  chatLimitReached: (interactionCount: number) => {
    ReactGA.event('chat_limit_reached', {
      total_interactions: interactionCount,
      event_category: 'engagement',
      event_label: 'freemium_gate',
    });
  },

  chatResponseReceived: (responseLength: number, timeToRespond?: number) => {
    ReactGA.event('chat_response_received', {
      response_length: responseLength,
      response_time_ms: timeToRespond,
      event_category: 'engagement',
      event_label: 'ai_response',
    });
  },

  // CTA events
  ctaClicked: (location: 'hero' | 'floating_button') => {
    ReactGA.event('select_promotion', {
      promotion_name: 'waitlist_cta',
      creative_slot: location,
      event_category: 'engagement',
      event_label: `cta_${location}`,
    });
  },

  // Engagement metrics
  timeOnPage: (seconds: number) => {
    ReactGA.event('timing_complete', {
      name: 'time_on_page',
      value: seconds,
      event_category: 'engagement',
    });
  },
};

export default analytics;
