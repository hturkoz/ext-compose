/************************************************************************
 * This file is for EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2026 EspoCRM, Inc.
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

/**
 * @module ext-compose:fields/wysiwyg-no-theme.js
 */

import WysiwygFieldView from 'views/fields/wysiwyg';

export default class WysiwygNoTheme extends WysiwygFieldView {

    noStylesheet = true;
    useIframe = true;
    htmlPurificationForEditDisabled = true;

    enableWysiwygMode() {
        if (!this.$element) {
            return;
        }

        this.$element.addClass('hidden');
        this.$summernote.removeClass('hidden');

        const contents = this.getValueForEdit();

        this.$summernote.html(contents);
        this.$summernote.find('style').remove();
        this.$summernote.find('link[ref="stylesheet"]').remove();

        const keyMap = Espo.Utils.cloneDeep($.summernote.options.keyMap);

        keyMap.pc['CTRL+K'] = 'espoLink.show';
        keyMap.mac['CMD+K'] = 'espoLink.show';
        keyMap.pc['CTRL+DELETE'] = 'removeFormat';
        keyMap.mac['CMD+DELETE'] = 'removeFormat';

        delete keyMap.pc['CTRL+ENTER'];
        delete keyMap.mac['CMD+ENTER'];
        delete keyMap.pc['CTRL+BACKSLASH'];
        delete keyMap.mac['CMD+BACKSLASH'];

        const toolbar = this.toolbar;

        let lastChangeKeydown = new Date();
        const changeKeydownInterval = this.changeInterval * 1000;

        const options = {
            handlebars: this.handlebars,
            prettifyHtml: false,
            disableResizeEditor: true,
            isDark: false,
            espoView: this,
            lang: this.getConfig().get('language'),
            keyMap: keyMap,
            height: 800,

            callbacks: {
                onImageUpload: (files) => {
                    const file = files[0];

                    Espo.Ui.notify(this.translate('Uploading...'));

                    this.uploadInlineAttachment(file)
                        .then(attachment => {
                            const url = '?entryPoint=attachment&id=' + attachment.id;

                            this.$summernote.summernote('insertImage', url);

                            Espo.Ui.notify(false);
                        });
                },

                onBlur: () => {
                    this.trigger('change');
                },

                onKeydown: () => {
                    if (Date.now() - lastChangeKeydown > changeKeydownInterval) {
                        this.trigger('change');
                        lastChangeKeydown = Date.now();
                    }
                },
            },

            onCreateLink(link) {
                return link;
            },

            toolbar: toolbar,
            buttons: this.buttons,
            dialogsInBody: this.$el,
            codeviewFilter: true,
            tableClassName: this.tableClassName,
            disableDragAndDrop: true,

            colorButton: {
                foreColor: '#000000',
                backColor: '#FFFFFF',
            },
        };

        if (this.height) {
            options.height = this.height;
        }

        if (this.minHeight) {
            options.minHeight = this.minHeight;
        }

        this.destroySummernote();
        this.$summernote.summernote(options);

        this.summernoteIsInitialized = true;

        this.$toolbar = this.$el.find('.note-toolbar');
        this.$area = this.$el.find('.note-editing-area');
        this.$noteEditor = this.$el.find('> .note-editor');

        // Force light theme styling on the editor
        this.$summernote.parent().find('.note-editable').css({
            'background-color': '#FFFFFF',
            'color': '#000000',
        });

        // Apply light theme to existing tables
        this.applyTableStyling();

        // Watch for new tables being inserted
        const $editable = this.$summernote.parent().find('.note-editable');

        const observer = new MutationObserver(() => {
            this.applyTableStyling();
        });

        observer.observe($editable[0], {
            childList: true,
            subtree: true,
        });

        this._tableObserver = observer;
    }

    applyTableStyling() {
        const $editable = this.$summernote.parent().find('.note-editable');

        $editable.find('table').each((i, table) => {
            const $table = $(table);

            // Apply light theme styles to table
            $table.css({
                'background-color': '#FFFFFF',
                'color': '#000000',
                'border-color': '#000000',
            });

            // Apply to all cells
            $table.find('td, th').each((j, cell) => {
                const $cell = $(cell);

                $cell.css({
                    'background-color': '#FFFFFF',
                    'color': '#000000',
                    'border-color': '#000000',
                });
            });
        });
    }

    onRemove() {
        if (this._tableObserver) {
            this._tableObserver.disconnect();
        }

        super.onRemove();
    }
}
