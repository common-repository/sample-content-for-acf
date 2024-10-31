<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly 

function acfscFetchFromPexels($url) {

    $cacheKey = "acfsc_pexels_" . md5($url);

    if ( ($data = get_transient($cacheKey)) ) {
        return $data;
    }
    
    $apiKey = apply_filters('acfsc_pexels_api_key', '1ZNe2L0j1y94ZBYyBM2iESgil4F5bmTL5i1tlHSBPhHCQ0Kfj77xwhB8');

    $contextArgs = [
        'method' => 'GET',
        'headers' => 'Authorization: ' . $apiKey,
        'timeout' => 10
    ];
    
    $data = wp_remote_get($url, $contextArgs);

    if ( $cacheKey ) {
        set_transient($cacheKey, $data['body'], 60 * 60);
    }

    return $data['body'];

}

function acfscImportImageFromPexels($imageUrl, $alt, $pexelsId) {
 
    $pexelsAttachments = get_posts([
        'meta_key'       => 'pexels_id',
        'meta_value'     => $pexelsId,
        'post_type'      => 'attachment',
        'post_status'    => 'any',
        'posts_per_page' => 1,
    ]);

    // If existing pexels attachment exists, return that ID instead
    if ( !empty($pexelsAttachments[0]->ID) ) {
        return $pexelsAttachments[0]->ID;
    }

    $attachmentId = media_sideload_image($imageUrl, false, '', 'id');

    if ( is_wp_error($attachmentId) ) {
        return false;
    }

    wp_update_post([
        'ID' => $attachmentId,
        'post_title' => "Sample Photo {$pexelsId}"
    ]);

    update_post_meta($attachmentId, 'pexels_id', $pexelsId);
    update_post_meta($attachmentId, '_wp_attachment_image_alt', $alt);

    return $attachmentId;
    
}

function acfscImportVideoFromPexels($videoUrl, $pexelsId) {
 
    $pexelsAttachments = get_posts([
        'meta_key'       => 'pexels_id',
        'meta_value'     => $pexelsId,
        'post_type'      => 'attachment',
        'post_status'    => 'any',
        'posts_per_page' => 1,
    ]);

    // If existing pexels attachment exists, return that ID instead
    if ( !empty($pexelsAttachments[0]->ID) ) {
        return $pexelsAttachments[0]->ID;
    }

    add_filter('image_sideload_extensions', function($allowed_extensions, $file) {
        $allowed_extensions[] = 'mp4';
        return $allowed_extensions;
    }, 10, 2);
    
    $attachmentId = media_sideload_image($videoUrl, false, '', 'id');

    if ( is_wp_error($attachmentId) ) {
        return false;
    }

    wp_update_post([
        'ID' => $attachmentId,
        'post_title' => "Sample Video {$pexelsId}"
    ]);

    update_post_meta($attachmentId, 'pexels_id', $pexelsId);

    return $attachmentId;
    
}