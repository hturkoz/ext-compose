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
 * @module ext-compose:views/modals/compose-template-edit
 */

import ModalView from 'views/modal';
import Model from 'model';

/**
 * Modal for composing a PDF document from a template.
 *
 * Expected options:
 * - `parentType` {string} Type of the current parent entity (e.g. Account).
 * - `parentId` {string} ID of the current parent entity.
 *
 * The modal model is independent of the parent record.
 */
export default class ComposeTemplateModalView extends ModalView {

    /** @inheritDoc */
    isWide = true;

    /** @inheritDoc */
    sideView = false;

    /** @inheritDoc */
    templateContent = `<div class="record no-side-margin">{{{record}}}</div>`;

    /**
     * Default values merged with the model attributes when generating the PDF.
     *
     * @type {Object<string, *>}
     */
    templateDefaults = {
        body: '',
        templateBody: '',
        header: '',
        footer: '',
        leftMargin: 10,
        rightMargin: 10,
        topMargin: 10,
        bottomMargin: 10,
        printFooter: false,
        printHeader: false,
        footerPosition: 10,
        headerPosition: 0,
        pageOrientation: 'Portrait',
        pageFormat: 'A4',
        pageWidth: 0,
        pageHeight: 0,
        fontFace: 'Arial',
        title: '',
        style: '',
        fileName: 'file.pdf',
    };

    /**
     * Whether the template body has been manually modified since the last load.
     *
     * @type {boolean}
     */
    isBodyChanged = false;

    /**
     * Whether a template is currently being loaded programmatically.
     * Changes made during this process are not considered user modifications.
     *
     * @type {boolean}
     */
    isLoadingTemplate = false;

    /**
     * The last successfully applied template, used to restore the selection
     * if the user cancels a template change.
     *
     * @type {{id: ?string, name: ?string}}
     */
    currentTemplate = {id: null, name: null};

    /** @inheritDoc */
    setup() {
        super.setup();

        this.headerText = this.translate('composeTemplate', 'labels');

        this.buttonList.push({
            name: 'print',
            text: this.translate('Print', 'labels'),
            style: 'primary',
            onClick: () => this.actionPrint(),
        });

        this.buttonList.push({
            name: 'cancel',
            label: this.translate('Cancel', 'labels'),
        });

        this.buttonList.push({
            name: 'close',
            text: this.translate('Close', 'labels'),
            onClick: () => this.close(),
        });

        this.model = new Model();
        this.model.name = 'Template';
        this.model.setDefs({
            fields: {
                selectTemplate: {type: 'link', entity: 'Template'},
                body: {type: 'wysiwyg'},
            },
        });
        this.model.set({
            parentType: this.options.parentType,
            parentId: this.options.parentId,
        });

        this.listenTo(this.model, 'change:templateBody', () => {
            if (!this.isLoadingTemplate) {
                this.isBodyChanged = true;
            }
        });

        this.listenTo(this.model, 'change:selectTemplateId', () => {
            this.onTemplateSelected();
        });

        this.createView('record', 'views/record/edit-for-modal', {
            selector: '.record',
            model: this.model,
            detailLayout: this.getDetailLayout(),
        });
    }

    /**
     * Handles template selection and asks for confirmation if the current
     * body has been manually modified.
     */
    onTemplateSelected() {
        const id = this.model.get('selectTemplateId');

        if (!id || this.isLoadingTemplate) {
            return;
        }

        const body = this.model.get('templateBody') || '';

        if (body !== '' && this.isBodyChanged) {
            this.confirm({
                message: this.translate('confirmReplaceBody', 'messages'),
                confirmText: this.translate('Yes'),
            })
                .then(() => this.loadTemplate(id))
                // Restore the previous selection if the promise is rejected when the user clicks "No".
                .catch(() => this.revertSelection());

            return;
        }

        this.loadTemplate(id);
    }

    /**
     * Restores the previously applied template selection without triggering
     * another template load.
     */
    revertSelection() {
        this.isLoadingTemplate = true;

        this.model.set({
            selectTemplateId: this.currentTemplate.id,
            selectTemplateName: this.currentTemplate.name,
        });

        this.isLoadingTemplate = false;
    }

    /**
     * Loads the selected template for the parent entity and populates the modal model.
     *
     * @param {string} templateId - ID of the template to load.
     */
    loadTemplate(templateId) {
        this.isLoadingTemplate = true;
        Espo.Ui.notifyWait();

        this.getModelFactory().create('Template', template => {

            template.id = templateId;

            template.fetch()
                .then(() => {
                    return Espo.Ajax.postRequest(
                        `Template/${templateId}/ComposePdfPrepare`,
                        {
                            parentType: this.model.get('parentType'),
                            parentId: this.model.get('parentId'),
                        }
                    );
                })
                .then(data => {
                    this.model.set({
                        body: data.body,
                        templateBody: data.body,
                        header: data.header,
                        footer: data.footer,
                        style: data.style,
                        pageOrientation: data.pageOrientation,
                        pageFormat: data.pageFormat,
                        pageWidth: data.pageWidth,
                        pageHeight: data.pageHeight,
                        topMargin: data.topMargin,
                        bottomMargin: data.bottomMargin,
                        leftMargin: data.leftMargin,
                        rightMargin: data.rightMargin,
                        fontFace: data.fontFace,
                        printHeader: data.printHeader,
                        printFooter: data.printFooter,
                        headerPosition: data.headerPosition,
                        footerPosition: data.footerPosition,
                        title: data.title,
                    });

                    this.currentTemplate = {
                        id: templateId,
                        name: this.model.get('selectTemplateName'),
                    };

                    this.isBodyChanged = false;
                })
                .catch(error => {
                    console.error('Failed to load template:', error);
                    Espo.Ui.error('Failed to load template');
                    this.revertSelection();
                })
                .finally(() => {
                    this.isLoadingTemplate = false;
                    Espo.Ui.notify(false);
                });
        });
    }

    /**
     * Generates the PDF on the server and opens it in a new browser tab.
     */
    actionPrint() {
        const entityType = this.model.get('parentType');
        const entityId = this.model.get('parentId');
        const selectTemplateId = this.model.get('selectTemplateId');

        const templateData = {
            ...this.templateDefaults,
            ...this.model.attributes,
            body: this.model.get('templateBody'),
        };

        Espo.Ajax.postRequest(
            `Template/${selectTemplateId}/ComposePdfFactory`,
            {
                entityType,
                entityId,
                templateData,
            }
        ).then(response => {

            const binaryString = atob(response.pdf);
            const bytes = new Uint8Array(binaryString.length);

            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const blob = new Blob([bytes], {type: 'application/pdf'});
            const url = URL.createObjectURL(blob);

            window.open(url, '_blank');

            setTimeout(() => URL.revokeObjectURL(url), 100);

        }).catch(error => {

            console.error('PDF generation failed:', error);
            Espo.Ui.error('Failed to generate PDF');

        });
    }

    /**
     * Handles the Cancel button and asks for confirmation before discarding changes.
     */
    actionCancel() {
        if (!this.isBodyChanged) {
            this.close();

            return;
        }

        this.confirm({
            message: this.translate('confirmDiscardChanges', 'messages'),
            confirmText: this.translate('Yes'),
        })
            .then(() => this.close());
    }

    /**
     * @param {function(Object): void} callback - Callback receiving the converted layout.
     */
    getGridLayout(callback) {
        const layout = this.getDetailLayout();
        this.detailLayout = layout;

        callback({
            type: 'record',
            layout: this.convertDetailLayout(layout),
        });
    }

    /**
     * Returns the field layout used by the modal.
     *
     * @returns {Array<Object>} The modal field layout.
     */
    getDetailLayout() {
        return [
            {
                rows: [
                    [
                        {
                            name: 'selectTemplate',
                            label: this.translate('selectTemplate', 'labels'),
                            type: 'link',
                            view: 'ext-compose:views/fields/select-template-filtered',
                            params: {
                                entity: 'Template',
                            },
                        },
                    ],
                    [
                        {
                            name: 'templateBody',
                            label: this.translate('templateBody', 'labels'),
                            type: 'wysiwyg',
                            view: 'ext-compose:views/fields/wysiwyg-no-theme',
                            params: {
                                height: 500,
                                toolbar: [
                                    ['style', ['style']],
                                    ['style', ['bold', 'italic', 'underline', 'clear']],
                                    ['fontsize', ['fontsize']],
                                    ['color', ['color']],
                                    ['para', ['ul', 'ol', 'paragraph']],
                                    ['height', ['height']],
                                    ['table', ['espoTable', 'espoLink', 'hr']],
                                    ['misc', ['codeview', 'fullscreen']],
                                ],
                            },
                        },
                    ],
                ],
            },
        ];
    }

    // Unused functions kept as requested

    /**
     * Initializes the legacy email template insertion handler.
     *
     * @deprecated No longer used.
     */
    initInsertTemplateEmail() {
        this.listenTo(this.model, 'insert-template', data => {
            const body = this.model.get('body') || '';

            if (body !== '' && this.isBodyChanged) {
                this.confirm({
                    message: this.translate(
                        'confirmInsertTemplate',
                        'messages',
                        'Email'
                    ),
                    confirmText: this.translate('Yes'),
                })
                    .then(() => this.insertTemplate(data));

                return;
            }

            this.insertTemplate(data);
        });

        this.listenTo(this.model, 'change:body', () => {
            this.isBodyChanged = true;
        });
    }

    /**
     * Inserts an email template into the body field.
     *
     * @deprecated No longer used.
     * @param {{body: string}} data - Template data containing the body content.
     */
    insertTemplateEmail(data) {
        this.model.set('body', data.body);
    }
}
