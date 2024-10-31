const sampleContentGenerator = new SampleContentGenerator(acfscConfig.imageInventory, acfscConfig.videoInventory, acfscConfig.fileInventory);

class ACFSCInterface {

    constructor() {
        acf.addAction(
            'new_field', 
            field => {
                if ( !acfscConfig.proOnlyFields.includes(field.data.type) && !field.$el.closest('#acf-field-group-options').length ) {
                    field.populator = new ACFSampleContentPopulator(field, sampleContentGenerator)
                    this.handleNewField(field,  this.handlePopulateClick)
                }
            },
        );
        this.popSvg = '<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" style="width: 14px; height: 14px;"><rect fill="none" height="256" width="256"/><path d="M224,67.5a35.5,35.5,0,0,0-11.3-25.7c-14-13.2-36.7-12.7-50.6,1.2L140.2,64.9a24.1,24.1,0,0,0-33.2.8l-7,7a16.1,16.1,0,0,0,0,22.6l2.1,2.1L51.7,147.7a40.3,40.3,0,0,0-11,35.8l-9.8,22.4a13.6,13.6,0,0,0,2.9,15.2,15.8,15.8,0,0,0,11.3,4.7,16.3,16.3,0,0,0,6.4-1.3l21-9.2a40.3,40.3,0,0,0,35.8-11l50.3-50.4,2.1,2.1a15.9,15.9,0,0,0,22.6,0l7-7a24.1,24.1,0,0,0,.8-33.2l22.4-22.3A36.2,36.2,0,0,0,224,67.5ZM137.9,152H70.1l43.3-43.3,33.9,33.9Zm64.2-69.9-28,28a8.1,8.1,0,0,0,0,11.4l4.9,4.8a8.1,8.1,0,0,1,0,11.4l-7,7L111.3,84l7-7a8,8,0,0,1,11.4,0l4.8,4.9a8.1,8.1,0,0,0,11.4,0l27.5-27.6c7.9-7.8,20.6-8.2,28.3-.8A19.7,19.7,0,0,1,208,67.7,19.4,19.4,0,0,1,202.1,82.1Z"/></svg>';
        this.loadingSpinner = '<div class="lds-ring" style="display: none"><div></div><div></div><div></div><div></div></div>';

        jQuery(document).ready(this.documentReady);
    }

    handleNewField = (field, clickFunction) => {

        $ = jQuery;

        // If this is a settings field, bail
        if ( field.$el.closest('.settings').length || field.$el.closest('.field-group-locations').length ) {
            return false;
        }
    
        // Remove any pre-existing populate buttons
        field.$el
            .closest('.acf-field')
            .find('.acfsc-populate')
            .remove();
        
        const popButtons = this.getPopulateButtons(field);

        for ( let i = 0; i < popButtons.length; i++ ) {

            popButtons[i].click((event) => clickFunction(event, field, popButtons[i]));

            this.appendPopulateButton(field, popButtons[i]);

        }

    }

    handlePopulateClick(event, field, $button) {
        event.stopPropagation();

        const option = $button.data('option');

        field.populator
            .populate($button, option)
            .catch(() => {
                if ( event.isTrigger ) {

                    const $siblings = $button.siblings('.acfsc-populate:not(.acfsc-superpop-initiator):first');
                    if ( $siblings.length ) {
                        $button.siblings('.acfsc-populate:not(.acfsc-superpop-initiator):first').trigger('click');
                    }
                    else {
                        $('.acfsc-superpop-initiator').removeClass('acfsc-superpop-initiator');
                    }
                    
                }
            });
    }

    appendPopulateButton = (field, $button) => {
        
        const $acfField = field.$el.closest('.acf-field');

        if ( $acfField.length && $acfField[0].nodeName == 'TD' ) {
            let $tableBtnWrap = $('<div class="acfsc-table-btn"></div>');
            $tableBtnWrap.append($button);

            // Group within a table repeater
            if ( $acfField.find('.acf-input .acf-fields').length ) {
                $acfField.find('.acf-input .acf-fields').prepend($tableBtnWrap);
            }
            else {
                $acfField.find('.acf-input').prepend($button);
            }
            
        }
        else {

            // If meta box, prepend to handle-actions
            if ( field.$el.hasClass('acf-postbox') ) {
                const $handleActions = field.$el.find('.handle-actions');
                $button.find('.lds-ring').prependTo($button);
                $handleActions.prepend($button);
                $handleActions.find('.lds-ring').prependTo($handleActions);
            }
            else {
                const $label = $acfField.find('.acf-label:first > label');
                if ( $label.length ) {
                    $label.after($button);
                }
                else {
                    field.$el.find('.acf-input').prepend($button)
                }
            }
            
        }
    
    }

    getPopulateButtons = (field) => {

        const buttons = [];

        switch(field.data.type) {
            case 'text':
                const smallSvg = '<svg style="width: 13px; height: 13px;" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg"><path d="M381.5 435.7l-160-384C216.6 39.78 204.9 32.01 192 32.01S167.4 39.78 162.5 51.7l-160 384c-6.797 16.31 .9062 35.05 17.22 41.84c16.38 6.828 35.08-.9219 41.84-17.22l31.8-76.31h197.3l31.8 76.31c5.109 12.28 17.02 19.7 29.55 19.7c4.094 0 8.266-.7969 12.3-2.484C380.6 470.7 388.3 452 381.5 435.7zM119.1 320L192 147.2l72 172.8H119.1z"/></svg>';
                const mediumSvg = '<svg style="width: 14px; height: 14px" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:serif="http://www.serif.com/" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Icon"><path d="M22.75,15l-0,-10c0,-0.995 -0.395,-1.948 -1.098,-2.652c-0.704,-0.703 -1.657,-1.098 -2.652,-1.098c-3.776,-0 -10.224,-0 -14,-0c-2.071,0 -3.75,1.679 -3.75,3.75l-0,14c0,0.995 0.395,1.948 1.098,2.652c0.704,0.703 1.657,1.098 2.652,1.098c3.839,-0 10,-0 10,-0c0.414,-0 0.75,-0.336 0.75,-0.75c-0,-0.414 -0.336,-0.75 -0.75,-0.75c-0,-0 -6.161,-0 -10,-0c-0.597,0 -1.169,-0.237 -1.591,-0.659c-0.422,-0.422 -0.659,-0.994 -0.659,-1.591l-0,-14c0,-1.243 1.007,-2.25 2.25,-2.25c3.776,-0 10.224,-0 14,-0c0.597,0 1.169,0.237 1.591,0.659c0.422,0.422 0.659,0.994 0.659,1.591l-0,10c-0,0.414 0.336,0.75 0.75,0.75c0.414,0 0.75,-0.336 0.75,-0.75Z"/><path d="M17.859,13.97c-0.105,-0.105 -0.238,-0.176 -0.383,-0.205l-3.536,-0.708c-0.246,-0.049 -0.5,0.028 -0.677,0.206c-0.178,0.177 -0.255,0.431 -0.206,0.677l0.708,3.536c0.029,0.145 0.1,0.278 0.205,0.383c-0,-0 2.232,2.232 3.611,3.611c0.422,0.422 0.994,0.659 1.591,0.659c0.596,-0 1.169,-0.237 1.591,-0.659c0.231,-0.232 0.475,-0.476 0.707,-0.707c0.422,-0.422 0.659,-0.995 0.659,-1.591c-0,-0.597 -0.237,-1.169 -0.659,-1.591c-1.379,-1.379 -3.611,-3.611 -3.611,-3.611Zm-0.9,1.221l3.45,3.45c0.141,0.141 0.22,0.332 0.22,0.531c-0,0.198 -0.079,0.389 -0.22,0.53l-0.707,0.707c-0.141,0.141 -0.332,0.22 -0.53,0.22c-0.199,-0 -0.39,-0.079 -0.531,-0.22l-3.45,-3.45c-0,-0 -0.442,-2.21 -0.442,-2.21l2.21,0.442Z"/><path d="M6,14.75l5,0c0.414,-0 0.75,-0.336 0.75,-0.75c-0,-0.414 -0.336,-0.75 -0.75,-0.75l-5,0c-0.414,-0 -0.75,0.336 -0.75,0.75c-0,0.414 0.336,0.75 0.75,0.75Z"/><path d="M6,10.75l5.5,0c0.414,0 0.75,-0.336 0.75,-0.75c0,-0.414 -0.336,-0.75 -0.75,-0.75l-5.5,0c-0.414,0 -0.75,0.336 -0.75,0.75c0,0.414 0.336,0.75 0.75,0.75Z"/><path d="M14.5,10.75l2.5,0c0.414,0 0.75,-0.336 0.75,-0.75c0,-0.414 -0.336,-0.75 -0.75,-0.75l-2.5,0c-0.414,0 -0.75,0.336 -0.75,0.75c0,0.414 0.336,0.75 0.75,0.75Z"/><path d="M6,6.75l11,0c0.414,0 0.75,-0.336 0.75,-0.75c0,-0.414 -0.336,-0.75 -0.75,-0.75l-11,0c-0.414,0 -0.75,0.336 -0.75,0.75c0,0.414 0.336,0.75 0.75,0.75Z"/></g></svg>';
                const largeSvg = '<svg style="width: 14px; height: 14px" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:serif="http://www.serif.com/" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Icon"><circle cx="5.5" cy="4.5" r="0.75"/><circle cx="8" cy="4.5" r="0.75"/><circle cx="10.5" cy="4.5" r="0.75"/><path d="M22.75,9c0,0.414 -0.336,0.75 -0.75,0.75c-0.414,0 -0.75,-0.336 -0.75,-0.75l0,-4.5c0,-0.966 -0.783,-1.75 -1.75,-1.75l-15,0c-0.967,0 -1.75,0.783 -1.75,1.75l0,15c0,0.967 0.783,1.75 1.75,1.75l8.5,0c0.414,0 0.75,0.336 0.75,0.75c-0,0.414 -0.336,0.75 -0.75,0.75l-8.5,0c-1.795,-0 -3.25,-1.455 -3.25,-3.25l0,-15c0,-1.795 1.455,-3.25 3.25,-3.25l15,0c1.795,0 3.25,1.455 3.25,3.25l0,4.5Z"/><path d="M17.601,10.868c0.409,-0.876 1.45,-1.255 2.326,-0.846l1.812,0.845c0.876,0.409 1.255,1.45 0.847,2.326l-3.381,7.25c-0.063,0.134 -0.164,0.247 -0.29,0.324l-3.081,1.874c-0.214,0.13 -0.479,0.145 -0.706,0.039c-0.228,-0.106 -0.387,-0.319 -0.425,-0.567l-0.544,-3.564c-0.023,-0.146 -0.001,-0.296 0.061,-0.43l3.381,-7.251Zm1.36,0.634l-3.285,7.045l0.34,2.228l1.925,-1.171l3.285,-7.045c0.059,-0.125 0.005,-0.274 -0.121,-0.332l-1.812,-0.846c-0.125,-0.058 -0.274,-0.004 -0.332,0.121Z"/><path d="M22,6.25c0.414,-0 0.75,0.336 0.75,0.75c0,0.414 -0.336,0.75 -0.75,0.75l-20,0c-0.414,-0 -0.75,-0.336 -0.75,-0.75c0,-0.414 0.336,-0.75 0.75,-0.75l20,0Z"/><path d="M17.119,13.678c-0.376,-0.175 -0.538,-0.622 -0.363,-0.997c0.175,-0.375 0.621,-0.538 0.997,-0.363l3.625,1.691c0.375,0.175 0.538,0.621 0.363,0.996c-0.175,0.376 -0.622,0.538 -0.997,0.363l-3.625,-1.69Z"/><path d="M6,11.25c-0.414,0 -0.75,-0.336 -0.75,-0.75c-0,-0.414 0.336,-0.75 0.75,-0.75l7,0c0.414,0 0.75,0.336 0.75,0.75c-0,0.414 -0.336,0.75 -0.75,0.75l-7,0Z"/><path d="M6,15.25c-0.414,0 -0.75,-0.336 -0.75,-0.75c-0,-0.414 0.336,-0.75 0.75,-0.75l7,0c0.414,0 0.75,0.336 0.75,0.75c-0,0.414 -0.336,0.75 -0.75,0.75l-7,0Z"/><path d="M6,19.25c-0.414,0 -0.75,-0.336 -0.75,-0.75c-0,-0.414 0.336,-0.75 0.75,-0.75l5,0c0.414,0 0.75,0.336 0.75,0.75c-0,0.414 -0.336,0.75 -0.75,0.75l-5,0Z"/></g></svg>';
                buttons.push($(`<button type="button" class="acfsc-populate acf-js-tooltip" data-option="large" title="Populate with a *large* amount of lorem ipsum text">${largeSvg}</button>`));
                buttons.push($(`<button type="button" class="acfsc-populate acfsc-populate--default acf-js-tooltip" data-option="default" title="Populate with a *medium* amount of lorem ipsum text">${mediumSvg}</button>`));
                buttons.push($(`<button type="button" class="acfsc-populate acf-js-tooltip" data-option="small" title="Populate with a *small* amount of lorem ipsum text">${smallSvg}</button>`));
                break;

            case 'file':
                const fileSvg = '<svg viewBox="0 0 384 512" style="width: 11px; height: 11px" xmlns="http://www.w3.org/2000/svg"><path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm160-14.1v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z"/></svg>';
                const playSvg = '<svg  style="width: 13px; height: 13px; margin-left: 1px;" id="Layer_1" style="enable-background:new 0 0 512 512;" version="1.1" viewBox="0 0 512 512" width="512px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M405.2,232.9L126.8,67.2c-3.4-2-6.9-3.2-10.9-3.2c-10.9,0-19.8,9-19.8,20H96v344h0.1c0,11,8.9,20,19.8,20  c4.1,0,7.5-1.4,11.2-3.4l278.1-165.5c6.6-5.5,10.8-13.8,10.8-23.1C416,246.7,411.8,238.5,405.2,232.9z"/></svg>';
                buttons.push($(`<button type="button" class="acfsc-populate acf-js-tooltip" data-option="file" title="Populate with a file from the Sample File inventory">${fileSvg}</button>`));
                buttons.push($(`<button type="button" class="acfsc-populate acfsc-populate--default acf-js-tooltip" data-option="video" title="Populate with a video from the Sample Video inventory">${playSvg}</button>`));
                break;
            
            case 'wysiwyg':
                const singleParaSvg = '<svg style="width: 14px; height: 14px" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:serif="http://www.serif.com/" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Icon"><path d="M22.75,15l-0,-10c0,-0.995 -0.395,-1.948 -1.098,-2.652c-0.704,-0.703 -1.657,-1.098 -2.652,-1.098c-3.776,-0 -10.224,-0 -14,-0c-2.071,0 -3.75,1.679 -3.75,3.75l-0,14c0,0.995 0.395,1.948 1.098,2.652c0.704,0.703 1.657,1.098 2.652,1.098c3.839,-0 10,-0 10,-0c0.414,-0 0.75,-0.336 0.75,-0.75c-0,-0.414 -0.336,-0.75 -0.75,-0.75c-0,-0 -6.161,-0 -10,-0c-0.597,0 -1.169,-0.237 -1.591,-0.659c-0.422,-0.422 -0.659,-0.994 -0.659,-1.591l-0,-14c0,-1.243 1.007,-2.25 2.25,-2.25c3.776,-0 10.224,-0 14,-0c0.597,0 1.169,0.237 1.591,0.659c0.422,0.422 0.659,0.994 0.659,1.591l-0,10c-0,0.414 0.336,0.75 0.75,0.75c0.414,0 0.75,-0.336 0.75,-0.75Z"/><path d="M17.859,13.97c-0.105,-0.105 -0.238,-0.176 -0.383,-0.205l-3.536,-0.708c-0.246,-0.049 -0.5,0.028 -0.677,0.206c-0.178,0.177 -0.255,0.431 -0.206,0.677l0.708,3.536c0.029,0.145 0.1,0.278 0.205,0.383c-0,-0 2.232,2.232 3.611,3.611c0.422,0.422 0.994,0.659 1.591,0.659c0.596,-0 1.169,-0.237 1.591,-0.659c0.231,-0.232 0.475,-0.476 0.707,-0.707c0.422,-0.422 0.659,-0.995 0.659,-1.591c-0,-0.597 -0.237,-1.169 -0.659,-1.591c-1.379,-1.379 -3.611,-3.611 -3.611,-3.611Zm-0.9,1.221l3.45,3.45c0.141,0.141 0.22,0.332 0.22,0.531c-0,0.198 -0.079,0.389 -0.22,0.53l-0.707,0.707c-0.141,0.141 -0.332,0.22 -0.53,0.22c-0.199,-0 -0.39,-0.079 -0.531,-0.22l-3.45,-3.45c-0,-0 -0.442,-2.21 -0.442,-2.21l2.21,0.442Z"/><path d="M6,14.75l5,0c0.414,-0 0.75,-0.336 0.75,-0.75c-0,-0.414 -0.336,-0.75 -0.75,-0.75l-5,0c-0.414,-0 -0.75,0.336 -0.75,0.75c-0,0.414 0.336,0.75 0.75,0.75Z"/><path d="M6,10.75l5.5,0c0.414,0 0.75,-0.336 0.75,-0.75c0,-0.414 -0.336,-0.75 -0.75,-0.75l-5.5,0c-0.414,0 -0.75,0.336 -0.75,0.75c0,0.414 0.336,0.75 0.75,0.75Z"/><path d="M14.5,10.75l2.5,0c0.414,0 0.75,-0.336 0.75,-0.75c0,-0.414 -0.336,-0.75 -0.75,-0.75l-2.5,0c-0.414,0 -0.75,0.336 -0.75,0.75c0,0.414 0.336,0.75 0.75,0.75Z"/><path d="M6,6.75l11,0c0.414,0 0.75,-0.336 0.75,-0.75c0,-0.414 -0.336,-0.75 -0.75,-0.75l-11,0c-0.414,0 -0.75,0.336 -0.75,0.75c0,0.414 0.336,0.75 0.75,0.75Z"/></g></svg>';
                const multiParaSvg = '<svg style="width: 14px; height: 14px" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:serif="http://www.serif.com/" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Icon"><circle cx="5.5" cy="4.5" r="0.75"/><circle cx="8" cy="4.5" r="0.75"/><circle cx="10.5" cy="4.5" r="0.75"/><path d="M22.75,9c0,0.414 -0.336,0.75 -0.75,0.75c-0.414,0 -0.75,-0.336 -0.75,-0.75l0,-4.5c0,-0.966 -0.783,-1.75 -1.75,-1.75l-15,0c-0.967,0 -1.75,0.783 -1.75,1.75l0,15c0,0.967 0.783,1.75 1.75,1.75l8.5,0c0.414,0 0.75,0.336 0.75,0.75c-0,0.414 -0.336,0.75 -0.75,0.75l-8.5,0c-1.795,-0 -3.25,-1.455 -3.25,-3.25l0,-15c0,-1.795 1.455,-3.25 3.25,-3.25l15,0c1.795,0 3.25,1.455 3.25,3.25l0,4.5Z"/><path d="M17.601,10.868c0.409,-0.876 1.45,-1.255 2.326,-0.846l1.812,0.845c0.876,0.409 1.255,1.45 0.847,2.326l-3.381,7.25c-0.063,0.134 -0.164,0.247 -0.29,0.324l-3.081,1.874c-0.214,0.13 -0.479,0.145 -0.706,0.039c-0.228,-0.106 -0.387,-0.319 -0.425,-0.567l-0.544,-3.564c-0.023,-0.146 -0.001,-0.296 0.061,-0.43l3.381,-7.251Zm1.36,0.634l-3.285,7.045l0.34,2.228l1.925,-1.171l3.285,-7.045c0.059,-0.125 0.005,-0.274 -0.121,-0.332l-1.812,-0.846c-0.125,-0.058 -0.274,-0.004 -0.332,0.121Z"/><path d="M22,6.25c0.414,-0 0.75,0.336 0.75,0.75c0,0.414 -0.336,0.75 -0.75,0.75l-20,0c-0.414,-0 -0.75,-0.336 -0.75,-0.75c0,-0.414 0.336,-0.75 0.75,-0.75l20,0Z"/><path d="M17.119,13.678c-0.376,-0.175 -0.538,-0.622 -0.363,-0.997c0.175,-0.375 0.621,-0.538 0.997,-0.363l3.625,1.691c0.375,0.175 0.538,0.621 0.363,0.996c-0.175,0.376 -0.622,0.538 -0.997,0.363l-3.625,-1.69Z"/><path d="M6,11.25c-0.414,0 -0.75,-0.336 -0.75,-0.75c-0,-0.414 0.336,-0.75 0.75,-0.75l7,0c0.414,0 0.75,0.336 0.75,0.75c-0,0.414 -0.336,0.75 -0.75,0.75l-7,0Z"/><path d="M6,15.25c-0.414,0 -0.75,-0.336 -0.75,-0.75c-0,-0.414 0.336,-0.75 0.75,-0.75l7,0c0.414,0 0.75,0.336 0.75,0.75c-0,0.414 -0.336,0.75 -0.75,0.75l-7,0Z"/><path d="M6,19.25c-0.414,0 -0.75,-0.336 -0.75,-0.75c-0,-0.414 0.336,-0.75 0.75,-0.75l5,0c0.414,0 0.75,0.336 0.75,0.75c-0,0.414 -0.336,0.75 -0.75,0.75l-5,0Z"/></g></svg>';
                buttons.push($(`<button type="button" class="acfsc-populate acf-js-tooltip" data-option="multi" title="Populate with 2-3 paragraphs of lorem ipsum text">${multiParaSvg}</button>`));
                buttons.push($(`<button type="button" class="acfsc-populate acfsc-populate--default acf-js-tooltip" data-option="default" title="Populate with a single paragraph of lorem ipsum text">${singleParaSvg}</button>`));
                break;
            default:

                let tooltipText;
                let withSpinner = false;
                switch(field.data.type) {
                    case 'text':
                    case 'textarea':
                    //case 'wysiwyg':
                        tooltipText = 'Populate with lorem ipsum text'
                        break;
                    case 'number':
                    case 'range':
                        tooltipText = 'Auto-picks a random number between the min/max configuration'
                        break;
                    case 'url':
                    case 'link':
                        tooltipText = 'Populate with a random URL'
                        break;
                    case 'password':
                        tooltipText = 'Auto-populates a random password'
                        break;
                    case 'image':
                        tooltipText = 'Populate with an image from the Sample Image inventory'
                        break;
                    case 'oembed':
                        tooltipText = 'Populate with an example YouTube embed'
                        break;
                    case 'gallery':
                        tooltipText = 'Auto-populates with images from the Sample Image inventory'
                        break;
                    case 'select':
                        tooltipText = 'Auto-picks a random choice'
                        break;
                    case 'checkbox':
                        tooltipText = 'Auto-picks a few checkboxes'
                        break;
                    case 'radio':
                    case 'button_group':
                        tooltipText = 'Auto-picks an option'
                        break;
                    case 'true_false':
                        tooltipText = '50% chance of auto-checking this'
                        break;
                    case 'post_object':
                    case 'page_link':
                    case 'relationship':
                        tooltipText = 'Auto-selects one or more posts from this field depending on the field\'s configuration'
                        break;
                    case 'taxonomy':
                        tooltipText = 'Auto-selects one or more terms from this field depending on the field\'s configuration'
                        break;
                    case 'user':
                        tooltipText = 'Auto-selects one or more users from this field depending on the field\'s configuration'
                        break;
                    case 'google_map':
                        tooltipText = 'Auto-picks a random location on the map'
                        break;
                    case 'date_picker':
                        case 'date_time_picker':
                        tooltipText = 'Auto-picks a random date within 1 year of the future'
                        break;
                    case 'time_picker':
                        tooltipText = 'Auto-picks a random time of day'
                        break;
                    case 'color_picker':
                        tooltipText = 'Auto-picks a random color'
                        break;
                    case 'flexible_content':
                        tooltipText = 'Automatically adds all layouts in this flexible content field, all fields within each and populates with sample content'
                        withSpinner = true
                        break;
                    case 'repeater':
                        tooltipText = 'Automatically populate this repeater\'s rows and fields with a click of a button'
                        withSpinner = true
                        break;
                    // Metabox / Field group
                    case 'group':
                    default:
                        tooltipText = 'Automatically populate all of this group\'s fields with a click of a button'
                        withSpinner = true;
                        break
                }

            
                buttons.push($(`<button type="button" class="acfsc-populate acfsc-populate--default acf-js-tooltip" data-option="default" title="${tooltipText}">${this.popSvg}</button>${withSpinner ? this.loadingSpinner : ''}`));
                
                break;
        }


        return acf.applyFilters('acfsc_populate_buttons', buttons, field);
    
    }

    // Functionality for default WP editor
    // This is duplicated from the populator class but is necessary because of it's seperation from ACF
    documentReady = ($) => {

        const $parent =  $('#postdivrich');
        if ( $parent.length && !$('.acfsc-populate', $parent).length ) {
            
            const $buttons = this.getPopulateButtons({data: {type: 'wysiwyg'}});
            const $editorTabs = $('.wp-editor-tabs', $parent);

            let fieldOptions = {
                'default': () => {
                    return sampleContentGenerator.getSingleParagraphContent();
                },
                'multi': () => {
                    return sampleContentGenerator.getMultiParagraphContent();
                }
            }

            const hasMedia = $('button.insert-media', $parent).length > 0;
            if ( hasMedia ) {
                fieldOptions = acf.applyFilters('acfsc_wysiwyg_extra_options', fieldOptions);
            }

            for ( let i = 0; i < $buttons.length; i++ ) {
    
                $buttons[i].click(() => {
                    const option = $buttons[i].data('option');
                    console.log('fieldOptions', fieldOptions);
                    const generatedContent = fieldOptions[option]($parent);
                    const $iframe       = $parent.find('iframe');
                    const $textarea     = $parent.find('textarea.wp-editor-area');
                    const thisTinymce   = tinymce.get('content');
    
                    $iframe.contents().find("#tinymce").html(generatedContent);
                
                    if ( thisTinymce ) {
                        thisTinymce.save();
                    }
    
                    $textarea.val(generatedContent);
                    
                });


                $buttons[i].prependTo($editorTabs);
            }
    
        }
    }
}

new ACFSCInterface();