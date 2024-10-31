<?php
/**
 * Plugin name: Sample Content for ACF
 * Description: Populate any ACF field with dummy content, placeholder images and video in a click of button
 * Version: 1.0.3
 * Author: Phill
 * Plugin URI: https://www.acfsamplecontent.com
 * Author URI: https://profiles.wordpress.org/phillmill/
 * Requires at least: 5.9
 * Requires PHP: 5.6
 * License: GPLv2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 */

 if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly 

define('ACFSC_PLUGIN_NAME', 'Sample Content for ACF');
define('ACFSC_PLUGIN_VERSION', '1.0.2');

add_action('admin_notices', function() {

    $user = wp_get_current_user();

    if ( !class_exists('acf_field_flexible_content') && (!empty($user->roles) && !in_array('subscriber', $user->roles)) ) {
        ?>
        <div class="notice notice-error">
            <p><strong><?php echo esc_html(constant('ACFSC_PLUGIN_NAME')); ?></strong>: Advanced Custom Fields PRO is required to be installed and activated.</p>
        </div>
        <?php
    }
});



require_once('lib/helpers.php');
require_once('lib/validation-rules-filters.php');

if ( file_exists(dirname(__FILE__) . '/pro/acfsc-pro.php') ) {
    require_once(dirname(__FILE__) . '/pro/acfsc-pro.php');
}
else {
    add_action('admin_notices', function() {
        if ( !empty($_GET['page']) && (sanitize_text_field($_GET['page']) == 'acf-sample-content') ): ?>
        <div class="notice notice-warning">
            <p>Upgrade to <a href="https://www.acfsamplecontent.com/" target="_blank"><strong>Sample Content for ACF PRO</strong></a> to unlock Sample Content for Repeaters, Flexible Content, Groups, Galleries and Rich Content.</p>
        </div>
        <?php endif;
    });
}

define('ACFSC_NUMBER_MEDIA_HARD_MAX', 80);

add_action('acf/settings/load_json', function( $paths ) {
    $paths[] = plugin_dir_path( __FILE__ ) . 'acf-json';
    return $paths;
});

add_action('admin_enqueue_scripts', function() {

    // Can't go on without ACF PRO
    if ( !class_exists('acf_field_flexible_content') ) return;

    // Global css
    wp_enqueue_style('acf-devtools', plugin_dir_url( __FILE__ ) . '/css/acfsc.css', ['acf-input', 'acf-pro-input'], constant('ACFSC_PLUGIN_VERSION'));
    
    // Shared configs
    $config = [
        'licenseStatus'     => get_option('acfsc_license_status'),
        'proOnlyFields'     => ['repeater', 'group', 'flexible_content', 'clone', 'gallery'],
        'assetUrl'          => plugin_dir_url( __FILE__ ) . 'img',
        'ajaxUrl'           => admin_url( 'admin-ajax.php' ),
        'settingsUrl'       => admin_url('admin.php?page=acf-sample-content'),
        'nonce'             => wp_create_nonce('acfsc-nonce'),
        'imageInventory'    => get_field('acfsc_image_inventory', 'options'),
        'videoInventory'    => get_field('acfsc_video_inventory', 'options'),
        'fileInventory'     => get_field('acfsc_file_inventory', 'options'),
        'maxUploadSizeMb'   => (((int) wp_max_upload_size()) / 1024)
    ];

    wp_enqueue_script('acfsc-SampleContentGenerator', plugin_dir_url( __FILE__ ) . '/js/classes/SampleContentGenerator.js', ['acf-input', 'jquery'], constant('ACFSC_PLUGIN_VERSION'), false);
    wp_enqueue_script('acfsc-ACFSampleContentPopulator', plugin_dir_url( __FILE__ ) . '/js/classes/ACFSampleContentPopulator.js', ['acf-input', 'jquery'], constant('ACFSC_PLUGIN_VERSION'), false);
    
    // Only enqueue options JS on options page
    if ( !empty($_GET['page']) && sanitize_text_field($_GET['page']) == 'acf-sample-content' ) {
        wp_enqueue_script('acfsc-options', plugin_dir_url( __FILE__ ) . '/js/acfsc-options.js', ['acf-input', 'jquery'], constant('ACFSC_PLUGIN_VERSION'), false);
        wp_localize_script('acfsc-options', 'acfscConfig', $config);
    }
    else {
        wp_enqueue_script('acfsc-ACFSCInterface', plugin_dir_url( __FILE__ ) . '/js/ACFSCInterface.js', ['acf-input', 'jquery'], constant('ACFSC_PLUGIN_VERSION'), false);
        wp_localize_script('acfsc-ACFSCInterface', 'acfscConfig', $config);
    }
    
}, 10);

add_action('acf/init', function () {
    if( function_exists('acf_add_options_sub_page') ) {
        $parent = acf_add_options_page(array(
            'page_title'  => __('Sample Content for ACF', 'sample-content-for-acf'),
            'menu_title'  => __('Sample Content', 'sample-content-for-acf'),
            'menu_slug'   => 'acf-sample-content',
            'redirect'    => false,
        ));
    }
});

add_action('wp_ajax_acfscTestQuery', function () {

    // Can't go on without ACF PRO
    if ( !class_exists('acf_field_flexible_content') ) return;

    if ( !empty($_GET['testQuery']) && !empty($_GET['mediaType']) ) {
        
        $testQuery      = sanitize_text_field($_GET['testQuery']);
        $mediaType      = sanitize_text_field($_GET['mediaType']);
        $testQuery      = urlencode($testQuery);
        $apiNamespace   = $mediaType == 'image' ? 'v1' : 'videos';
        $property       = $mediaType == 'image' ? 'photos' : 'videos';
        $pexelsResponse = acfscFetchFromPexels("https://api.pexels.com/{$apiNamespace}/search?query={$testQuery}&per_page=10&orientation=landscape");
        $pexelsResponse = json_decode($pexelsResponse);

        // Validate
        if ( !empty($pexelsResponse->{$property}) ) {
            $ajaxResponse = (object) [
                'success' => true,
                'numFound' => $pexelsResponse->total_results
            ];     
        }
        else {
            $ajaxResponse = (object) [
                'success' => false
            ];   
        }

    }
    else {
        $ajaxResponse = (object) [
            'success' => false
        ];   
    }


    header('Content-Type: application/json');
    echo wp_json_encode($ajaxResponse);
    exit;
    

});

add_action('wp_ajax_acfscImageImport', 'acfscMediaImport');
add_action('wp_ajax_acfscVideoImport', 'acfscMediaImport');
function acfscMediaImport() {

    // Can't go on without ACF PRO
    if ( !class_exists('acf_field_flexible_content') ) return;

    if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash ( $_POST['nonce'] ) ) , 'acfsc-nonce' ) ) {
        exit;
    }

    $perPage        = ACFSC_NUMBER_MEDIA_HARD_MAX;
    $mediaType      = sanitize_text_field($_POST['action']) == 'acfscImageImport' ? 'image' : 'video';
    $apiNamespace   = $mediaType == 'image' ? 'v1' : 'videos';
    $property       = $mediaType == 'image' ? 'photos' : 'videos';
    $mediaQuery     = sanitize_text_field($_POST['query']);
    $fetchUrl       = "https://api.pexels.com/{$apiNamespace}/search?query={$mediaQuery}&per_page={$perPage}&orientation=landscape";
    $pexelsResponse = acfscFetchFromPexels($fetchUrl);
    $pexelsResponse = json_decode($pexelsResponse);

    // Validate
    if ( empty($pexelsResponse) 
        || ( $mediaType == 'image' && empty($pexelsResponse->{$property}[0]->src->original) )
        || ( $mediaType == 'video' && empty($pexelsResponse->{$property}[0]->url) )
    ) {
        $ajaxResponse = (object) [
            'success' => false,
            'debug' => 'Pexels response empty'
        ];  
    }
    else {

        // Removes any used indexes from the pexels media array so that we don't use the same media twice
        if ( !empty($indexesUsed) && is_array($_POST['indexesUsed']) ) {

            $indexesUsed = array_map(
                function($index) {
                    return sanitize_text_field($index);
                },
                $_POST['indexesUsed']
            );

            $pexelsResponse->{$property} = array_filter($pexelsResponse->{$property}, function($mediaIndex) use($indexesUsed) {
                if ( in_array($mediaIndex, $indexesUsed) ) {
                    return false;
                }
                return true;
            }, ARRAY_FILTER_USE_KEY);
        }

        $mediaCount = count($pexelsResponse->{$property});

        // Make sure the medias array is not empty again, the filtering above could potentially empty the whole thing
        if ( $mediaCount ) {

            $min            = 0;
            $max            = ($mediaCount < ACFSC_NUMBER_MEDIA_HARD_MAX ? $mediaCount : ACFSC_NUMBER_MEDIA_HARD_MAX) - 1;
            $randomIndex    = wp_rand($min, $max);
            $chosenOne      = $pexelsResponse->{$property}[$randomIndex];
            
            if ( $mediaType== 'image' ) {
                // Import 2592 x 1520 dimensions
                $attachmentId = acfscImportImageFromPexels("{$chosenOne->src->original}?auto=compress&cs=tinysrgb&dpr=2&h=2592&w=1520", $chosenOne->alt, $chosenOne->id);
            }
            else {

                // Sort videos from smallest to biggest
                usort($chosenOne->video_files, function($a, $b) {
                    return $a->width > $b->width;
                });

                // Pick out the smallest of the 'hd' videos
                foreach($chosenOne->video_files as $file) {
                    if ( $file->quality == 'hd' ) {
                        $pexelsAssetUrl = $file->link;
                        break;
                    }
                }

                // If still not video file was found, we'll just take the first one in the array
                if ( empty($pexelsAssetUrl) ) {
                    $pexelsAssetUrl = $chosenOne->video_files[0]->link;
                }

                $attachmentId = acfscImportVideoFromPexels($pexelsAssetUrl, $chosenOne->id);

            }

            if ( $attachmentId ) {
                
                if ( $mediaType == 'image' ) {
                    if ( $imagePreviewUrl = wp_get_attachment_image_url($attachmentId, sanitize_text_field($_POST['previewSize'])) ) {
                        $ajaxResponse = (object) [
                            'success' => true,
                            'attachmentId' => $attachmentId,
                            'indexUsed' => $randomIndex,
                            'jsAttachment' => (object) [
                                'id' =>  $attachmentId,
                                'type' => $mediaType,
                                'url' => $imagePreviewUrl,
                                'title' => get_the_title($attachmentId),
                                'alt' => $chosenOne->alt
                            ],
                            'debug' => (object) [
                                'fetchUrl' => $fetchUrl,
                                'pexelsIdUsed' => $chosenOne->id
                            ]
                        ]; 
                    }
                    else {
                        $ajaxResponse = (object) [
                            'success' => false,
                            'debug' => 'Could not get URL of uploaded media for some reason'
                        ]; 
                    }
                }
                else {
                    $file   = get_attached_file($attachmentId);
                    $meta   = wp_get_attachment_metadata($attachmentId);

                    // size_format( $file_size );
                    $ajaxResponse = (object) [
                        'success' => true,
                        'attachmentId' => $attachmentId,
                        'indexUsed' => $randomIndex,
                        'jsAttachment' => (object) [
                            'id' => 'id',
                            'attributes' => (object) [
                                'id' =>  $attachmentId,
                                'type' => $mediaType,
                                'url' => wp_get_attachment_url($attachmentId),
                                'title' => get_the_title($attachmentId),
                                'filename' => esc_html( wp_basename( $file ) ),
                                'filesizeHumanReadable' => size_format( $meta['filesize'] )
                            ]
                        ],
                        'debug' => (object) [
                            'fetchUrl' => $fetchUrl,
                            'pexelsIdUsed' => $chosenOne->id
                        ]
                    ]; 
                }

            }
            else {
                $ajaxResponse = (object) [
                    'success' => false,
                    'debug' => 'Could not upload media to media library'
                ];  
            }
            
        }
        else {
            $ajaxResponse = (object) [
                'success' => false,
                'debug' => 'No medias from pexels found'
            ];  
        }
        

    }

    header('Content-Type: application/json');
    echo wp_json_encode($ajaxResponse);
    exit;

}

add_action( 'admin_notices', function () {

    // Can't go on without ACF PRO
    if ( !class_exists('acf_field_flexible_content') ) return;

    $settingsUrl    = admin_url('admin.php?page=acf-sample-content');
    $imageInventory = get_field('acfsc_image_inventory', 'options');
    $videoInventory = get_field('acfsc_video_inventory', 'options');

    $missingTypes = [];
    if ( empty($imageInventory) ) $missingTypes[] = 'images';
    if ( empty($videoInventory) ) $missingTypes[] = 'videos';

    $user = wp_get_current_user();

    if ( !empty($missingTypes) && (!empty($user->roles) && !in_array('subscriber', $user->roles)) ): ?>
    <div class="notice notice-warning is-dismissible">
        <p><?php echo esc_html(constant('ACFSC_PLUGIN_NAME')); ?> warning: There are no sample <?php echo esc_html(implode(' and ', $missingTypes)); ?> configured in the <a href="<?php echo esc_attr($settingsUrl); ?>">plugin settings</a> so you will not be able to auto-populate any <?php echo esc_html(implode(' or ', $missingTypes)); ?> until you add some there.</p>
    </div>
    <?php endif;
    
});

add_filter('acf/location/rule_values/options_page', function( $choices ) {
	
    if ( !empty($choices['acf-sample-content']) ) {
        unset($choices['acf-sample-content']);
    }

	return $choices;

}, 999, 1 );