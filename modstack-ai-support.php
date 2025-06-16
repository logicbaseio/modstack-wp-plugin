<?php
/**
 * Plugin Name: ModStack AI Support
 * Plugin URI: https://modstack.ai
 * Description: Integrate ModStack's AI-powered customer support system into your WordPress site with chatbots, ticket forms, and automated responses.
 * Version: 1.0.0
 * Author: ModStack
 * Author URI: https://modstack.ai
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: modstack-ai-support
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * Network: false
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('MODSTACK_PLUGIN_VERSION', '1.0.0');
define('MODSTACK_PLUGIN_URL', plugin_dir_url(__FILE__));
define('MODSTACK_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('MODSTACK_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Main ModStack AI Support Plugin Class
 */
class ModStackAISupport {
    
    /**
     * Plugin instance
     */
    private static $instance = null;
    
    /**
     * Get plugin instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        add_action('init', array($this, 'init'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    /**
     * Initialize plugin
     */
    public function init() {
        // Load text domain
        load_plugin_textdomain('modstack-ai-support', false, dirname(MODSTACK_PLUGIN_BASENAME) . '/languages');
        
        // Initialize components
        $this->load_dependencies();
        $this->init_hooks();
    }
    
    /**
     * Load plugin dependencies
     */
    private function load_dependencies() {
        require_once MODSTACK_PLUGIN_PATH . 'includes/class-modstack-admin.php';
        require_once MODSTACK_PLUGIN_PATH . 'includes/class-modstack-api.php';
        require_once MODSTACK_PLUGIN_PATH . 'includes/class-modstack-shortcodes.php';
        require_once MODSTACK_PLUGIN_PATH . 'includes/class-modstack-widgets.php';
        require_once MODSTACK_PLUGIN_PATH . 'includes/class-modstack-frontend.php';
    }
    
    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Admin hooks
        if (is_admin()) {
            new ModStack_Admin();
        }
        
        // Frontend hooks
        new ModStack_Frontend();
        new ModStack_Shortcodes();
        new ModStack_Widgets();
        
        // API hooks
        new ModStack_API();
        
        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
    }
    
    /**
     * Enqueue frontend scripts and styles
     */
    public function enqueue_frontend_scripts() {
        wp_enqueue_script(
            'modstack-frontend',
            MODSTACK_PLUGIN_URL . 'assets/js/frontend.js',
            array('jquery'),
            MODSTACK_PLUGIN_VERSION,
            true
        );
        
        wp_enqueue_style(
            'modstack-frontend',
            MODSTACK_PLUGIN_URL . 'assets/css/frontend.css',
            array(),
            MODSTACK_PLUGIN_VERSION
        );
        
        // Localize script with API settings
        $api_key = get_option('modstack_api_key', '');
        $api_url = get_option('modstack_api_url', 'https://api.modstack.ai');
        
        wp_localize_script('modstack-frontend', 'modstack_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('modstack_nonce'),
            'api_key' => $api_key,
            'api_url' => $api_url
        ));
    }
    
    /**
     * Enqueue admin scripts and styles
     */
    public function enqueue_admin_scripts($hook) {
        // Only load on ModStack admin pages
        if (strpos($hook, 'modstack') === false) {
            return;
        }
        
        wp_enqueue_script(
            'modstack-admin',
            MODSTACK_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery'),
            MODSTACK_PLUGIN_VERSION,
            true
        );
        
        wp_enqueue_style(
            'modstack-admin',
            MODSTACK_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            MODSTACK_PLUGIN_VERSION
        );
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Create database tables if needed
        $this->create_tables();
        
        // Set default options
        add_option('modstack_api_key', '');
        add_option('modstack_api_url', 'https://api.modstack.ai');
        add_option('modstack_widget_enabled', false);
        add_option('modstack_widget_position', 'bottom-right');
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Create database tables
     */
    private function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Table for storing ModStack configurations
        $table_name = $wpdb->prefix . 'modstack_configs';
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            config_key varchar(100) NOT NULL,
            config_value longtext NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY config_key (config_key)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
}

// Initialize the plugin
ModStackAISupport::get_instance();