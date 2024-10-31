<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly 

add_action('acf/render_field/type=file', function($field) {
    echo '<div data-filesize-min="'.esc_attr($field['min_size']).'" data-filesize-max="'.esc_attr($field['max_size']).'" class="acfsc-validation-info" style="display:none"></div>';
});

add_action('acf/render_field/type=gallery', function($field) {

    echo '<div 
        data-min-items="'.esc_attr($field['min']).'" 
        data-max-items="'.esc_attr($field['max']).'" 
        data-min-width="'.esc_attr($field['min_width']).'" 
        data-min-height="'.esc_attr($field['min_height']).'" 
        data-max-width="'.esc_attr($field['max_width']).'" 
        data-max-height="'.esc_attr($field['max_height']).'" 
        data-filesize-min="'.esc_attr($field['min_size']).'" 
        data-filesize-max="'.esc_attr($field['max_size']).'" 
        data-types="'.esc_attr($field['mime_types']).'" 
        class="acfsc-validation-info" 
        style="display:none"
        ></div>';

});

add_action('acf/render_field/type=image', function($field) {

    echo '<div 
        data-min-width="'.esc_attr($field['min_width']).'" 
        data-min-height="'.esc_attr($field['min_height']).'" 
        data-max-width="'.esc_attr($field['max_width']).'" 
        data-max-height="'.esc_attr($field['max_height']).'" 
        data-filesize-min="'.esc_attr($field['min_size']).'" 
        data-filesize-max="'.esc_attr($field['max_size']).'" 
        data-types="'.esc_attr($field['mime_types']).'" 
        class="acfsc-validation-info" 
        style="display:none"
        ></div>';

});