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

/** @module ext-compose:compose-types */

/**
 * Describes a "compose" action (PDF, SMS, ...), shared by the detail view dropdown
 * and the activities panel.
 *
 * @typedef {Object} ComposeType
 * @property {string} name
 *   Action name, also used as the translation label key (e.g. `composePdf`).
 *   The handler method is generated as `action` + capitalized name (e.g. `actionComposePdf`).
 * @property {string} modalView
 *   Path of the modal view opened by the action.
 * @property {string} iconClass
 *   CSS class(es) of the icon.
 * @property {number} groupIndex
 *   Index of the dropdown group (detail view only).
 * @property {(view: import('view').default) => boolean} isAvailable
 *   Returns whether the action is available for the given view. The view must expose
 *   `model`, `getHelper()` and `getConfig()` (true for record views and panels).
 */

/**
 * Checks whether the view's entity type has templates.
 *
 * @param {import('view').default} view
 * @returns {boolean}
 */
const hasTemplates = view =>
    (view.getHelper().getAppParam('templateEntityTypeList') || []).includes(view.model.entityType);

/**
 * Registered compose types. To add a new one, append an entry here.
 *
 * @type {ComposeType[]}
 */
export const COMPOSE_TYPES = [
    {
        name: 'composePdf',
        modalView: 'ext-compose:views/modals/compose-pdf-edit',
        iconClass: 'fas fa-file-alt',
        groupIndex: 6,
        isAvailable: view => hasTemplates(view),
    },
    {
        name: 'composeSms',
        modalView: 'ext-compose:views/modals/compose-sms-edit',
        iconClass: 'fas fa-sms',
        groupIndex: 6,
        isAvailable: view =>
            !!view.getHelper().getAppParam('smsEnabled') && view.model.hasField('phoneNumber'),
    },
];

/**
 * Returns the compose types available for the given view.
 *
 * @param {import('view').default} view
 * @returns {ComposeType[]}
 */
export const getAvailableComposeTypes = view =>
    COMPOSE_TYPES.filter(type => type.isAvailable(view));

/**
 * Opens the modal view of the given compose type for the view's record.
 *
 * @param {import('view').default} view
 * @param {ComposeType} type
 */
export const openComposeModal = (view, type) => {
    view.createView(type.name, type.modalView, {
        model: view.model,
        entityType: view.model.entityType,
        entityId: view.model.id,
        parentModel: view.model,
        parentType: view.model.entityType,
        parentId: view.model.id,
    }, modalView => {
        modalView.render();
        Espo.Ui.notify(false);
    });
};

/**
 * Defines the `action<Name>` method on the view (e.g. `actionComposePdf`),
 * following the EspoCRM action naming convention.
 *
 * @param {import('view').default} view
 * @param {ComposeType} type
 */
export const registerComposeAction = (view, type) => {
    const actionName = 'action' + type.name.charAt(0).toUpperCase() + type.name.slice(1);

    view[actionName] = () => openComposeModal(view, type);
};
