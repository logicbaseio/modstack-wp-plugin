<?php
/**
 * ModStack API Class
 * 
 * Handles API communication with ModStack backend
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class ModStack_API {
    
    /**
     * API base URL
     */
    private $api_url;
    
    /**
     * API key
     */
    private $api_key;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->api_url = get_option('modstack_api_url', 'https://api.modstack.ai');
        $this->api_key = get_option('modstack_api_key', '');
        
        // Add REST API endpoints
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        
        // Add webhook handlers
        add_action('wp_ajax_nopriv_modstack_webhook', array($this, 'handle_webhook'));
        add_action('wp_ajax_modstack_webhook', array($this, 'handle_webhook'));
    }
    
    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        register_rest_route('modstack/v1', '/chat', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_chat_message'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('modstack/v1', '/ticket', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_ticket_submission'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route('modstack/v1', '/widget-config', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_widget_config'),
            'permission_callback' => '__return_true'
        ));
    }
    
    /**
     * Handle chat message
     */
    public function handle_chat_message($request) {
        $params = $request->get_json_params();
        
        if (empty($params['message']) || empty($params['chatbot_id'])) {
            return new WP_Error('missing_params', 'Message and chatbot_id are required', array('status' => 400));
        }
        
        $response = $this->make_api_request('POST', '/api/v1/chat', array(
            'message' => sanitize_text_field($params['message']),
            'chatbot_id' => sanitize_text_field($params['chatbot_id']),
            'session_id' => sanitize_text_field($params['session_id'] ?? ''),
            'user_id' => sanitize_text_field($params['user_id'] ?? ''),
            'metadata' => array(
                'source' => 'wordpress',
                'site_url' => get_site_url(),
                'page_url' => sanitize_url($params['page_url'] ?? '')
            )
        ));
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        return rest_ensure_response($response);
    }
    
    /**
     * Handle ticket submission
     */
    public function handle_ticket_submission($request) {
        $params = $request->get_json_params();
        
        if (empty($params['form_id'])) {
            return new WP_Error('missing_form_id', 'Form ID is required', array('status' => 400));
        }
        
        // Sanitize form data
        $form_data = array();
        if (isset($params['form_data']) && is_array($params['form_data'])) {
            foreach ($params['form_data'] as $key => $value) {
                $form_data[sanitize_key($key)] = sanitize_text_field($value);
            }
        }
        
        $response = $this->make_api_request('POST', '/api/v1/tickets', array(
            'form_id' => sanitize_text_field($params['form_id']),
            'form_data' => $form_data,
            'metadata' => array(
                'source' => 'wordpress',
                'site_url' => get_site_url(),
                'page_url' => sanitize_url($params['page_url'] ?? '')
            )
        ));
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        return rest_ensure_response($response);
    }
    
    /**
     * Get widget configuration
     */
    public function get_widget_config($request) {
        $chatbot_id = get_option('modstack_selected_chatbot', '');
        
        if (empty($chatbot_id)) {
            return new WP_Error('no_chatbot', 'No chatbot configured', array('status' => 404));
        }
        
        $config = array(
            'chatbot_id' => $chatbot_id,
            'api_url' => $this->api_url,
            'widget_enabled' => get_option('modstack_widget_enabled', false),
            'widget_position' => get_option('modstack_widget_position', 'bottom-right'),
            'widget_theme' => get_option('modstack_widget_theme', 'light'),
            'site_url' => get_site_url()
        );
        
        return rest_ensure_response($config);
    }
    
    /**
     * Handle webhook from ModStack
     */
    public function handle_webhook() {
        // Verify webhook signature
        $signature = $_SERVER['HTTP_X_MODSTACK_SIGNATURE'] ?? '';
        $payload = file_get_contents('php://input');
        
        if (!$this->verify_webhook_signature($payload, $signature)) {
            wp_die('Invalid signature', 'Unauthorized', array('response' => 401));
        }
        
        $data = json_decode($payload, true);
        
        if (!$data) {
            wp_die('Invalid JSON', 'Bad Request', array('response' => 400));
        }
        
        // Process webhook based on event type
        switch ($data['event'] ?? '') {
            case 'ticket.created':
                $this->handle_ticket_created($data['data']);
                break;
            case 'ticket.updated':
                $this->handle_ticket_updated($data['data']);
                break;
            case 'chat.message':
                $this->handle_chat_webhook($data['data']);
                break;
            default:
                error_log('Unknown ModStack webhook event: ' . ($data['event'] ?? 'none'));
        }
        
        wp_die('OK', 'OK', array('response' => 200));
    }
    
    /**
     * Verify webhook signature
     */
    private function verify_webhook_signature($payload, $signature) {
        if (empty($this->api_key) || empty($signature)) {
            return false;
        }
        
        $expected_signature = 'sha256=' . hash_hmac('sha256', $payload, $this->api_key);
        return hash_equals($expected_signature, $signature);
    }
    
    /**
     * Handle ticket created webhook
     */
    private function handle_ticket_created($ticket_data) {
        // You can add custom logic here, such as:
        // - Sending email notifications
        // - Creating WordPress posts/comments
        // - Triggering other integrations
        
        do_action('modstack_ticket_created', $ticket_data);
    }
    
    /**
     * Handle ticket updated webhook
     */
    private function handle_ticket_updated($ticket_data) {
        do_action('modstack_ticket_updated', $ticket_data);
    }
    
    /**
     * Handle chat webhook
     */
    private function handle_chat_webhook($chat_data) {
        do_action('modstack_chat_message', $chat_data);
    }
    
    /**
     * Make API request to ModStack
     */
    private function make_api_request($method, $endpoint, $data = null) {
        if (empty($this->api_key)) {
            return new WP_Error('no_api_key', 'API key not configured', array('status' => 401));
        }
        
        $url = rtrim($this->api_url, '/') . $endpoint;
        
        $args = array(
            'method' => $method,
            'headers' => array(
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json',
                'User-Agent' => 'ModStack-WordPress-Plugin/' . MODSTACK_PLUGIN_VERSION
            ),
            'timeout' => 30
        );
        
        if ($data && in_array($method, array('POST', 'PUT', 'PATCH'))) {
            $args['body'] = json_encode($data);
        }
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        
        if ($status_code >= 400) {
            $error_data = json_decode($body, true);
            $error_message = $error_data['message'] ?? 'API request failed';
            return new WP_Error('api_error', $error_message, array('status' => $status_code));
        }
        
        return json_decode($body, true);
    }
    
    /**
     * Get chatbots from API
     */
    public function get_chatbots() {
        return $this->make_api_request('GET', '/api/v1/chatbots');
    }
    
    /**
     * Get ticket forms from API
     */
    public function get_ticket_forms() {
        return $this->make_api_request('GET', '/api/v1/ticket-forms');
    }
    
    /**
     * Get specific chatbot
     */
    public function get_chatbot($chatbot_id) {
        return $this->make_api_request('GET', '/api/v1/chatbots/' . $chatbot_id);
    }
    
    /**
     * Get specific ticket form
     */
    public function get_ticket_form($form_id) {
        return $this->make_api_request('GET', '/api/v1/ticket-forms/' . $form_id);
    }
}