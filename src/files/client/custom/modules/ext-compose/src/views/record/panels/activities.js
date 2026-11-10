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

/** @module ext-compose:views/record/panels/activities */

import ActivitiesPanel from 'crm:views/record/panels/activities';
import {getAvailableComposeTypes, registerComposeAction} from 'ext-compose:compose-types';

/**
 * Activities panel with compose actions (PDF, SMS, ...), as header buttons and
 * as dropdown items. Uses the same types and availability rules as the detail view.
 */
export default class ExtComposeActivitiesPanelView extends ActivitiesPanel {

    setup() {
        super.setup();

        this.buttonList = this.buttonList || [];
        this.actionList = this.actionList || [];

        getAvailableComposeTypes(this).forEach(type => {
            registerComposeAction(this, type);

            const text = this.translate(type.name, 'labels');

            if (!this.buttonList.some(item => item.action === type.name)) {
                this.buttonList.push({
                    action: type.name,
                    title: text,
                    html: `<span class="${type.iconClass}"></span>`,
                    acl: 'read',
                    aclScope: this.model.entityType,
                });
            }

            if (!this.actionList.some(item => item.action === type.name)) {
                this.actionList.unshift({
                    action: type.name,
                    text: text,
                    iconHtml: `<span class="${type.iconClass}"></span>`,
                    acl: 'read',
                    aclScope: this.model.entityType,
                });
            }
        });
    }
}
