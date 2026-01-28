/**
 * THE LAB REPTILES - MAILERLITE INTEGRATION
 * Email subscription management for caresheets and inquiries
 *
 * CONFIGURATION:
 * Replace the placeholder values below with your actual MailerLite credentials
 */

const MailerLiteConfig = {
    // MailerLite API Key
    API_KEY: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiYTFiZmIwYjdlMTFiYjRmYjNhYWNmZDIwOGJkYWQzYWUyYjk0OTMyY2JiYmFhOTY5NTQ4YjNmYjA3NWZjMDZjNzUyMTI1ZTY3YTQyZDE2ZjciLCJpYXQiOjE3Njk1NjA5NTkuNzc3Mjc5LCJuYmYiOjE3Njk1NjA5NTkuNzc3MjgyLCJleHAiOjQ5MjUyMzQ1NTkuNzY3ODA5LCJzdWIiOiIyMDg3NDA4Iiwic2NvcGVzIjpbXX0.s5dDyDPdI68Sb3yKFXUgYjn6CArsajo1O-BbI85M4O5YQ3gvCxG-tWZgyJCiKqUUFXt-Z14apvv_D8Fw_rTz7HNXsTQmydIoBYpKVtoph0XQKzWTkNaNBXtgR38QRRWOAGhzctfyjkdR9_fWCw2AuN04vgKcTUQkuGg-adZxbJg5Ax4xMPSH5viJw6t-iW3YRBXxh34_QId6z7eZNLzaUaMRwnesXi4fAMFM9WzbWFNcO6XTm1wgEIx-CQZWDT9NwvEHauynuXOTgjm5b4HOgRRkW9idZv-bjzJWsky6RKbNcA11juW_O67lmPXf_GSWDi7HhG1oHy0828L0F6-8DY-2CWGFfmi1C7nOSgqVKYHR2B1lj962GqUKFtjpgIeaKbXlCz3AVTWJJBoFHUHdvEbWwzPVLwepSAPSPWXR1de9dkjiiKn9U3A7Lf0O_9CG3g-eHIeQnBIzE-0XjFKvaYKop3vLNZNrTWJK1ifhCOLD9LhDPYs6E_Sh_6kjhI-KiJbGNRjq6Kd3UY2t9TSg5IucmhBIc1nDMxE2D0eTRpIISneEi3VeY3M1484C91_m2UuyIXZ4hIy4MNWgsywQT0K3YV_qoB-racv1sHS8_dwvwHxlqIBGIZsvqYR1haxb6JsSHZ8E8kL282Ij9TUdIxicLctu9BaPdUsDioDkOwk',

    // Group IDs for different subscription types
    GROUPS: {
        // Group for caresheet downloads (Free Document Leads)
        CARESHEETS: '177797313671988376',
        // Group for animal inquiries / purchase documents
        INQUIRIES: '177798385247454861'
    },

    // API Base URL (MailerLite Classic API)
    API_BASE: 'https://connect.mailerlite.com/api'
};

/**
 * MailerLite API Service
 * Handles all email subscription operations
 */
const MailerLiteService = {
    /**
     * Subscribe an email to a specific group
     * @param {string} email - The email address to subscribe
     * @param {string} groupId - The MailerLite group ID
     * @param {Object} fields - Additional subscriber fields
     * @returns {Promise<Object>} - API response
     */
    async subscribe(email, groupId, fields = {}) {
        try {
            const response = await fetch(`${MailerLiteConfig.API_BASE}/subscribers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MailerLiteConfig.API_KEY}`
                },
                body: JSON.stringify({
                    email: email,
                    groups: [groupId],
                    fields: fields,
                    status: 'active'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Subscription failed');
            }

            return { success: true, data: data };
        } catch (error) {
            console.error('MailerLite subscription error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Subscribe for caresheet access
     * @param {string} email - Email address
     * @param {string} caresheetType - Type of caresheet (e.g., 'gargoyle', 'ball_python')
     */
    async subscribeForCaresheet(email, caresheetType = '') {
        return this.subscribe(
            email,
            MailerLiteConfig.GROUPS.CARESHEETS,
            {
                caresheet_type: caresheetType,
                signup_source: 'caresheet_download',
                signup_date: new Date().toISOString()
            }
        );
    },

    /**
     * Subscribe for animal inquiry (purchase documents)
     * @param {string} email - Email address
     * @param {string} animalId - The animal ID being inquired about
     * @param {string} animalName - The animal name/morph
     */
    async subscribeForInquiry(email, animalId = '', animalName = '') {
        return this.subscribe(
            email,
            MailerLiteConfig.GROUPS.INQUIRIES,
            {
                animal_id: animalId,
                animal_name: animalName,
                inquiry_type: 'purchase',
                signup_source: 'animal_inquiry',
                signup_date: new Date().toISOString()
            }
        );
    }
};

/**
 * Email validation utility
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Modal System for Email Collection
 */
const EmailModal = {
    // Create modal HTML structure
    createModal(options = {}) {
        const {
            title = 'Enter Your Email',
            subtitle = '',
            buttonText = 'Submit',
            type = 'inquiry', // 'inquiry' or 'caresheet'
            animalId = '',
            animalName = '',
            caresheetType = ''
        } = options;

        const modalId = `email-modal-${Date.now()}`;

        const modalHTML = `
            <div id="${modalId}" class="email-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="${modalId}-title">
                <div class="email-modal">
                    <button class="email-modal-close" aria-label="Close modal" onclick="EmailModal.close('${modalId}')">&times;</button>

                    <div class="email-modal-header">
                        <h2 id="${modalId}-title" class="bacon-text">${title}</h2>
                        ${subtitle ? `<p class="email-modal-subtitle">${subtitle}</p>` : ''}
                    </div>

                    <form class="email-modal-form" onsubmit="EmailModal.handleSubmit(event, '${modalId}', '${type}', '${animalId}', '${animalName}', '${caresheetType}')">
                        <div class="email-input-group">
                            <label for="${modalId}-email" class="sr-only">Email Address</label>
                            <input
                                type="email"
                                id="${modalId}-email"
                                name="email"
                                placeholder="Enter your email address"
                                required
                                autocomplete="email"
                                class="email-modal-input"
                            >
                        </div>

                        <button type="submit" class="email-modal-submit btn">
                            ${buttonText}
                        </button>

                        <p class="email-modal-privacy">
                            We respect your privacy. Unsubscribe anytime.
                        </p>
                    </form>

                    <div class="email-modal-success" style="display: none;">
                        <div class="success-icon">&#10003;</div>
                        <h3>Thank You!</h3>
                        <p class="success-message"></p>
                    </div>

                    <div class="email-modal-error" style="display: none;">
                        <p class="error-message"></p>
                    </div>
                </div>
            </div>
        `;

        return { html: modalHTML, id: modalId };
    },

    // Open modal
    open(options) {
        const { html, id } = this.createModal(options);

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', html);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus the email input
        setTimeout(() => {
            const input = document.querySelector(`#${id}-email`);
            if (input) input.focus();
        }, 100);

        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.close(id);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Close on overlay click
        const modal = document.getElementById(id);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close(id);
        });

        return id;
    },

    // Close modal
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 200);
        }
    },

    // Handle form submission
    async handleSubmit(event, modalId, type, animalId, animalName, caresheetType) {
        event.preventDefault();

        const form = event.target;
        const email = form.querySelector('input[type="email"]').value;
        const submitBtn = form.querySelector('button[type="submit"]');
        const successDiv = form.parentElement.querySelector('.email-modal-success');
        const errorDiv = form.parentElement.querySelector('.email-modal-error');

        // Validate email
        if (!isValidEmail(email)) {
            errorDiv.querySelector('.error-message').textContent = 'Please enter a valid email address.';
            errorDiv.style.display = 'block';
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        errorDiv.style.display = 'none';

        let result;

        if (type === 'caresheet') {
            result = await MailerLiteService.subscribeForCaresheet(email, caresheetType);
        } else {
            result = await MailerLiteService.subscribeForInquiry(email, animalId, animalName);
        }

        if (result.success) {
            // Show success message
            form.style.display = 'none';
            successDiv.style.display = 'block';

            if (type === 'caresheet') {
                successDiv.querySelector('.success-message').textContent =
                    'Check your email for the care guide download link!';
            } else {
                successDiv.querySelector('.success-message').textContent =
                    'We\'ll be in touch soon with more information about this gecko!';
            }

            // Store in localStorage to track submission
            localStorage.setItem(`email_submitted_${type}_${animalId || caresheetType}`, 'true');

            // Close after delay
            setTimeout(() => this.close(modalId), 3000);
        } else {
            // Show error
            submitBtn.disabled = false;
            submitBtn.textContent = 'Try Again';
            errorDiv.querySelector('.error-message').textContent =
                result.error || 'Something went wrong. Please try again.';
            errorDiv.style.display = 'block';
        }
    },

    // Open inquiry modal for an animal
    openInquiryModal(animalId, animalName, price) {
        return this.open({
            title: 'Inquire About This Gecko',
            subtitle: `${animalName} - ${price}`,
            buttonText: 'Send Inquiry',
            type: 'inquiry',
            animalId: animalId,
            animalName: animalName
        });
    },

    // Open caresheet download modal
    openCaresheetModal(caresheetType, caresheetTitle) {
        return this.open({
            title: 'Download Care Guide',
            subtitle: caresheetTitle,
            buttonText: 'Get Free Care Guide',
            type: 'caresheet',
            caresheetType: caresheetType
        });
    }
};

// Add modal styles to the page
const modalStyles = `
<style>
/* Email Modal Overlay */
.email-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
    opacity: 1;
    transition: opacity 0.2s ease;
}

/* Email Modal Container */
.email-modal {
    background: #151515;
    border: 1px solid #333;
    border-radius: 12px;
    max-width: 450px;
    width: 100%;
    padding: 40px;
    position: relative;
    animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Close Button */
.email-modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    color: #666;
    font-size: 28px;
    cursor: pointer;
    line-height: 1;
    padding: 5px;
    transition: color 0.2s ease;
}

.email-modal-close:hover {
    color: #fff;
}

/* Modal Header */
.email-modal-header {
    text-align: center;
    margin-bottom: 30px;
}

.email-modal-header h2 {
    font-size: 1.8rem;
    font-weight: 900;
    text-transform: uppercase;
    margin: 0 0 10px;
}

.email-modal-subtitle {
    color: #888;
    font-size: 1rem;
    margin: 0;
}

/* Form Styles */
.email-modal-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.email-input-group {
    position: relative;
}

.email-modal-input {
    width: 100%;
    padding: 16px 20px;
    background: #0a0a0a;
    border: 2px solid #333;
    border-radius: 6px;
    color: #fff;
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.2s ease;
}

.email-modal-input:focus {
    outline: none;
    border-color: #ff9100;
}

.email-modal-input::placeholder {
    color: #666;
}

.email-modal-submit {
    width: 100%;
    margin-top: 10px;
}

.email-modal-privacy {
    text-align: center;
    font-size: 0.75rem;
    color: #555;
    margin: 10px 0 0;
}

/* Success State */
.email-modal-success {
    text-align: center;
    padding: 20px 0;
}

.success-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(90deg, #ff002b 0%, #ff9100 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-size: 30px;
    color: white;
}

.email-modal-success h3 {
    font-size: 1.5rem;
    margin: 0 0 10px;
    color: #fff;
}

.success-message {
    color: #888;
    margin: 0;
}

/* Error State */
.email-modal-error {
    background: rgba(255, 0, 43, 0.1);
    border: 1px solid rgba(255, 0, 43, 0.3);
    border-radius: 6px;
    padding: 12px;
    margin-top: 10px;
}

.error-message {
    color: #ff002b;
    font-size: 0.9rem;
    margin: 0;
    text-align: center;
}

/* Screen Reader Only */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
</style>
`;

// Inject styles when the script loads
if (typeof document !== 'undefined') {
    document.head.insertAdjacentHTML('beforeend', modalStyles);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MailerLiteConfig,
        MailerLiteService,
        EmailModal,
        isValidEmail
    };
}
