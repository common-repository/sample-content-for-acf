class ACFSampleContentPopulator {
    
    constructor(field, contentGenerator) {
        this.field              = field;
        this.fieldKey           = field.data.key;
        this.fieldType          = field.data.type;
        this.contentGenerator   = contentGenerator;
        this.option             = 'default';
        this.numPopulated       = 0;
        this.noticeTimeoutId    = null;
    }

    showNotice() {
        this.noticeTimeoutId = setTimeout(() => {
            this.field.showNotice({
                text: `There are no sample files that match the validation rules of this field. Either manually add files in the <a href="${acfscConfig.settingsUrl}">Sample Content for ACF settings</a> to match the rules, or loosen your restrictions of this field.`,
                type: 'warning',       // warning, error, success
                dismiss: true,  // allow notice to be dismissed
            });
            clearTimeout(this.noticeTimeoutId);
            this.noticeTimeoutId = null;
        }, 100);
    }

    removeNotice() {
        if ( this.noticeTimeoutId ) {
            clearTimeout(this.noticeTimeoutId);
        }
        this.field.removeNotice();
    }

    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /**
     * This will choose random choices for ACF fields that use the select2 dropdown
     * 
     * This can be used on Post Object fields, Page Link and taxonomy
     */
    doPickRandomSelectChoices() {
        const $select = this.field.select2.$el;
        const isMultiple = this.field.data.multiple;
        var numSelected = 0;

        // Remove all current options first
        $select.val(null).trigger('change');

        function select2AjaxTriggerClicks(json, params, context) {
            setTimeout(function() {

                const $options = $('.select2-results__option[role!="group"][aria-selected="false"]');
                const maxSelect = $options.length >= 4 ? 4 : $options.length
                let randOptionIndex = SampleContentGenerator.arrayGetRandomIndex($options);
                $options.eq(randOptionIndex).trigger('mouseup');
                numSelected++;

                if ( isMultiple && numSelected < maxSelect ) {
                    $select.select2('open');
                }
                else {
                    acf.removeFilter('select2_ajax_results', select2AjaxTriggerClicks);
                }

            }, 200);

            return json;
        }

        acf.addFilter('select2_ajax_results', select2AjaxTriggerClicks);

        $select.select2('open');
    }

    doPickRandomCheckboxChoices() {
        const $checkboxes = this.field.$el.find('input[type=checkbox]');

        if ( $checkboxes.length > 0 ) {

            // Reset all selected checkboxes first
            $checkboxes.prop('checked', false);

            const randomOptionIndex = SampleContentGenerator.arrayGetRandomIndex($checkboxes);
            this.field.$el.find(`input[type=checkbox]:eq(${randomOptionIndex})`).prop('checked', true).trigger('change');

            if ( $checkboxes.length > 1 ) {
                this.field.$el.find(`input[type=checkbox]:eq(${SampleContentGenerator.arrayGetRandomIndex($checkboxes)})`).prop('checked', true).trigger('change');
            }

            if ( $checkboxes.length > 2 ) {
                this.field.$el.find(`input[type=checkbox]:eq(${SampleContentGenerator.arrayGetRandomIndex($checkboxes)})`).prop('checked', true).trigger('change');
            }
        }
    }

    doPickRandomRadioChoice() {
        const $radios = this.field.$el.find('input[type=radio]');

        if ( $radios.length > 0 ) {

            // Reset all selected radios first
            $radios.prop('checked', false);

            const randomOptionIndex = SampleContentGenerator.arrayGetRandomIndex($radios);
            this.field.$el.find(`input[type=radio]:eq(${randomOptionIndex})`).prop('checked', true).trigger('change');
        }
    }

    doSetRandomDatepickerDate() {
        const $dpField = this.field.$el.find('.hasDatepicker');
        const randomDate = this.contentGenerator.getDate();
        $dpField.datepicker('setDate', randomDate);
        $dpField.trigger('change')
    }

    populate(elem, option = 'default') {
        this.$initiatingBtn = elem;
        this.option = option;
        return new Promise((resolve, reject) => {
            this[`populateField_${this.fieldType}`](resolve, reject)
        });
    }

    populateField_text(resolve, reject) {
        const $input = this.field.$input();
        const maxLength = parseInt($input.attr('maxlength'));


        let fieldOptions = {
            'small': () => {
                const smallMax = !maxLength || maxLength >= 20 ? 20 : maxLength;
                return this.contentGenerator.getLineText(smallMax);
            },
            'default': () => {
                const mediumMax = !maxLength || maxLength >= 50 ? 50 : maxLength;
                return this.contentGenerator.getLineText(mediumMax);
            },
            'large': () => {
                const largeMax = !maxLength || maxLength >= 120 ? 120 : maxLength;
                return this.contentGenerator.getLineText(largeMax);
            }
        }


        // const generatedContent = this.contentGenerator.getLineText(maxLength);
        const generatedContent = fieldOptions[this.option]();
        this.field.val(generatedContent);
        resolve();
    }

    populateField_textarea(resolve, reject) {
        const $input = this.field.$input();
        const maxLength = parseInt($input.attr('maxlength'));
        let generatedContent = this.contentGenerator.getParagraphText(maxLength);
        this.field.val(generatedContent);
        resolve();
    }

    populateField_number(resolve, reject) {
        const $input = this.field.$input();
        let generatedContent;

        if ( $input.attr('min') && $input.attr('max') ) {
            const rangeMin = parseInt($input.attr('min'));
            const rangeMax = parseInt($input.attr('max'));
            generatedContent = this.getRandomNumber(rangeMin, rangeMax);
        }

        else if ( $input.attr('min') ) {
            const rangeMin = parseInt($input.attr('min'));
            generatedContent = this.getRandomNumber(rangeMin, (rangeMin + 10));
        }

        else if ( $input.attr('max') ) {
            const rangeMax = parseInt($input.attr('max'));
            generatedContent = this.getRandomNumber((rangeMax - 10), rangeMax);
        }
        else {
            generatedContent = this.getRandomNumber(1, 10);
        }

        this.field.val(generatedContent);
        resolve();
    }

    populateField_range(resolve, reject) {
        const $fieldRange = this.field.$input();

        let generatedContent;

        if ( $fieldRange.attr('min') && $fieldRange.attr('max') ) {
            const rangeMin = parseInt($fieldRange.attr('min'));
            const rangeMax = parseInt($fieldRange.attr('max'));
            generatedContent = this.getRandomNumber(rangeMin, rangeMax);
        }

        else if ( $fieldRange.attr('min') ) {
            const rangeMin = parseInt($fieldRange.attr('min'));
            generatedContent = this.getRandomNumber(rangeMin, (rangeMin + 10));
        }
        else if ( $fieldRange.attr('max') ) {
            const rangeMax = parseInt($fieldRange.attr('max'));
            generatedContent = this.getRandomNumber((rangeMax - 10), rangeMax);
        }
        else {
            generatedContent = this.getRandomNumber(1, 10);
        }

        this.field.setValue(generatedContent);
        resolve();
    }

    populateField_email(resolve, reject) {
        const generatedContent = this.contentGenerator.getEmail();
        this.field.val(generatedContent);
        resolve();
    }

    populateField_url(resolve, reject) {
        const generatedContent = this.contentGenerator.getURL();
        this.field.val(generatedContent);
        resolve();
    }

    populateField_password(resolve, reject) {
        const generatedContent = this.contentGenerator.getPassword();
        this.field.val(generatedContent);
        resolve();
    }

    populateField_image(resolve, reject) {

        const $validationInfo = this.field.$el.find('.acfsc-validation-info');
        const minWidth        = $validationInfo.data('min-width') || 0;
        const minHeight       = $validationInfo.data('min-height') || 0;
        const maxWidth        = $validationInfo.data('max-width') || 9999;
        const maxHeight       = $validationInfo.data('max-height') || 9999;
        const minSize         = $validationInfo.data('filesize-min') || 0;
        const maxSize         = $validationInfo.data('filesize-max') || 9999;
        const mimeTypes       = $validationInfo.data('types') ? $validationInfo.data('types').split(',') : [];
        const previewSize     = this.field.$el.find('.acf-image-uploader').data('preview_size');
        
        const generatedContent = this.contentGenerator.getSampleAttachment(previewSize, mimeTypes, minWidth, minHeight, maxWidth, maxHeight, minSize, maxSize);

        if ( generatedContent ) {
            this.field.removeNotice();
            this.field.render(generatedContent);
        }
        else {
            this.showNotice();
        }

        resolve();

    }

    populateField_file(resolve, reject) {

        let $fileUploader               = this.field.$el.find('.acf-file-uploader');
        const $validationInfo           = this.field.$el.find('.acfsc-validation-info');
        const minSize                   = $validationInfo.data('filesize-min') || 0;
        const maxSize                   = $validationInfo.data('filesize-max') || 9999;
        const pool                      = this.option == 'video' ? 'video' : 'file';
        let fieldTypeRestrictions       = [];
        
        // If any mime type restrictions are set for this field
        if ( $fileUploader.data('mime_types') ) {
            fieldTypeRestrictions = $fileUploader.data('mime_types').split(',');
        }

        const generatedContent = this.contentGenerator.getSampleFile(fieldTypeRestrictions, minSize, maxSize, pool);
        if ( generatedContent ) {
            //this.field.removeNotice();
            this.removeNotice();
            this.field.render(generatedContent);
            resolve();
        }
        else {
            this.showNotice();
            reject();
        }


    }

    populateField_wysiwyg(resolve, reject) {

        const $iframe       = this.field.$el.find('iframe');
        const $textarea     = this.field.$el.find('textarea.wp-editor-area');
        const thisTinymce   = tinymce.get(this.field.data.id);

        let fieldOptions = {
            'default': () => {
                return this.contentGenerator.getSingleParagraphContent();
            },
            'multi': () => {
                return this.contentGenerator.getMultiParagraphContent();
            }
        }

        fieldOptions = acf.applyFilters('acfsc_wysiwyg_extra_options', fieldOptions)

        const generatedContent = fieldOptions[this.option]();

        $iframe.contents().find("#tinymce").html(generatedContent);
        
        if ( thisTinymce ) {
            thisTinymce.save();
        }

        $textarea.val(generatedContent);
        resolve();
    }

    populateField_oembed(resolve, reject) {
        const $inputSearch = this.field.$el.find('.input-search')
        const generatedContent = this.contentGenerator.getOEmbedUrl();
        $inputSearch.val(generatedContent);
        this.field.onKeyupSearch(null, $inputSearch);
        resolve();
    }

    populateField_select(resolve, reject) {
        
        const $select           = this.field.$input();
        const options           = $select.find('option');

        if ( $select.data('ajax') ) {
            this.doPickRandomSelectChoices();
        }
        else {
            if ( options.length > 0 ) {
                const randomOptionIndex = SampleContentGenerator.arrayGetRandomIndex(options);
                const chosenOption = $select.find(`option:eq(${randomOptionIndex})`).val();
    
                // Regular select
                if ( ! this.field.data.multiple ) {
                    $select.val(chosenOption);
                }
                // Multiselect
                else {
    
                    // Reset all selected options first
                    $select.find('option:selected').attr('selected', false);
    
                    $select.find(`option:eq(${randomOptionIndex})`).attr('selected', 'selected');
                    
                    // We will only choose 2 or 3 extra options when multi selecting
                    if ( options.length > 1 ) {
                        $select.find(`option:eq(${SampleContentGenerator.arrayGetRandomIndex(options)})`).attr('selected', 'selected');
                    }
    
                    if ( options.length > 2 ) {
                        $select.find(`option:eq(${SampleContentGenerator.arrayGetRandomIndex(options)})`).attr('selected', 'selected');
                    }
    
                }
    
                $select.trigger('change')
    
            }
        }

        resolve();
        
    }

    populateField_checkbox(resolve, reject) {
        this.doPickRandomCheckboxChoices();
        resolve();
    }

    populateField_radio(resolve, reject) {
        this.doPickRandomRadioChoice();
        resolve();
    }

    populateField_button_group(resolve, reject) {
        const $radios = this.field.$el.find('input[type=radio]');

        if ( $radios.length > 0 ) {

            // Reset all selected radios first
            $radios.prop('checked', false);

            const randomOptionIndex = SampleContentGenerator.arrayGetRandomIndex($radios);
            this.field.$el.find(`input[type=radio]:eq(${randomOptionIndex})`).prop('checked', true).trigger('change').trigger('click');
        }

        resolve();
    }

    populateField_true_false(resolve, reject) {
        if ( SampleContentGenerator.getRandomNumber(1, 2) == 2 ) {
            this.field.$input().prop('checked', true).trigger('change');
        }
        else {
            this.field.$input().prop('checked', false).trigger('change');
        }
        resolve();
    }

    populateField_link(resolve, reject) {
        this.field.setValue({
            url: this.contentGenerator.getURL(),
            title: this.contentGenerator.getButtonText(),
            target: SampleContentGenerator.getRandomNumber(1, 5) == 2 ? '_blank' : '_self'
        });
        resolve();
    }

    populateField_post_object(resolve, reject) {
        this.doPickRandomSelectChoices();
        resolve();
    }

    populateField_page_link(resolve, reject) {
        this.doPickRandomSelectChoices();
        resolve();
    }

    populateField_relationship(resolve, reject) {

        // Remove all current items first
        this.field.$el.find('.acf-rel-item-remove a, .acf-rel-item .-minus').trigger('click');

        const $options = this.field.$el.find('.acf-rel-item-add:not(.disabled), .acf-rel-item:not(.disabled)');

        if ( $options.length ) {
            let randOptionIndex = SampleContentGenerator.arrayGetRandomIndex($options);
            $options.eq(randOptionIndex).trigger('click');
    
            if ( $options.length > 1 ) {
                randOptionIndex = SampleContentGenerator.arrayGetRandomIndex($options);
                $options.eq(randOptionIndex).trigger('click');
            }
    
            if ( $options.length > 2 ) {
                randOptionIndex = SampleContentGenerator.arrayGetRandomIndex($options);
                $options.eq(randOptionIndex).trigger('click');
            }
    
            if ( $options.length > 3 ) {
                randOptionIndex = SampleContentGenerator.arrayGetRandomIndex($options);
                $options.eq(randOptionIndex).trigger('click');
            }
        }

        resolve();

    }

    populateField_taxonomy(resolve, reject) {

        switch(this.field.data.ftype) {
            case 'checkbox':
                this.doPickRandomCheckboxChoices();
                break;
            case 'select':
            case 'multi_select':
                this.doPickRandomSelectChoices();
                break;
            case 'radio':
                this.doPickRandomRadioChoice();
                break;
        }

        resolve();
        
    }

    populateField_user(resolve, reject) {
        this.doPickRandomSelectChoices();
        resolve();
    }

    populateField_google_map(resolve, reject) {
        if ( typeof google != 'undefined' ) {
            const randomCoords = this.contentGenerator.getLatLngCoordinates();
            this.field.searchPosition(randomCoords.lat, randomCoords.lng);
        }
        resolve();
    }

    populateField_date_picker(resolve, reject) {
        this.doSetRandomDatepickerDate();
        resolve();
    }

    populateField_date_time_picker(resolve, reject) {
        this.doSetRandomDatepickerDate();
        resolve();
    }

    populateField_time_picker(resolve, reject) {
        this.doSetRandomDatepickerDate();
        resolve();
    }

    populateField_color_picker(resolve, reject) {
        const randColour = this.contentGenerator.getColour();
        this.field.setValue(randColour);
        resolve();
    }

}