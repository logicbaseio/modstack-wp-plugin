# ModStack AI Support - WordPress Plugin

A powerful WordPress plugin that integrates ModStack's AI-powered customer support platform directly into your WordPress website.

## Features

- **AI Chat Widget**: Floating chat widget that can be displayed on any page
- **Modbot Shortcodes**: Embed specific modbots using `[modstack-chatbot id="123"]`
- **Ticket Form Shortcodes**: Embed ticket submission forms using `[modstack-ticket-form id="456"]`
- **Admin Dashboard**: Easy-to-use interface for managing API keys and configurations
- **Multiple Themes**: Light and dark theme support
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **WordPress Widgets**: Sidebar widgets for modbots and ticket forms
- **REST API Integration**: Secure communication with ModStack backend
- **Webhook Support**: Real-time updates and notifications

## Installation

### Method 1: Upload Plugin Files

1. Download the plugin files
2. Upload the `modstack-ai-support` folder to your `/wp-content/plugins/` directory
3. Activate the plugin through the 'Plugins' menu in WordPress
4. Go to **ModStack Settings** in your WordPress admin to configure the plugin

### Method 2: WordPress Admin Upload

1. Go to **Plugins > Add New** in your WordPress admin
2. Click **Upload Plugin**
3. Choose the plugin ZIP file and click **Install Now**
4. Activate the plugin
5. Go to **ModStack Settings** to configure

## Configuration

### 1. Get Your API Key

1. Log in to your [ModStack Dashboard](https://app.modstack.ai)
2. Navigate to **Settings > API Keys**
3. Generate a new API key for WordPress integration
4. Copy the API key

### 2. Configure the Plugin

1. In WordPress admin, go to **ModStack Settings**
2. Enter your API key in the **API Key** field
3. Verify the **API URL** (default: `https://api.modstack.ai`)
4. Click **Test Connection** to verify the setup
5. Configure widget settings as needed
6. Save your settings

### 3. Enable Global Widget (Optional)

1. Check **Enable Global Widget** to show a floating chat widget on all pages
2. Select your default modbot from the dropdown
3. Choose widget position (bottom-right, bottom-left, etc.)
4. Select theme (light or dark)
5. Save settings

## Usage

### Shortcodes

#### Modbot Shortcode
```
[modstack-chatbot id="your-chatbot-id"]
```

**Attributes:**
- `id` (required): Your modbot ID from ModStack
- `theme`: `light` or `dark` (default: `light`)
- `height`: Height in pixels (default: `500px`)

**Example:**
```
[modstack-chatbot id="abc123" theme="dark" height="600px"]
```

#### Ticket Form Shortcode
```
[modstack-ticket-form id="your-form-id"]
```

**Attributes:**
- `id` (required): Your ticket form ID from ModStack
- `theme`: `light` or `dark` (default: `light`)

**Example:**
```
[modstack-ticket-form id="def456" theme="light"]
```

#### Floating Widget Shortcode
```
[modstack-widget]
```

**Attributes:**
- `modbot-id`: Specific modbot ID (uses default if not specified)
- `theme`: `light` or `dark`
- `position`: `bottom-right`, `bottom-left`, `top-right`, `top-left`
- `title`: Widget title text

**Example:**
```
[modstack-widget chatbot-id="abc123" theme="dark" position="bottom-left" title="Need Help?"]
```

### WordPress Widgets

The plugin provides two WordPress widgets:

1. **ModStack Modbot Widget**: Add to sidebars to display a modbot
2. **ModStack Ticket Form Widget**: Add to sidebars to display a ticket form

To use widgets:
1. Go to **Appearance > Widgets**
2. Find "ModStack Modbot" or "ModStack Ticket Form"
3. Drag to your desired widget area
4. Configure the widget settings
5. Save

### Managing Chatbots and Forms

#### View Available Modbots
1. Go to **ModStack > Modbots** in WordPress admin
2. View all your available modbots
3. Copy shortcodes directly from the interface
4. Preview modbots in a new window

#### View Available Ticket Forms
1. Go to **ModStack > Ticket Forms** in WordPress admin
2. View all your available forms
3. Copy shortcodes directly from the interface
4. Preview forms in a new window

## API Integration

The plugin creates REST API endpoints for communication with ModStack:

- `POST /wp-json/modstack/v1/chat` - Handle chat messages
- `POST /wp-json/modstack/v1/tickets` - Handle ticket submissions
- `GET /wp-json/modstack/v1/config` - Get widget configuration
- `POST /wp-json/modstack/v1/webhook` - Handle ModStack webhooks

## Customization

### Custom CSS

You can customize the appearance by adding CSS to your theme:

```css
/* Customize widget button */
.modstack-widget-button {
    background-color: #your-color !important;
}

/* Customize widget container */
.modstack-widget-container {
    border-radius: 15px !important;
}

/* Customize shortcode containers */
.modstack-modbot-shortcode {
    border: 2px solid #your-color;
}
```

### Hooks and Filters

The plugin provides several WordPress hooks for customization:

#### Actions
- `modstack_before_widget_render` - Before widget renders
- `modstack_after_widget_render` - After widget renders
- `modstack_before_shortcode_render` - Before shortcode renders
- `modstack_after_shortcode_render` - After shortcode renders

#### Filters
- `modstack_widget_config` - Modify widget configuration
- `modstack_api_request_args` - Modify API request arguments
- `modstack_shortcode_attributes` - Modify shortcode attributes

**Example:**
```php
// Customize widget configuration
add_filter('modstack_widget_config', function($config) {
    $config['theme'] = 'dark';
    return $config;
});
```

## Troubleshooting

### Common Issues

#### Connection Failed
- Verify your API key is correct
- Check that your website can make outbound HTTPS requests
- Ensure the API URL is correct
- Check for firewall or security plugin interference

#### Widget Not Appearing
- Verify the global widget is enabled in settings
- Check that a default modbot is selected
- Ensure there are no JavaScript errors in browser console
- Check for theme conflicts

#### Shortcodes Not Working
- Verify the modbot/form ID is correct
- Check that the API connection is working
- Ensure shortcodes are properly formatted
- Check for plugin conflicts

### Debug Mode

To enable debug mode, add this to your `wp-config.php`:

```php
define('MODSTACK_DEBUG', true);
```

This will:
- Enable detailed logging
- Show additional error messages
- Add debug information to browser console

### Getting Help

If you need assistance:

1. Check the [ModStack Documentation](https://docs.modstack.ai)
2. Contact [ModStack Support](https://support.modstack.ai)
3. Email us at [support@modstack.ai](mailto:support@modstack.ai)

## Requirements

- WordPress 5.0 or higher
- PHP 7.4 or higher
- cURL extension enabled
- HTTPS enabled (recommended)
- ModStack account and API key

## Changelog

### Version 1.0.0
- Initial release
- Chat widget functionality
- Shortcode support
- Admin dashboard
- WordPress widgets
- REST API integration
- Webhook support

## Security

- All API communications use HTTPS
- API keys are stored securely in WordPress database
- Webhook signatures are verified
- Input sanitization and validation
- Nonce verification for admin actions
- Capability checks for admin access

## Privacy

This plugin:
- Connects to ModStack servers to provide chat functionality
- May store user chat data according to your ModStack settings
- Does not collect additional user data beyond what's necessary for functionality
- Respects WordPress privacy settings

Refer to [ModStack Privacy Policy](https://modstack.ai/privacy) for details on data handling.

## License

This plugin is licensed under the GPL v2 or later.

## Support

For support, please contact:
- Email: support@modstack.ai
- Documentation: https://docs.modstack.ai
- Support Center: https://support.modstack.ai
