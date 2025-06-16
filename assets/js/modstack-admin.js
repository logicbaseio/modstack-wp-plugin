/**
 * ModStack Admin JavaScript
 * Handles admin interface functionality
 */

(function($) {
    'use strict';
    
    // Admin namespace
    window.ModStackAdmin = window.ModStackAdmin || {};
    
    // Configuration
    const config = {
        ajaxUrl: modstack_admin.ajax_url || ajaxurl,
        nonce: modstack_admin.nonce || '',
        strings: modstack_admin.strings || {}
    };
    
    // Utility functions
    const utils = {
        showNotice: function(message, type = 'success') {
            const notice = $(`
                <div class="notice notice-${type} is-dismissible">
                    <p>${message}</p>
                    <button type="button" class="notice-dismiss">
                        <span class="screen-reader-text">Dismiss this notice.</span>
                    </button>
                </div>
            `);
            
            $('.wrap h1').after(notice);
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                notice.fadeOut();
            }, 5000);
        },
        
        showLoading: function(element) {
            element.prop('disabled', true);
            element.after('<span class="modstack-loading"></span>');
        },
        
        hideLoading: function(element) {
            element.prop('disabled', false);
            element.siblings('.modstack-loading').remove();
        },
        
        validateApiKey: function(apiKey) {
            return apiKey && apiKey.length >= 32;
        },
        
        validateUrl: function(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        }
    };
    
    // Settings page functionality
    const SettingsPage = {
        init: function() {
            this.bindEvents();
            this.loadInitialData();
        },
        
        bindEvents: function() {
            // API key toggle
            $(document).on('click', '#toggle-api-key', this.toggleApiKey);
            
            // Test connection
            $(document).on('click', '#test-connection', this.testConnection);
            
            // Refresh chatbots
            $(document).on('click', '#refresh-chatbots', this.refreshChatbots);
            
            // Form validation
            $(document).on('submit', 'form', this.validateForm);
            
            // API key input validation
            $(document).on('input', '#modstack_api_key', this.validateApiKeyInput);
            
            // API URL input validation
            $(document).on('input', '#modstack_api_url', this.validateApiUrlInput);
        },
        
        loadInitialData: function() {
            // Load chatbots if API key exists
            const apiKey = $('#modstack_api_key').val();
            if (apiKey && utils.validateApiKey(apiKey)) {
                this.loadChatbots();
            }
        },
        
        toggleApiKey: function(e) {
            e.preventDefault();
            
            const input = $('#modstack_api_key');
            const button = $(this);
            
            if (input.attr('type') === 'password') {
                input.attr('type', 'text');
                button.text(config.strings.hide || 'Hide');
            } else {
                input.attr('type', 'password');
                button.text(config.strings.show || 'Show');
            }
        },
        
        testConnection: function(e) {
            e.preventDefault();
            
            const button = $(this);
            const status = $('#connection-status');
            const apiKey = $('#modstack_api_key').val();
            const apiUrl = $('#modstack_api_url').val();
            
            // Validate inputs
            if (!apiKey || !apiUrl) {
                status.removeClass('success').addClass('error')
                      .text(config.strings.enter_api_key_url || 'Please enter API key and URL');
                return;
            }
            
            if (!utils.validateApiKey(apiKey)) {
                status.removeClass('success').addClass('error')
                      .text(config.strings.invalid_api_key || 'Invalid API key format');
                return;
            }
            
            if (!utils.validateUrl(apiUrl)) {
                status.removeClass('success').addClass('error')
                      .text(config.strings.invalid_url || 'Invalid URL format');
                return;
            }
            
            utils.showLoading(button);
            status.removeClass('success error').text('');
            
            $.ajax({
                url: config.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'modstack_test_connection',
                    api_key: apiKey,
                    api_url: apiUrl,
                    nonce: config.nonce
                },
                timeout: 10000,
                success: function(response) {
                    if (response.success) {
                        status.removeClass('error').addClass('success')
                              .text(config.strings.connection_success || 'Connection successful!');
                        
                        // Auto-load chatbots on successful connection
                        setTimeout(() => {
                            SettingsPage.loadChatbots();
                        }, 1000);
                    } else {
                        status.removeClass('success').addClass('error')
                              .text(response.data || config.strings.connection_failed || 'Connection failed');
                    }
                },
                error: function(xhr, status, error) {
                    let errorMessage = config.strings.connection_failed || 'Connection failed';
                    
                    if (status === 'timeout') {
                        errorMessage = config.strings.connection_timeout || 'Connection timeout';
                    } else if (xhr.responseJSON && xhr.responseJSON.message) {
                        errorMessage = xhr.responseJSON.message;
                    }
                    
                    $('#connection-status').removeClass('success').addClass('error').text(errorMessage);
                },
                complete: function() {
                    utils.hideLoading(button);
                }
            });
        },
        
        refreshChatbots: function(e) {
            e.preventDefault();
            SettingsPage.loadChatbots();
        },
        
        loadChatbots: function() {
            const select = $('#modstack_selected_chatbot');
            const button = $('#refresh-chatbots');
            const currentValue = select.val();
            
            utils.showLoading(button);
            
            $.ajax({
                url: config.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'modstack_get_chatbots',
                    nonce: config.nonce
                },
                success: function(response) {
                    if (response.success && response.data) {
                        select.empty().append(`<option value="">${config.strings.select_chatbot || 'Select a chatbot'}</option>`);
                        
                        $.each(response.data, function(index, chatbot) {
                            const option = $('<option></option>')
                                .attr('value', chatbot.id)
                                .text(chatbot.name + (chatbot.status ? ` (${chatbot.status})` : ''));
                            
                            if (chatbot.id === currentValue) {
                                option.prop('selected', true);
                            }
                            
                            select.append(option);
                        });
                        
                        utils.showNotice(
                            config.strings.chatbots_loaded || `Loaded ${response.data.length} chatbots`,
                            'success'
                        );
                    } else {
                        utils.showNotice(
                            response.data || config.strings.failed_load_chatbots || 'Failed to load chatbots',
                            'error'
                        );
                    }
                },
                error: function() {
                    utils.showNotice(
                        config.strings.failed_load_chatbots || 'Failed to load chatbots',
                        'error'
                    );
                },
                complete: function() {
                    utils.hideLoading(button);
                }
            });
        },
        
        validateForm: function(e) {
            const apiKey = $('#modstack_api_key').val();
            const apiUrl = $('#modstack_api_url').val();
            
            let isValid = true;
            let errors = [];
            
            if (apiKey && !utils.validateApiKey(apiKey)) {
                errors.push(config.strings.invalid_api_key || 'Invalid API key format');
                isValid = false;
            }
            
            if (apiUrl && !utils.validateUrl(apiUrl)) {
                errors.push(config.strings.invalid_url || 'Invalid URL format');
                isValid = false;
            }
            
            if (!isValid) {
                e.preventDefault();
                utils.showNotice(errors.join('<br>'), 'error');
                return false;
            }
            
            return true;
        },
        
        validateApiKeyInput: function() {
            const input = $(this);
            const value = input.val();
            
            if (value && !utils.validateApiKey(value)) {
                input.addClass('invalid');
            } else {
                input.removeClass('invalid');
            }
        },
        
        validateApiUrlInput: function() {
            const input = $(this);
            const value = input.val();
            
            if (value && !utils.validateUrl(value)) {
                input.addClass('invalid');
            } else {
                input.removeClass('invalid');
            }
        }
    };
    
    // Chatbots page functionality
    const ChatbotsPage = {
        init: function() {
            this.bindEvents();
            this.loadChatbots();
        },
        
        bindEvents: function() {
            $(document).on('click', '.refresh-chatbots', this.refreshChatbots);
            $(document).on('click', '.chatbot-preview', this.previewChatbot);
            $(document).on('click', '.copy-shortcode', this.copyShortcode);
        },
        
        loadChatbots: function() {
            const container = $('#chatbots-list');
            
            container.html('<div class="modstack-loading-container"><span class="modstack-loading"></span> Loading chatbots...</div>');
            
            $.ajax({
                url: config.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'modstack_get_chatbots',
                    nonce: config.nonce
                },
                success: function(response) {
                    if (response.success && response.data) {
                        ChatbotsPage.renderChatbots(response.data);
                    } else {
                        container.html(`<div class="notice notice-error"><p>${response.data || 'Failed to load chatbots'}</p></div>`);
                    }
                },
                error: function() {
                    container.html('<div class="notice notice-error"><p>Failed to load chatbots</p></div>');
                }
            });
        },
        
        renderChatbots: function(chatbots) {
            const container = $('#chatbots-list');
            
            if (chatbots.length === 0) {
                container.html(`
                    <div class="notice notice-info">
                        <p>No chatbots found. <a href="https://app.modstack.ai/chatbots" target="_blank">Create one in your ModStack dashboard</a>.</p>
                    </div>
                `);
                return;
            }
            
            let html = '<div class="modstack-chatbots-grid">';
            
            chatbots.forEach(chatbot => {
                html += `
                    <div class="modstack-chatbot-card">
                        <div class="chatbot-header">
                            <h3>${chatbot.name}</h3>
                            <span class="chatbot-status status-${chatbot.status || 'active'}">${chatbot.status || 'Active'}</span>
                        </div>
                        <div class="chatbot-content">
                            <p class="chatbot-description">${chatbot.description || 'No description available'}</p>
                            <div class="chatbot-meta">
                                <span class="chatbot-id">ID: ${chatbot.id}</span>
                                <span class="chatbot-created">Created: ${chatbot.created_at || 'Unknown'}</span>
                            </div>
                        </div>
                        <div class="chatbot-actions">
                            <button class="button button-secondary chatbot-preview" data-id="${chatbot.id}">
                                Preview
                            </button>
                            <button class="button button-primary copy-shortcode" data-shortcode="[modstack-chatbot id=&quot;${chatbot.id}&quot;]">
                                Copy Shortcode
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            container.html(html);
        },
        
        refreshChatbots: function(e) {
            e.preventDefault();
            ChatbotsPage.loadChatbots();
        },
        
        previewChatbot: function(e) {
            e.preventDefault();
            
            const chatbotId = $(this).data('id');
            const previewUrl = `https://app.modstack.ai/preview/chatbot/${chatbotId}`;
            
            window.open(previewUrl, '_blank', 'width=400,height=600,scrollbars=yes,resizable=yes');
        },
        
        copyShortcode: function(e) {
            e.preventDefault();
            
            const shortcode = $(this).data('shortcode');
            const button = $(this);
            
            navigator.clipboard.writeText(shortcode).then(() => {
                const originalText = button.text();
                button.text('Copied!');
                
                setTimeout(() => {
                    button.text(originalText);
                }, 2000);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = shortcode;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                const originalText = button.text();
                button.text('Copied!');
                
                setTimeout(() => {
                    button.text(originalText);
                }, 2000);
            });
        }
    };
    
    // Ticket Forms page functionality
    const TicketFormsPage = {
        init: function() {
            this.bindEvents();
            this.loadTicketForms();
        },
        
        bindEvents: function() {
            $(document).on('click', '.refresh-forms', this.refreshForms);
            $(document).on('click', '.form-preview', this.previewForm);
            $(document).on('click', '.copy-shortcode', this.copyShortcode);
        },
        
        loadTicketForms: function() {
            const container = $('#ticket-forms-list');
            
            container.html('<div class="modstack-loading-container"><span class="modstack-loading"></span> Loading ticket forms...</div>');
            
            $.ajax({
                url: config.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'modstack_get_ticket_forms',
                    nonce: config.nonce
                },
                success: function(response) {
                    if (response.success && response.data) {
                        TicketFormsPage.renderTicketForms(response.data);
                    } else {
                        container.html(`<div class="notice notice-error"><p>${response.data || 'Failed to load ticket forms'}</p></div>`);
                    }
                },
                error: function() {
                    container.html('<div class="notice notice-error"><p>Failed to load ticket forms</p></div>');
                }
            });
        },
        
        renderTicketForms: function(forms) {
            const container = $('#ticket-forms-list');
            
            if (forms.length === 0) {
                container.html(`
                    <div class="notice notice-info">
                        <p>No ticket forms found. <a href="https://app.modstack.ai/forms" target="_blank">Create one in your ModStack dashboard</a>.</p>
                    </div>
                `);
                return;
            }
            
            let html = '<div class="modstack-forms-grid">';
            
            forms.forEach(form => {
                html += `
                    <div class="modstack-form-card">
                        <div class="form-header">
                            <h3>${form.name}</h3>
                            <span class="form-status status-${form.status || 'active'}">${form.status || 'Active'}</span>
                        </div>
                        <div class="form-content">
                            <p class="form-description">${form.description || 'No description available'}</p>
                            <div class="form-meta">
                                <span class="form-id">ID: ${form.id}</span>
                                <span class="form-fields">Fields: ${form.fields_count || 0}</span>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button class="button button-secondary form-preview" data-id="${form.id}">
                                Preview
                            </button>
                            <button class="button button-primary copy-shortcode" data-shortcode="[modstack-ticket-form id=&quot;${form.id}&quot;]">
                                Copy Shortcode
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            container.html(html);
        },
        
        refreshForms: function(e) {
            e.preventDefault();
            TicketFormsPage.loadTicketForms();
        },
        
        previewForm: function(e) {
            e.preventDefault();
            
            const formId = $(this).data('id');
            const previewUrl = `https://app.modstack.ai/preview/form/${formId}`;
            
            window.open(previewUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
        },
        
        copyShortcode: ChatbotsPage.copyShortcode // Reuse the same function
    };
    
    // Initialize based on current page
    $(document).ready(function() {
        const currentPage = $('body').attr('class');
        
        if (currentPage && currentPage.includes('modstack-settings')) {
            SettingsPage.init();
        } else if (currentPage && currentPage.includes('modstack-chatbots')) {
            ChatbotsPage.init();
        } else if (currentPage && currentPage.includes('modstack-ticket-forms')) {
            TicketFormsPage.init();
        }
        
        // Global admin functionality
        $(document).on('click', '.notice-dismiss', function() {
            $(this).closest('.notice').fadeOut();
        });
    });
    
    // Export to global scope
    window.ModStackAdmin = {
        SettingsPage,
        ChatbotsPage,
        TicketFormsPage,
        utils
    };
    
})(jQuery);