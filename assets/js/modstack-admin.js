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
            
            // Refresh modbots
            $(document).on('click', '#refresh-modbots', this.refreshModbots);
            
            // Form validation
            $(document).on('submit', 'form', this.validateForm);
            
            // API key input validation
            $(document).on('input', '#modstack_api_key', this.validateApiKeyInput);
            
            // API URL input validation
            $(document).on('input', '#modstack_api_url', this.validateApiUrlInput);
        },
        
        loadInitialData: function() {
            // Load modbots if API key exists
            const apiKey = $('#modstack_api_key').val();
            if (apiKey && utils.validateApiKey(apiKey)) {
                this.loadModbots();
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
                        
                        // Auto-load modbots on successful connection
                        setTimeout(() => {
                            SettingsPage.loadModbots();
                        }, 1000);
                    } else {
                        let errorMessage = config.strings.connection_failed || 'Connection failed';
                        
                        if (response.data) {
                            if (typeof response.data === 'string') {
                                errorMessage = response.data;
                            } else if (response.data.message) {
                                errorMessage = response.data.message;
                                if (response.data.debug) {
                                    console.log('ModStack API Debug Info:', response.data.debug);
                                }
                            }
                        }
                        
                        status.removeClass('success').addClass('error').text(errorMessage);
                    }
                },
                error: function(xhr, status, error) {
                    let errorMessage = config.strings.connection_failed || 'Connection failed';
                    let debugInfo = '';
                    
                    if (status === 'timeout') {
                        errorMessage = config.strings.connection_timeout || 'Connection timeout';
                    } else if (xhr.responseJSON && xhr.responseJSON.data) {
                        if (typeof xhr.responseJSON.data === 'string') {
                            errorMessage = xhr.responseJSON.data;
                        } else if (xhr.responseJSON.data.message) {
                            errorMessage = xhr.responseJSON.data.message;
                            if (xhr.responseJSON.data.debug) {
                                debugInfo = ' (Status: ' + xhr.responseJSON.data.debug.status_code + ')';
                                console.log('ModStack API Debug Info:', xhr.responseJSON.data.debug);
                            }
                        }
                    } else if (xhr.responseJSON && xhr.responseJSON.message) {
                        errorMessage = xhr.responseJSON.message;
                    }
                    
                    $('#connection-status').removeClass('success').addClass('error').text(errorMessage + debugInfo);
                },
                complete: function() {
                    utils.hideLoading(button);
                }
            });
        },
        
        refreshModbots: function(e) {
            e.preventDefault();
            SettingsPage.loadModbots();
        },
        
        loadModbots: function() {
            const select = $('#modstack_selected_modbot');
            const button = $('#refresh-modbots');
            const currentValue = select.val();
            
            utils.showLoading(button);
            
            $.ajax({
                url: config.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'modstack_get_modbots',
                    nonce: config.nonce
                },
                success: function(response) {
                    if (response.success && response.data) {
                        select.empty().append(`<option value="">${config.strings.select_modbot || 'Select a modbot'}</option>`);
                        
                        $.each(response.data, function(index, modbot) {
                            const option = $('<option></option>')
                                .attr('value', modbot.id)
                                .text(modbot.name + (modbot.status ? ` (${modbot.status})` : ''));
                            
                            if (modbot.id === currentValue) {
                                option.prop('selected', true);
                            }
                            
                            select.append(option);
                        });
                        
                        utils.showNotice(
                            config.strings.modbots_loaded || `Loaded ${response.data.length} modbots`,
                            'success'
                        );
                    } else {
                        utils.showNotice(
                            response.data || config.strings.failed_load_modbots || 'Failed to load modbots',
                            'error'
                        );
                    }
                },
                error: function() {
                    utils.showNotice(
                        config.strings.failed_load_modbots || 'Failed to load modbots',
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
    
    // Modbots page functionality
    const ModbotsPage = {
        init: function() {
            this.loadModbots();
            this.bindEvents();
        },
        
        bindEvents: function() {
            $(document).on('click', '.refresh-modbots', this.refreshModbots);
            $(document).on('click', '.modbot-preview', this.previewModbot);
            $(document).on('click', '.copy-shortcode', this.copyShortcode);
        },
        
        loadModbots: function() {
            const container = $('#modbots-list');
            
            container.html('<div class="modstack-loading-container"><span class="modstack-loading"></span> Loading modbots...</div>');
            
            $.ajax({
                url: config.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'modstack_get_modbots',
                    nonce: config.nonce
                },
                success: function(response) {
                    if (response.success && response.data) {
                        ModbotsPage.renderModbots(response.data);
                    } else {
                        container.html(`<div class="notice notice-error"><p>${response.data || 'Failed to load modbots'}</p></div>`);
                    }
                },
                error: function() {
                    container.html('<div class="notice notice-error"><p>Failed to load modbots</p></div>');
                }
            });
        },
        
        renderModbots: function(modbots) {
            const container = $('#modbots-list');
            
            if (modbots.length === 0) {
                container.html(`
                    <div class="notice notice-info">
                        <p>No modbots found. <a href="https://app.modstack.ai/modbots" target="_blank">Create one in your ModStack dashboard</a>.</p>
                    </div>
                `);
                return;
            }
            
            let html = '<div class="modstack-modbots-grid">';
            
            modbots.forEach(modbot => {
                html += `
                    <div class="modstack-modbot-card">
                        <div class="modbot-header">
                            <h3>${modbot.name}</h3>
                            <span class="modbot-status status-${modbot.status || 'active'}">${modbot.status || 'Active'}</span>
                        </div>
                        <div class="modbot-content">
                            <p class="modbot-description">${modbot.description || 'No description available'}</p>
                            <div class="modbot-meta">
                                <span class="modbot-id">ID: ${modbot.id}</span>
                                <span class="modbot-created">Created: ${modbot.created_at || 'Unknown'}</span>
                            </div>
                        </div>
                        <div class="modbot-actions">
                            <button class="button button-secondary modbot-preview" data-id="${modbot.id}">
                                Preview
                            </button>
                            <button class="button button-primary copy-shortcode" data-shortcode="[modstack-modbot id=&quot;${modbot.id}&quot;]">
                                Copy Shortcode
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            container.html(html);
        },
        
        refreshModbots: function(e) {
            e.preventDefault();
            ModbotsPage.loadModbots();
        },
        
        previewModbot: function(e) {
            e.preventDefault();
            
            const modbotId = $(this).data('id');
            const previewUrl = `https://app.modstack.ai/preview/modbot/${modbotId}`;
            
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
        
        copyShortcode: ModbotsPage.copyShortcode // Reuse the same function
    };
    
    // Initialize based on current page
    $(document).ready(function() {
        const currentPage = $('body').attr('class');
        
        if (currentPage && currentPage.includes('modstack-settings')) {
            SettingsPage.init();
        } else if (currentPage && currentPage.includes('modstack-modbots')) {
            ModbotsPage.init();
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
        ModbotsPage,
        TicketFormsPage,
        utils
    };
    
})(jQuery);