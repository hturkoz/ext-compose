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

/** @module ext-compose:handlers/record/detail/compose-template-handler */

export default class ComposeTemplateHandler {

    constructor(view) {
        this.view = view;
    }

    /** @param {RecordDetailView} [view] */
    process(view = this.view) {

        view.once('after:render', () => {

            const list = view.getHelper().getAppParam('templateEntityTypeList') || [];

            if (
                view.type !== view.TYPE_DETAIL ||
                !list.includes(view.entityType) ||
                view.dropdownItemList.some(item => item.name === 'composeTemplate')
            ) {
                return;
            }

            view.addDropdownItem({
                name: 'composeTemplate',
                label: view.translate('composePdf', 'labels'),
                groupIndex: 6,
                iconClass: 'fas fa-file-alt',
            });

            view.render();
        });

        view.actionComposeTemplate = () => {

            view.createView(
                'composeTemplate',
                'ext-compose:views/modals/compose-template-edit',
                {
                    model: view.model,
                    entityType: view.entityType,
                    entityId: view.model.id,
                    parentModel: view.model,
                    parentType: view.entityType,
                    parentId: view.model.id,
                },
                modalView => {
                    modalView.render();
                    Espo.Ui.notify(false);
                }
            );
        };
    }
}
