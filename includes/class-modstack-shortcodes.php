<?php
/**
 * ModStack Shortcodes Class
 * 
 * Handles shortcode functionality for embedding ModStack elements
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class ModStack_Shortcodes {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_shortcode('modstack-chatbot', array($this, 'chatbot_shortcode'));
        add_shortcode('modstack-ticket-form', array($this, 'ticket_form_shortcode'));
        add_shortcode('modstack-widget', array($this, 'widget_shortcode'));
    }
    
    /**
     * Chatbot shortcode
     * Usage: [modstack-chatbot id="123" theme="light" height="500px"]
     */
    public function chatbot_shortcode($atts) {
        $atts = shortcode_atts(array(
            'id' => '',
            'theme' => 'light',
            'height' => '500px',
            'width' => '100%',
            'title' => 'ModStack Chatbot'
        ), $atts, 'modstack-chatbot');
        
        // Validate required attributes
        if (empty($atts['id'])) {
            return '<div class="modstack-error">' . __('Chatbot ID is required', 'modstack-ai-support') . '</div>';
        }
        
        // Check if API is configured
        $api_key = get_option('modstack_api_key', '');
        if (empty($api_key)) {
            return '<div class="modstack-error">' . __('ModStack API key not configured', 'modstack-ai-support') . '</div>';
        }
        
        // Generate unique container ID
        $container_id = 'modstack-chatbot-' . uniqid();
        
        // Sanitize attributes
        $chatbot_id = sanitize_text_field($atts['id']);
        $theme = sanitize_text_field($atts['theme']);
        $height = sanitize_text_field($atts['height']);
        $width = sanitize_text_field($atts['width']);
        $title = sanitize_text_field($atts['title']);
        
        // Build the HTML
        ob_start();
        ?>
        <div id="<?php echo esc_attr($container_id); ?>" class="modstack-chatbot-container" 
             style="width: <?php echo esc_attr($width); ?>; height: <?php echo esc_attr($height); ?>; border: 1px solid #e1e5e9; border-radius: 8px; overflow: hidden;">
            <div class="modstack-loading" style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa;">
                <div style="text-align: center;">
                    <div class="modstack-spinner" style="border: 3px solid #f3f3f3; border-top: 3px solid #007cba; border-radius: 50%; width: 30px; height: 30px; animation: modstack-spin 1s linear infinite; margin: 0 auto 10px;"></div>
                    <p style="margin: 0; color: #666;"><?php _e('Loading chatbot...', 'modstack-ai-support'); ?></p>
                </div>
            </div>
        </div>
        
        <style>
        @keyframes modstack-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .modstack-error {
            padding: 15px;
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            margin: 10px 0;
        }
        </style>
        
        <script>
        (function() {
            const container = document.getElementById('<?php echo esc_js($container_id); ?>');
            const apiUrl = '<?php echo esc_js(get_option('modstack_api_url', 'https://api.modstack.ai')); ?>';
            const chatbotId = '<?php echo esc_js($chatbot_id); ?>';
            const theme = '<?php echo esc_js($theme); ?>';
            
            // Initialize chatbot
            if (typeof ModStackChatbot !== 'undefined') {
                ModStackChatbot.init({
                    container: container,
                    chatbotId: chatbotId,
                    apiUrl: apiUrl,
                    theme: theme,
                    title: '<?php echo esc_js($title); ?>'
                });
            } else {
                // Fallback: Load chatbot via iframe
                const iframe = document.createElement('iframe');
                iframe.src = apiUrl + '/embed/chatbot/' + chatbotId + '?theme=' + theme;
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                iframe.title = '<?php echo esc_js($title); ?>';
                
                container.innerHTML = '';
                container.appendChild(iframe);
            }
        })();
        </script>
        <?php
        
        return ob_get_clean();
    }
    
    /**
     * Ticket form shortcode
     * Usage: [modstack-ticket-form id="123" theme="light"]
     */
    public function ticket_form_shortcode($atts) {
        $atts = shortcode_atts(array(
            'id' => '',
            'theme' => 'light',
            'title' => 'Submit a Ticket',
            'success_message' => 'Thank you! Your ticket has been submitted.',
            'redirect_url' => ''
        ), $atts, 'modstack-ticket-form');
        
        // Validate required attributes
        if (empty($atts['id'])) {
            return '<div class="modstack-error">' . __('Ticket form ID is required', 'modstack-ai-support') . '</div>';
        }
        
        // Check if API is configured
        $api_key = get_option('modstack_api_key', '');
        if (empty($api_key)) {
            return '<div class="modstack-error">' . __('ModStack API key not configured', 'modstack-ai-support') . '</div>';
        }
        
        // Generate unique container ID
        $container_id = 'modstack-ticket-form-' . uniqid();
        
        // Sanitize attributes
        $form_id = sanitize_text_field($atts['id']);
        $theme = sanitize_text_field($atts['theme']);
        $title = sanitize_text_field($atts['title']);
        $success_message = sanitize_text_field($atts['success_message']);
        $redirect_url = esc_url($atts['redirect_url']);
        
        // Build the HTML
        ob_start();
        ?>
        <div id="<?php echo esc_attr($container_id); ?>" class="modstack-ticket-form-container" data-theme="<?php echo esc_attr($theme); ?>">
            <div class="modstack-loading" style="display: flex; align-items: center; justify-content: center; padding: 40px; background: #f8f9fa;">
                <div style="text-align: center;">
                    <div class="modstack-spinner" style="border: 3px solid #f3f3f3; border-top: 3px solid #007cba; border-radius: 50%; width: 30px; height: 30px; animation: modstack-spin 1s linear infinite; margin: 0 auto 10px;"></div>
                    <p style="margin: 0; color: #666;"><?php _e('Loading form...', 'modstack-ai-support'); ?></p>
                </div>
            </div>
        </div>
        
        <script>
        (function() {
            const container = document.getElementById('<?php echo esc_js($container_id); ?>');
            const apiUrl = '<?php echo esc_js(get_option('modstack_api_url', 'https://api.modstack.ai')); ?>';
            const formId = '<?php echo esc_js($form_id); ?>';
            const theme = '<?php echo esc_js($theme); ?>';
            
            // Initialize ticket form
            if (typeof ModStackTicketForm !== 'undefined') {
                ModStackTicketForm.init({
                    container: container,
                    formId: formId,
                    apiUrl: apiUrl,
                    theme: theme,
                    title: '<?php echo esc_js($title); ?>',
                    successMessage: '<?php echo esc_js($success_message); ?>',
                    redirectUrl: '<?php echo esc_js($redirect_url); ?>'
                });
            } else {
                // Fallback: Load form via iframe
                const iframe = document.createElement('iframe');
                iframe.src = apiUrl + '/embed/ticket-form/' + formId + '?theme=' + theme;
                iframe.style.width = '100%';
                iframe.style.height = '600px';
                iframe.style.border = 'none';
                iframe.title = '<?php echo esc_js($title); ?>';
                
                container.innerHTML = '';
                container.appendChild(iframe);
            }
        })();
        </script>
        <?php
        
        return ob_get_clean();
    }
    
    /**
     * Widget shortcode (floating chat widget)
     * Usage: [modstack-widget position="bottom-right" theme="light"]
     */
    public function widget_shortcode($atts) {
        $atts = shortcode_atts(array(
            'position' => 'bottom-right',
            'theme' => 'light',
            'chatbot_id' => ''
        ), $atts, 'modstack-widget');
        
        // Check if API is configured
        $api_key = get_option('modstack_api_key', '');
        if (empty($api_key)) {
            return '<div class="modstack-error">' . __('ModStack API key not configured', 'modstack-ai-support') . '</div>';
        }
        
        // Use provided chatbot_id or fall back to global setting
        $chatbot_id = !empty($atts['chatbot_id']) ? sanitize_text_field($atts['chatbot_id']) : get_option('modstack_selected_chatbot', '');
        
        if (empty($chatbot_id)) {
            return '<div class="modstack-error">' . __('No chatbot configured for widget', 'modstack-ai-support') . '</div>';
        }
        
        // Generate unique widget ID
        $widget_id = 'modstack-widget-' . uniqid();
        
        // Sanitize attributes
        $position = sanitize_text_field($atts['position']);
        $theme = sanitize_text_field($atts['theme']);
        
        // Build the HTML
        ob_start();
        ?>
        <div id="<?php echo esc_attr($widget_id); ?>" class="modstack-widget" data-position="<?php echo esc_attr($position); ?>" data-theme="<?php echo esc_attr($theme); ?>"></div>
        
        <script>
        (function() {
            const widget = document.getElementById('<?php echo esc_js($widget_id); ?>');
            const apiUrl = '<?php echo esc_js(get_option('modstack_api_url', 'https://api.modstack.ai')); ?>';
            const chatbotId = '<?php echo esc_js($chatbot_id); ?>';
            const position = '<?php echo esc_js($position); ?>';
            const theme = '<?php echo esc_js($theme); ?>';
            
            // Initialize widget
            if (typeof ModStackWidget !== 'undefined') {
                ModStackWidget.init({
                    container: widget,
                    chatbotId: chatbotId,
                    apiUrl: apiUrl,
                    position: position,
                    theme: theme
                });
            } else {
                console.warn('ModStack Widget library not loaded');
            }
        })();
        </script>
        <?php
        
        return ob_get_clean();
    }
}