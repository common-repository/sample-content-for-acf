const sampleContentGenerator = new SampleContentGenerator(acfscConfig.imageInventory, acfscConfig.videoInventory, acfscConfig.fileInventory);
const keyMaxNum = 'field_656290c6ae847';
const keyPexelsPrompt = 'field_656290c6ae847';

/**
 * The pexels search prompt functionalty
 */
acf.addAction('load_field/name=acfsc_sample_image_type', acfscPexelsCheckForMatches);
acf.addAction('load_field/name=acfsc_sample_video_type', acfscPexelsCheckForMatches);
function acfscPexelsCheckForMatches(field) {

    var $field          = field.$el;
    var $inputWrap      = $field.find('.acf-input-wrap').css('overflow', 'visible');
    var $acfInput       = $field.find('.acf-input');
    var $textInput      = $field.find('input[type=text]').css('paddingRight', '136px');
    var fieldName       = field.data.name;
    var mediaType       = fieldName == 'acfsc_sample_image_type' ? 'photo' : 'video';
    var loadingSpinner  = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
    var checkmark       = '<div class="acfsc-anim-checkmark"> <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"> <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/> <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg></div>';
    var fail            = '<span>&#10006;</span>';
    var checkStr        = 'Checking for matches...';
    var searching       = false;
    var activeAjax;

    var $checkButton = jQuery('<button type="button" class="button button-primary acfsc-check-availability">Check for matches</button>');
    $checkButton.click(function() {

        if ( !$acfInput.siblings('.acfsc-test').length ) {
            $acfInput.after(`<div class="acfsc-test"><div class="acfsc-test__spinner">${loadingSpinner}</div> <span class="acfsc-test__text">${checkStr}</span></div>`);
        }
        else {
            $acfInput.next(`.acfsc-test`).find('.acfsc-test__spinner').html(loadingSpinner);
            $acfInput.next(`.acfsc-test`).find('.acfsc-test__text').html(checkStr);
        }

        activeAjax = jQuery.ajax({
            url: `${acfscConfig.ajaxUrl}?action=acfscTestQuery&mediaType=${fieldName == 'acfsc_sample_image_type' ? 'images' : 'videos'}&testQuery=${encodeURIComponent($textInput.val())}`,
            dataType: 'json',
            error: function() {
                searching = false;
                activeAjax = false;
            },
            success: function(response) {
                if ( response.success ) {
                    $acfInput.next(`.acfsc-test`).find('.acfsc-test__spinner').html('&#10003;');
                    $acfInput.next(`.acfsc-test`).find('.acfsc-test__text').html(`${response.numFound} ${mediaType}${response.numFound == 1 ? '' : 's'} matching "${$textInput.val()}" ${response.numFound == 1 ? 'is' : 'are'} available to use.`);
                }
                else {
                    $acfInput.next(`.acfsc-test`).find('.acfsc-test__spinner').html(fail);
                    $acfInput.next(`.acfsc-test`).find('.acfsc-test__text').html(`0 matching ${mediaType}s found.`);
                }
                searching = false;
                activeAjax = false;
            }
        });
        
    });

    $inputWrap.append($checkButton);

    $textInput.on('keypress', function(e) {
        var keycode = e.keyCode || e.which;
        if(keycode == '13') {
            e.preventDefault();
            $checkButton.trigger('click');
        }
    })

}


/**
 * The pexels image import functionality
 */
acf.addAction('load_field/name=acfsc_image_inventory', function(field) {

    $ = jQuery;
    const $loader = $('.acfsc-pexels-import__loading');
    const $importButton = $('#acfsc-pexels-import');

    $importButton.click(function() {

        $(this).attr('disabled', true);
        $loader.css('display', 'flex');
        // const maxImages = $('.acf-field[data-name="asfsc_max_sample_images"] input[type=number]').val() || 12;
        const maxImages = 6;
        const pexelsQuery = $('.acf-field[data-name="acfsc_sample_image_type"] input[type=text]').val() || 'nature';
        const pexelIndexesUsed = [];
        
        const inventoryField = acf.getField('field_655d752be9c42');

        // Clear the current value of the gallery before importing
        const inventoryValue = inventoryField.getValue();
        if ( inventoryValue.length ) {
            inventoryValue.forEach(function(id) {
                inventoryField.removeAttachment(id);
            });
        }
        
        var i = 0;
        function eachImage() {
            
            if ( i < maxImages ) {

                $loader.find('.acfsc-pexels-import__spinner').show();
                $loader.find('span').text(`Importing ${i+1} of ${maxImages} images...`);

                const postArgs = {
                    action: 'acfscImageImport',
                    query: encodeURIComponent(pexelsQuery),
                    importIndex: i,
                    indexesUsed: pexelIndexesUsed,
                    maxImages: maxImages,
                    previewSize: inventoryField.data.preview_size,
                    nonce: acfscConfig.nonce
                };
    
                $.ajax({
                    url: acfscConfig.ajaxUrl,
                    data: postArgs,
                    dataType: 'json',
                    method: 'post',
                    timeout: 30000,
                    error: function() {
                        $importButton.attr('disabled', false);
                        $loader.hide();
                    },
                    success: function(response) {
                        if ( response.success ) {
                            pexelIndexesUsed.push(response.indexUsed);
                            inventoryField.appendAttachment(response.jsAttachment);
                            if ( i == maxImages ) {
                                $loader.find('span').html(`&#10003; Done! Don't forget to update hit save.`);
                                $importButton.attr('disabled', false);
                                $loader.find('.acfsc-pexels-import__spinner').hide();
                            }
                            eachImage();
                        }
                    }
                });

            }

            i++;

        }

        eachImage();

    });

});

/**
 * The pexels video import functionality
 */
acf.addAction('load_field/name=acfsc_video_inventory', function(field) {
    $ = jQuery;
    const $loader = $('.acfsc-pexels-import__loading');
    const $importButton = $('#acfsc-pexels-video-import');

    $importButton.click(function() {

        // $(this).attr('disabled', true);
        $loader.css('display', 'flex');
        // const maxVideos         = $('.acf-field[data-name="asfsc_max_sample_videos"] input[type=number]').val() || 12;
        const maxVideos         = 6;
        const pexelsQuery       = $('.acf-field[data-name="acfsc_sample_video_type"] input[type=text]').val() || 'nature';
        const pexelIndexesUsed  = [];
            
        const inventoryField = acf.getField('field_6563582990a57');
    
        // Clear the current value of the inventory before importing
        const rows = inventoryField.$rows();
        if ( rows ) {
            for ( let r = 0; r < rows.length; r++ ) {
                $(rows[r]).find('a[data-event="remove-row"]').trigger('click').trigger('click')
            }
        }

        var i = 0;
        function eachVideo() {

            if ( i < maxVideos ) {

                $loader.find('.acfsc-pexels-import__spinner').show();
                $loader.find('span').text(`Importing ${i+1} of ${maxVideos} videos...`);

                const postArgs = {
                    action: 'acfscVideoImport',
                    query: encodeURIComponent(pexelsQuery),
                    importIndex: i,
                    indexesUsed: pexelIndexesUsed,
                    maxVideos: maxVideos,
                    previewSize: inventoryField.data.preview_size,
                    nonce: acfscConfig.nonce
                };
    
                $.ajax({
                    url: acfscConfig.ajaxUrl,
                    data: postArgs,
                    dataType: 'json',
                    method: 'post',
                    timeout: 30000,
                    error: function() {
                        $importButton.attr('disabled', false);
                        $loader.hide();
                    },
                    success: function(response) {
                        if ( response.success ) {

                            pexelIndexesUsed.push(response.indexUsed);

                            // Add a row
                            inventoryField.add();

                            const rows = inventoryField.$rows();

                            // Get fields from the file repeater
                            const fields = acf.getFields({
                                is: ':visible',
                                parent: rows.last()
                            });

                            if ( fields.length ) {
                                const fileField = fields[0];
                                fileField.render(response.jsAttachment, rows.last());
                            }

                            if ( i == maxVideos ) {
                                $loader.find('span').html(`&#10003; Done! Don't forget to update hit save.`);
                                $importButton.attr('disabled', false);
                                $loader.find('.acfsc-pexels-import__spinner').hide();
                            }

                            eachVideo();
                        }
                    }
                });

            }

            i++;

        }

        eachVideo();
    
    });
});

/**
 * Max upload setting notification
 * 
 * field_655d76483d17c = Image import field
 */
acf.addAction('load_field/key=field_655d76483d17c', function(field) {
    if ( acfscConfig.maxUploadSizeMb < 3 ) {
        field.showNotice({
            text: `Your max upload setting is ${acfscConfig.maxUploadSizeMb}MB and the imported images are often larger than that. We recommend increasing your upload limit to at least 10MB to use the Import feature.`,
            type: 'warning',       // warning, error, success
            dismiss: true,  // allow notice to be dismissed
        });
    }
});

acf.addAction('load_field/key=field_6563f8357362b', function(field) {
    if ( acfscConfig.maxUploadSizeMb < 10 ) {
        field.showNotice({
            text: `Your max upload setting is ${acfscConfig.maxUploadSizeMb}MB and the imported videos are often larger than that. We recommend increasing your upload limit to at least 20MB to use the Import feature.`,
            type: 'warning',       // warning, error, success
            dismiss: true,  // allow notice to be dismissed
        });
    }
});