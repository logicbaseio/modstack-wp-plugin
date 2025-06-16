/**
 * ModStack Frontend JavaScript
 * Handles widget initialization and chat functionality
 */

(function($) {
    'use strict';
    
    // ModStack namespace
    window.ModStack = window.ModStack || {};
    
    // Configuration
    const config = {
        apiUrl: modstack_frontend.api_url || 'https://api.modstack.ai',
        apiKey: modstack_frontend.api_key || '',
        debug: modstack_frontend.debug || false
    };
    
    // Utility functions
    const utils = {
        log: function(message, data) {
            if (config.debug) {
                console.log('[ModStack]', message, data || '');
            }
        },
        
        error: function(message, error) {
            console.error('[ModStack Error]', message, error || '');
        },
        
        generateId: function() {
            return 'modstack-' + Math.random().toString(36).substr(2, 9);
        },
        
        sanitizeHtml: function(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    };
    
    // Widget class
    class ModStackWidget {
        constructor(options) {
            this.options = {
                modbotId: '',
                theme: 'light',
                position: 'bottom-right',
                height: '600px',
                width: '400px',
                title: 'Chat Support',
                ...options
            };
            
            this.isOpen = false;
            this.isInitialized = false;
            this.container = null;
            this.iframe = null;
            this.button = null;
            
            this.init();
        }
        
        init() {
            if (!this.options.modbotId) {
                utils.error('Modbot ID is required');
                return;
            }
            
            this.createWidget();
            this.bindEvents();
            this.isInitialized = true;
            
            utils.log('Widget initialized', this.options);
        }
        
        createWidget() {
            // Create container
            this.container = $('<div></div>')
                .attr('id', utils.generateId())
                .addClass('modstack-widget-container')
                .addClass('modstack-theme-' + this.options.theme)
                .addClass('modstack-position-' + this.options.position)
                .css({
                    position: 'fixed',
                    zIndex: 999999,
                    display: 'none'
                });
            
            // Set position
            this.setPosition();
            
            // Create toggle button
            this.button = $('<button></button>')
                .addClass('modstack-widget-button')
                .attr('aria-label', 'Open chat')
                .html(this.getButtonIcon())
                .css({
                    position: 'fixed',
                    zIndex: 1000000,
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s ease'
                });
            
            // Set button position
            this.setButtonPosition();
            
            // Create iframe
            this.iframe = $('<iframe></iframe>')
                .attr({
                    src: this.buildIframeUrl(),
                    frameborder: '0',
                    scrolling: 'no'
                })
                .css({
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '12px'
                });
            
            // Create header
            const header = $('<div></div>')
                .addClass('modstack-widget-header')
                .css({
                    padding: '16px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: this.options.theme === 'dark' ? '#1f2937' : '#ffffff',
                    color: this.options.theme === 'dark' ? '#ffffff' : '#1f2937',
                    borderRadius: '12px 12px 0 0'
                })
                .html(`
                    <span class="modstack-widget-title">${utils.sanitizeHtml(this.options.title)}</span>
                    <button class="modstack-widget-close" aria-label="Close chat" style="
                        background: none;
                        border: none;
                        font-size: 20px;
                        cursor: pointer;
                        color: inherit;
                        padding: 4px;
                        line-height: 1;
                    ">&times;</button>
                `);
            
            // Assemble widget
            this.container
                .append(header)
                .append($('<div></div>').css({
                    height: 'calc(100% - 60px)',
                    overflow: 'hidden'
                }).append(this.iframe));
            
            // Add to page
            $('body').append(this.container).append(this.button);
        }
        
        setPosition() {
            const positions = {
                'bottom-right': { bottom: '80px', right: '20px' },
                'bottom-left': { bottom: '80px', left: '20px' },
                'top-right': { top: '20px', right: '20px' },
                'top-left': { top: '20px', left: '20px' }
            };
            
            const pos = positions[this.options.position] || positions['bottom-right'];
            
            this.container.css({
                ...pos,
                width: this.options.width,
                height: this.options.height,
                backgroundColor: this.options.theme === 'dark' ? '#1f2937' : '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                border: this.options.theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb'
            });
        }
        
        setButtonPosition() {
            const positions = {
                'bottom-right': { bottom: '20px', right: '20px' },
                'bottom-left': { bottom: '20px', left: '20px' },
                'top-right': { top: '20px', right: '20px' },
                'top-left': { top: '20px', left: '20px' }
            };
            
            const pos = positions[this.options.position] || positions['bottom-right'];
            
            this.button.css({
                ...pos,
                backgroundColor: this.options.theme === 'dark' ? '#3b82f6' : '#2563eb',
                color: '#ffffff'
            });
        }
        
        getButtonIcon() {
            return `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 12H16M8 8H16M8 16H13M7 4V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20H7.5L4 23V6C4 4.89543 4.89543 4 6 4H7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
        }
        
        buildIframeUrl() {
            const params = new URLSearchParams({
                modbot_id: this.options.modbotId,
                theme: this.options.theme,
                embedded: 'true',
                origin: window.location.origin
            });
            
            return `${config.apiUrl}/embed/chat?${params.toString()}`;
        }
        
        bindEvents() {
            // Toggle button click
            this.button.on('click', () => {
                this.toggle();
            });
            
            // Close button click
            this.container.on('click', '.modstack-widget-close', () => {
                this.close();
            });
            
            // Escape key to close
            $(document).on('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
            
            // Click outside to close (optional)
            $(document).on('click', (e) => {
                if (this.isOpen && 
                    !this.container.is(e.target) && 
                    this.container.has(e.target).length === 0 &&
                    !this.button.is(e.target) &&
                    this.button.has(e.target).length === 0) {
                    // Uncomment to enable click-outside-to-close
                    // this.close();
                }
            });
            
            // Handle iframe messages
            window.addEventListener('message', (event) => {
                if (event.origin !== new URL(config.apiUrl).origin) {
                    return;
                }
                
                this.handleIframeMessage(event.data);
            });
        }
        
        handleIframeMessage(data) {
            utils.log('Received iframe message', data);
            
            switch (data.type) {
                case 'resize':
                    if (data.height) {
                        this.container.css('height', data.height + 'px');
                    }
                    break;
                    
                case 'close':
                    this.close();
                    break;
                    
                case 'notification':
                    this.showNotification(data.message);
                    break;
            }
        }
        
        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }
        
        open() {
            if (this.isOpen) return;
            
            this.container.fadeIn(300);
            this.button.css('transform', 'scale(0.9)');
            this.isOpen = true;
            
            // Send message to iframe
            this.postMessageToIframe({ type: 'widget_opened' });
            
            utils.log('Widget opened');
        }
        
        close() {
            if (!this.isOpen) return;
            
            this.container.fadeOut(300);
            this.button.css('transform', 'scale(1)');
            this.isOpen = false;
            
            // Send message to iframe
            this.postMessageToIframe({ type: 'widget_closed' });
            
            utils.log('Widget closed');
        }
        
        postMessageToIframe(message) {
            if (this.iframe && this.iframe[0].contentWindow) {
                this.iframe[0].contentWindow.postMessage(message, config.apiUrl);
            }
        }
        
        showNotification(message) {
            // Simple notification - can be enhanced
            const notification = $('<div></div>')
                .addClass('modstack-notification')
                .text(message)
                .css({
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    zIndex: 1000001,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                });
            
            $('body').append(notification);
            
            setTimeout(() => {
                notification.fadeOut(300, function() {
                    $(this).remove();
                });
            }, 3000);
        }
        
        destroy() {
            if (this.container) {
                this.container.remove();
            }
            if (this.button) {
                this.button.remove();
            }
            
            utils.log('Widget destroyed');
        }
    }
    
    // Ticket Form class
    class ModStackTicketForm {
        constructor(element, options) {
            this.element = $(element);
            this.options = {
                formId: '',
                theme: 'light',
                ...options
            };
            
            this.init();
        }
        
        init() {
            if (!this.options.formId) {
                utils.error('Form ID is required');
                return;
            }
            
            this.createForm();
            utils.log('Ticket form initialized', this.options);
        }
        
        createForm() {
            const iframe = $('<iframe></iframe>')
                .attr({
                    src: this.buildIframeUrl(),
                    frameborder: '0',
                    scrolling: 'auto'
                })
                .css({
                    width: '100%',
                    minHeight: '400px',
                    border: 'none',
                    borderRadius: '8px'
                });
            
            this.element.empty().append(iframe);
        }
        
        buildIframeUrl() {
            const params = new URLSearchParams({
                form_id: this.options.formId,
                theme: this.options.theme,
                embedded: 'true',
                origin: window.location.origin
            });
            
            return `${config.apiUrl}/embed/form?${params.toString()}`;
        }
    }
    
    // Modbot Embed class
    class ModStackModbot {
        constructor(element, options) {
            this.element = $(element);
            this.options = {
                modbotId: '',
                theme: 'light',
                height: '500px',
                ...options
            };
            
            this.init();
        }
        
        init() {
            if (!this.options.modbotId) {
                utils.error('Modbot ID is required');
                return;
            }
            
            this.createModbot();
            utils.log('Modbot embed initialized', this.options);
        }
        
        createModbot() {
            const iframe = $('<iframe></iframe>')
                .attr({
                    src: this.buildIframeUrl(),
                    frameborder: '0',
                    scrolling: 'no'
                })
                .css({
                    width: '100%',
                    height: this.options.height,
                    border: 'none',
                    borderRadius: '8px'
                });
            
            this.element.empty().append(iframe);
        }
        
        buildIframeUrl() {
            const params = new URLSearchParams({
                modbot_id: this.options.modbotId,
                theme: this.options.theme,
                embedded: 'true',
                origin: window.location.origin
            });
            
            return `${config.apiUrl}/embed/chat?${params.toString()}`;
        }
    }
    
    // Public API
    window.ModStack = {
        Widget: ModStackWidget,
        TicketForm: ModStackTicketForm,
        Chatbot: ModStackChatbot,
        
        // Initialize global widget
        initGlobalWidget: function(options) {
            if (window.modstackGlobalWidget) {
                window.modstackGlobalWidget.destroy();
            }
            
            window.modstackGlobalWidget = new ModStackWidget(options);
            return window.modstackGlobalWidget;
        },
        
        // Initialize all shortcode elements
        initShortcodes: function() {
            // Initialize chatbot shortcodes
            $('.modstack-chatbot-shortcode').each(function() {
                const $this = $(this);
                const options = {
                    chatbotId: $this.data('chatbot-id'),
                    theme: $this.data('theme') || 'light',
                    height: $this.data('height') || '500px'
                };
                
                new ModStackChatbot(this, options);
            });
            
            // Initialize ticket form shortcodes
            $('.modstack-ticket-form-shortcode').each(function() {
                const $this = $(this);
                const options = {
                    formId: $this.data('form-id'),
                    theme: $this.data('theme') || 'light'
                };
                
                new ModStackTicketForm(this, options);
            });
            
            // Initialize widget shortcodes
            $('.modstack-widget-shortcode').each(function() {
                const $this = $(this);
                const options = {
                    chatbotId: $this.data('chatbot-id'),
                    theme: $this.data('theme') || 'light',
                    position: $this.data('position') || 'bottom-right',
                    title: $this.data('title') || 'Chat Support'
                };
                
                new ModStackWidget(options);
            });
        }
    };
    
    // Auto-initialize on document ready
    $(document).ready(function() {
        utils.log('ModStack frontend loaded');
        
        // Initialize shortcodes
        window.ModStack.initShortcodes();
        
        // Initialize global widget if configured
        if (modstack_frontend.global_widget && modstack_frontend.global_widget.enabled) {
            window.ModStack.initGlobalWidget(modstack_frontend.global_widget);
        }
    });
    
})(jQuery);