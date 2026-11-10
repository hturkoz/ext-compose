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

/** @module ext-compose:handlers/record/detail/compose-handler */

import {
    COMPOSE_TYPES,
    getAvailableComposeTypes,
    registerComposeAction,
} from 'ext-compose:compose-types';

/**
 * Adds compose actions (PDF, SMS, ...) to the record detail view dropdown.
 */
export default class ComposeHandler {

    /**
     * @param {RecordDetailView} view The record detail view.
     */
    constructor(view) {
        this.view = view;
    }

    /**
     * Registers the actions and, after the first render, adds the available
     * dropdown items. The view is re-rendered only once, and only if
     * at least one item was added.
     *
     * @param {RecordDetailView} [view] Defaults to the view passed to the constructor.
     */
    process(view = this.view) {
        COMPOSE_TYPES.forEach(type => registerComposeAction(view, type));

        view.once('after:render', () => {
            if (view.type !== view.TYPE_DETAIL) {
                return;
            }

            const added = getAvailableComposeTypes(view)
                .filter(type => !view.dropdownItemList.some(item => item.name === type.name))
                .map(type => {
                    view.addDropdownItem({
                        name: type.name,
                        label: view.translate(type.name, 'labels'),
                        groupIndex: type.groupIndex,
                        iconClass: type.iconClass,
                    });

                    return type;
                });

            if (added.length) {
                view.render();
            }
        });
    }
}
