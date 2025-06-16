<?php
/**
 * Admin Settings Template
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <div class="modstack-admin-container">
        <div class="modstack-admin-main">
            <div class="postbox">
                <div class="postbox-header">
                    <h2 class="hndle"><?php _e('API Configuration', 'modstack-ai-support'); ?></h2>
                </div>
                <div class="inside">
                    <form method="post" action="">
                        <?php wp_nonce_field('modstack_save_settings', 'modstack_nonce'); ?>
                        
                        <table class="form-table">
                            <tr>
                                <th scope="row">
                                    <label for="modstack_api_key"><?php _e('API Key', 'modstack-ai-support'); ?></label>
                                </th>
                                <td>
                                    <input type="password" id="modstack_api_key" name="modstack_api_key" 
                                           value="<?php echo esc_attr($api_key); ?>" class="regular-text" />
                                    <button type="button" id="toggle-api-key" class="button button-secondary">
                                        <?php _e('Show', 'modstack-ai-support'); ?>
                                    </button>
                                    <p class="description">
                                        <?php _e('Enter your ModStack API key. You can generate one in your ModStack dashboard.', 'modstack-ai-support'); ?>
                                        <a href="https://app.modstack.ai/settings/api" target="_blank"><?php _e('Get API Key', 'modstack-ai-support'); ?></a>
                                    </p>
                                </td>
                            </tr>
                            
                            <tr>
                                <th scope="row">
                                    <label for="modstack_api_url"><?php _e('API URL', 'modstack-ai-support'); ?></label>
                                </th>
                                <td>
                                    <input type="url" id="modstack_api_url" name="modstack_api_url" 
                                           value="<?php echo esc_attr($api_url); ?>" class="regular-text" />
                                    <p class="description">
                                        <?php _e('ModStack API base URL. Leave default unless instructed otherwise.', 'modstack-ai-support'); ?>
                                    </p>
                                </td>
                            </tr>
                            
                            <tr>
                                <th scope="row"></th>
                                <td>
                                    <button type="button" id="test-connection" class="button button-secondary">
                                        <?php _e('Test Connection', 'modstack-ai-support'); ?>
                                    </button>
                                    <span id="connection-status"></span>
                                </td>
                            </tr>
                        </table>
                        
                        <hr>
                        
                        <h3><?php _e('Widget Settings', 'modstack-ai-support'); ?></h3>
                        
                        <table class="form-table">
                            <tr>
                                <th scope="row">
                                    <?php _e('Enable Global Widget', 'modstack-ai-support'); ?>
                                </th>
                                <td>
                                    <label>
                                        <input type="checkbox" id="modstack_widget_enabled" name="modstack_widget_enabled" 
                                               value="1" <?php checked($widget_enabled); ?> />
                                        <?php _e('Show floating chat widget on all pages', 'modstack-ai-support'); ?>
                                    </label>
                                </td>
                            </tr>
                            
                            <tr>
                                <th scope="row">
                                    <label for="modstack_selected_chatbot"><?php _e('Default Modbot', 'modstack-ai-support'); ?></label>
                                </th>
                                <td>
                                    <select id="modstack_selected_chatbot" name="modstack_selected_chatbot" class="regular-text">
                                        <option value=""><?php _e('Select a modbot', 'modstack-ai-support'); ?></option>
                                    </select>
                                    <button type="button" id="refresh-chatbots" class="button button-secondary">
                                        <?php _e('Refresh', 'modstack-ai-support'); ?>
                                    </button>
                                    <p class="description">
                                        <?php _e('Choose which modbot to use for the global widget and default shortcodes.', 'modstack-ai-support'); ?>
                                    </p>
                                </td>
                            </tr>
                            
                            <tr>
                                <th scope="row">
                                    <label for="modstack_widget_position"><?php _e('Widget Position', 'modstack-ai-support'); ?></label>
                                </th>
                                <td>
                                    <select id="modstack_widget_position" name="modstack_widget_position">
                                        <option value="bottom-right" <?php selected($widget_position, 'bottom-right'); ?>>
                                            <?php _e('Bottom Right', 'modstack-ai-support'); ?>
                                        </option>
                                        <option value="bottom-left" <?php selected($widget_position, 'bottom-left'); ?>>
                                            <?php _e('Bottom Left', 'modstack-ai-support'); ?>
                                        </option>
                                        <option value="top-right" <?php selected($widget_position, 'top-right'); ?>>
                                            <?php _e('Top Right', 'modstack-ai-support'); ?>
                                        </option>
                                        <option value="top-left" <?php selected($widget_position, 'top-left'); ?>>
                                            <?php _e('Top Left', 'modstack-ai-support'); ?>
                                        </option>
                                    </select>
                                </td>
                            </tr>
                            
                            <tr>
                                <th scope="row">
                                    <label for="modstack_widget_theme"><?php _e('Widget Theme', 'modstack-ai-support'); ?></label>
                                </th>
                                <td>
                                    <select id="modstack_widget_theme" name="modstack_widget_theme">
                                        <option value="light" <?php selected($widget_theme, 'light'); ?>>
                                            <?php _e('Light', 'modstack-ai-support'); ?>
                                        </option>
                                        <option value="dark" <?php selected($widget_theme, 'dark'); ?>>
                                            <?php _e('Dark', 'modstack-ai-support'); ?>
                                        </option>
                                    </select>
                                </td>
                            </tr>
                        </table>
                        
                        <?php submit_button(); ?>
                    </form>
                </div>
            </div>
        </div>
        
        <div class="modstack-admin-sidebar">
            <div class="postbox">
                <div class="postbox-header">
                    <h2 class="hndle"><?php _e('Quick Start', 'modstack-ai-support'); ?></h2>
                </div>
                <div class="inside">
                    <ol>
                        <li><?php _e('Get your API key from', 'modstack-ai-support'); ?> <a href="https://app.modstack.ai/settings/api" target="_blank">ModStack Dashboard</a></li>
                        <li><?php _e('Enter the API key above and test the connection', 'modstack-ai-support'); ?></li>
                        <li><?php _e('Select a default modbot for the global widget', 'modstack-ai-support'); ?></li>
                        <li><?php _e('Enable the global widget or use shortcodes in your content', 'modstack-ai-support'); ?></li>
                    </ol>
                </div>
            </div>
            
            <div class="postbox">
                <div class="postbox-header">
                    <h2 class="hndle"><?php _e('Shortcodes', 'modstack-ai-support'); ?></h2>
                </div>
                <div class="inside">
                    <h4><?php _e('Modbot', 'modstack-ai-support'); ?></h4>
                    <code>[modstack-chatbot id="123"]</code>
                    <p class="description"><?php _e('Embed a specific modbot', 'modstack-ai-support'); ?></p>
                    
                    <h4><?php _e('Ticket Form', 'modstack-ai-support'); ?></h4>
                    <code>[modstack-ticket-form id="456"]</code>
                    <p class="description"><?php _e('Embed a ticket submission form', 'modstack-ai-support'); ?></p>
                    
                    <h4><?php _e('Floating Widget', 'modstack-ai-support'); ?></h4>
                    <code>[modstack-widget]</code>
                    <p class="description"><?php _e('Add a floating chat widget to specific pages', 'modstack-ai-support'); ?></p>
                </div>
            </div>
            
            <div class="postbox">
                <div class="postbox-header">
                    <h2 class="hndle"><?php _e('Support', 'modstack-ai-support'); ?></h2>
                </div>
                <div class="inside">
                    <p><?php _e('Need help? Contact our support team:', 'modstack-ai-support'); ?></p>
                    <ul>
                        <li><a href="https://docs.modstack.ai" target="_blank"><?php _e('Documentation', 'modstack-ai-support'); ?></a></li>
                        <li><a href="https://support.modstack.ai" target="_blank"><?php _e('Support Center', 'modstack-ai-support'); ?></a></li>
                        <li><a href="mailto:support@modstack.ai"><?php _e('Email Support', 'modstack-ai-support'); ?></a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.modstack-admin-container {
    display: flex;
    gap: 20px;
    margin-top: 20px;
}

.modstack-admin-main {
    flex: 2;
}

.modstack-admin-sidebar {
    flex: 1;
}

.modstack-admin-sidebar .postbox {
    margin-bottom: 20px;
}

#connection-status {
    margin-left: 10px;
    font-weight: bold;
}

#connection-status.success {
    color: #46b450;
}

#connection-status.error {
    color: #dc3232;
}

.modstack-loading {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #007cba;
    border-radius: 50%;
    animation: modstack-spin 1s linear infinite;
    margin-left: 10px;
}

@keyframes modstack-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>

<script>
jQuery(document).ready(function($) {
    // Toggle API key visibility
    $('#toggle-api-key').click(function() {
        const input = $('#modstack_api_key');
        const button = $(this);
        
        if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            button.text('<?php echo esc_js(__('Hide', 'modstack-ai-support')); ?>');
        } else {
            input.attr('type', 'password');
            button.text('<?php echo esc_js(__('Show', 'modstack-ai-support')); ?>');
        }
    });
    
    // Test API connection
    $('#test-connection').click(function() {
        const button = $(this);
        const status = $('#connection-status');
        const apiKey = $('#modstack_api_key').val();
        const apiUrl = $('#modstack_api_url').val();
        
        if (!apiKey || !apiUrl) {
            status.removeClass('success').addClass('error')
                  .text('<?php echo esc_js(__('Please enter API key and URL', 'modstack-ai-support')); ?>');
            return;
        }
        
        button.prop('disabled', true);
        status.removeClass('success error').html('<span class="modstack-loading"></span>');
        
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'modstack_test_connection',
                api_key: apiKey,
                api_url: apiUrl,
                nonce: '<?php echo wp_create_nonce('modstack_nonce'); ?>'
            },
            success: function(response) {
                if (response.success) {
                    status.removeClass('error').addClass('success')
                          .text('<?php echo esc_js(__('Connection successful!', 'modstack-ai-support')); ?>');
                    loadChatbots();
                } else {
                    status.removeClass('success').addClass('error')
                          .text(response.data || '<?php echo esc_js(__('Connection failed', 'modstack-ai-support')); ?>');
                }
            },
            error: function() {
                status.removeClass('success').addClass('error')
                      .text('<?php echo esc_js(__('Connection failed', 'modstack-ai-support')); ?>');
            },
            complete: function() {
                button.prop('disabled', false);
            }
        });
    });
    
    // Load chatbots
    function loadChatbots() {
        const select = $('#modstack_selected_chatbot');
        const currentValue = '<?php echo esc_js($selected_chatbot); ?>';
        
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'modstack_get_chatbots',
                nonce: '<?php echo wp_create_nonce('modstack_nonce'); ?>'
            },
            success: function(response) {
                if (response.success && response.data) {
                    select.empty().append('<option value=""><?php echo esc_js(__('Select a chatbot', 'modstack-ai-support')); ?></option>');
                    
                    $.each(response.data, function(index, chatbot) {
                        const option = $('<option></option>')
                            .attr('value', chatbot.id)
                            .text(chatbot.name);
                        
                        if (chatbot.id === currentValue) {
                            option.prop('selected', true);
                        }
                        
                        select.append(option);
                    });
                }
            }
        });
    }
    
    // Refresh chatbots
    $('#refresh-chatbots').click(function() {
        loadChatbots();
    });
    
    // Load chatbots on page load if API key exists
    if ($('#modstack_api_key').val()) {
        loadChatbots();
    }
});
</script>