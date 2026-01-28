/**
 * THE LAB REPTILES - ANALYTICS & TRACKING
 * Google Analytics 4 + Meta Pixel Integration
 *
 * CONFIGURATION:
 * Replace the placeholder values with your actual tracking IDs
 */

const AnalyticsConfig = {
    // Google Analytics 4 Measurement ID
    GA4_MEASUREMENT_ID: 'G-45TTT09VBL',

    // Meta (Facebook) Pixel ID
    META_PIXEL_ID: 'YOUR_META_PIXEL_ID_HERE',

    // Enable/disable tracking (useful for development)
    ENABLED: true,

    // Debug mode - logs events to console
    DEBUG: false
};

/**
 * Google Analytics 4 Integration
 */
const GoogleAnalytics = {
    initialized: false,

    // Initialize GA4
    init() {
        if (!AnalyticsConfig.ENABLED || this.initialized) return;
        if (AnalyticsConfig.GA4_MEASUREMENT_ID === 'YOUR_GA4_MEASUREMENT_ID_HERE') {
            console.warn('Google Analytics: Measurement ID not configured');
            return;
        }

        // Load gtag.js
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${AnalyticsConfig.GA4_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        // Initialize dataLayer
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
            window.dataLayer.push(arguments);
        };

        window.gtag('js', new Date());
        window.gtag('config', AnalyticsConfig.GA4_MEASUREMENT_ID, {
            'anonymize_ip': true,
            'cookie_flags': 'SameSite=None;Secure'
        });

        this.initialized = true;

        if (AnalyticsConfig.DEBUG) {
            console.log('Google Analytics initialized:', AnalyticsConfig.GA4_MEASUREMENT_ID);
        }
    },

    // Track page view
    pageView(pagePath, pageTitle) {
        if (!this.initialized || !window.gtag) return;

        window.gtag('event', 'page_view', {
            page_path: pagePath || window.location.pathname,
            page_title: pageTitle || document.title
        });

        if (AnalyticsConfig.DEBUG) {
            console.log('GA4 Page View:', pagePath || window.location.pathname);
        }
    },

    // Track custom event
    event(eventName, params = {}) {
        if (!this.initialized || !window.gtag) return;

        window.gtag('event', eventName, params);

        if (AnalyticsConfig.DEBUG) {
            console.log('GA4 Event:', eventName, params);
        }
    },

    // Track animal view
    viewAnimal(animalId, animalName, price) {
        this.event('view_item', {
            currency: 'CAD',
            value: parseFloat(price.replace('$', '')) || 0,
            items: [{
                item_id: animalId,
                item_name: animalName,
                price: parseFloat(price.replace('$', '')) || 0
            }]
        });
    },

    // Track inquiry submission
    trackInquiry(animalId, animalName) {
        this.event('generate_lead', {
            currency: 'CAD',
            item_id: animalId,
            item_name: animalName
        });
    },

    // Track caresheet download
    trackCaresheetDownload(caresheetType) {
        this.event('file_download', {
            file_name: `caresheet_${caresheetType}`,
            file_extension: 'pdf'
        });
    },

    // Track email signup
    trackEmailSignup(signupType) {
        this.event('sign_up', {
            method: 'email',
            signup_type: signupType
        });
    },

    // Track MorphMarket click
    trackMorphMarketClick(animalId, animalName) {
        this.event('click', {
            link_type: 'morphmarket',
            item_id: animalId,
            item_name: animalName
        });
    }
};

/**
 * Meta (Facebook) Pixel Integration
 */
const MetaPixel = {
    initialized: false,

    // Initialize Meta Pixel
    init() {
        if (!AnalyticsConfig.ENABLED || this.initialized) return;
        if (AnalyticsConfig.META_PIXEL_ID === 'YOUR_META_PIXEL_ID_HERE') {
            if (AnalyticsConfig.DEBUG) {
                console.warn('Meta Pixel: Pixel ID not configured');
            }
            return;
        }

        // Meta Pixel base code
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');

        window.fbq('init', AnalyticsConfig.META_PIXEL_ID);
        window.fbq('track', 'PageView');

        this.initialized = true;

        if (AnalyticsConfig.DEBUG) {
            console.log('Meta Pixel initialized:', AnalyticsConfig.META_PIXEL_ID);
        }
    },

    // Track page view
    pageView() {
        if (!this.initialized || !window.fbq) return;
        window.fbq('track', 'PageView');
    },

    // Track custom event
    track(eventName, params = {}) {
        if (!this.initialized || !window.fbq) return;

        window.fbq('track', eventName, params);

        if (AnalyticsConfig.DEBUG) {
            console.log('Meta Pixel Event:', eventName, params);
        }
    },

    // Track animal view
    viewAnimal(animalId, animalName, price) {
        this.track('ViewContent', {
            content_type: 'product',
            content_ids: [animalId],
            content_name: animalName,
            value: parseFloat(price.replace('$', '')) || 0,
            currency: 'CAD'
        });
    },

    // Track inquiry/lead
    trackInquiry(animalId, animalName, price) {
        this.track('Lead', {
            content_category: 'reptile_inquiry',
            content_ids: [animalId],
            content_name: animalName,
            value: parseFloat(price.replace('$', '')) || 0,
            currency: 'CAD'
        });
    },

    // Track email signup
    trackEmailSignup(signupType) {
        this.track('CompleteRegistration', {
            content_name: signupType,
            status: true
        });
    },

    // Track caresheet download
    trackCaresheetDownload(caresheetType) {
        this.track('Lead', {
            content_category: 'caresheet_download',
            content_name: caresheetType
        });
    }
};

/**
 * Unified Analytics API
 * Use this for tracking across all platforms
 */
const Analytics = {
    // Initialize all analytics
    init() {
        GoogleAnalytics.init();
        MetaPixel.init();

        if (AnalyticsConfig.DEBUG) {
            console.log('All analytics initialized');
        }
    },

    // Track page view on all platforms
    pageView(pagePath, pageTitle) {
        GoogleAnalytics.pageView(pagePath, pageTitle);
        MetaPixel.pageView();
    },

    // Track animal view
    viewAnimal(animalId, animalName, price) {
        GoogleAnalytics.viewAnimal(animalId, animalName, price);
        MetaPixel.viewAnimal(animalId, animalName, price);
    },

    // Track inquiry
    trackInquiry(animalId, animalName, price) {
        GoogleAnalytics.trackInquiry(animalId, animalName);
        MetaPixel.trackInquiry(animalId, animalName, price);
    },

    // Track email signup
    trackEmailSignup(signupType) {
        GoogleAnalytics.trackEmailSignup(signupType);
        MetaPixel.trackEmailSignup(signupType);
    },

    // Track caresheet download
    trackCaresheetDownload(caresheetType) {
        GoogleAnalytics.trackCaresheetDownload(caresheetType);
        MetaPixel.trackCaresheetDownload(caresheetType);
    },

    // Track MorphMarket click
    trackMorphMarketClick(animalId, animalName) {
        GoogleAnalytics.trackMorphMarketClick(animalId, animalName);
    },

    // Track custom event (GA4 only)
    customEvent(eventName, params = {}) {
        GoogleAnalytics.event(eventName, params);
    }
};

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Analytics.init());
    } else {
        Analytics.init();
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AnalyticsConfig,
        GoogleAnalytics,
        MetaPixel,
        Analytics
    };
}
