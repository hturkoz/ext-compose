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

/** @module ext-compose:views/modals/compose-sms-edit */

import ModalView from 'views/modal';

/**
 * Modal used to compose and send an SMS from a record detail view.
 */
export default class ComposeSmsEditModalView extends ModalView {

    template = 'ext-compose:modals/compose-sms-edit'

    className = 'dialog dialog-record'

    /** Maximum number of characters of a single SMS. */
    maxLength = 160

    events = {
        /** @this ComposeSmsEditModalView */
        'input textarea[name="message"]': function () {
            this.updateCharacterCount();
        },
    }

    setup() {
        /**
         * Options passed by the compose handler.
         *
         * @type {{
         *   model: import('model').default,
         *   entityType: string,
         *   entityId: string,
         * } & Record<string, *>}
         */
        const options = this.options;

        this.model = options.model;
        this.entityType = options.entityType;
        this.entityId = options.entityId;

        this.headerText = this.translate('composeSms', 'labels');

        this.buttonList = [
            {
                name: 'send',
                label: 'Send',
                style: 'primary',
                onClick: () => this.actionSend(),
            },
            {
                name: 'cancel',
                label: 'Cancel',
            },
        ];
    }

    /**
     * Template data.
     *
     * @return {Record<string, *>}
     */
    data() {
        return {
            maxLength: this.maxLength,
            phoneNumbers: this.getPhoneNumbers(),
        };
    }

    /**
     * Whether a phone number can receive SMS messages (i.e. is a mobile number).
     *
     * EspoCRM does not validate the line type: the type is only a label chosen by the user.
     * So the check combines the type label and, for Belgian numbers, the number format.
     *
     * - A type other than `Mobile` (Office, Home, Fax, Other) is rejected.
     * - Belgian numbers must match a mobile format: `+32 4XX XX XX XX` (9 digits after `+32`).
     *   Landlines in Liège also start with 4 but have only 8 digits, so they are rejected.
     * - Foreign numbers are accepted as long as the type is not a non-mobile one.
     *
     * @param {{phoneNumber: string, type?: string|null}} item
     * @return {boolean}
     */
    isMobile(item) {
        if (item.type && item.type !== 'Mobile') {
            return false;
        }

        let number = (item.phoneNumber || '').replace(/[\s.\-()/]/g, '');

        if (number.startsWith('00')) {
            number = '+' + number.substring(2);
        }

        // Local Belgian format: 04XX XX XX XX.
        if (/^0[1-9]/.test(number)) {
            return /^04\d{8}$/.test(number);
        }

        // International Belgian format: +32 4XX XX XX XX.
        if (number.startsWith('+32')) {
            return /^\+324\d{8}$/.test(number);
        }

        return number.length > 0;
    }

    /**
     * Returns the mobile phone numbers of the record, with a translated type label.
     *
     * @return {{
     *   phoneNumber: string,
     *   primary: boolean,
     *   optOut: boolean,
     *   typeLabel: string|null,
     * }[]}
     */
    getPhoneNumbers() {
        /** @type {Record<string, *>[]} */
        const data = this.model.get('phoneNumberData') || [];

        return data
            .filter(item => !item.invalid && this.isMobile(item))
            .map(item => ({
                phoneNumber: item.phoneNumber,
                primary: !!item.primary,
                optOut: !!item.optOut,
                typeLabel: item.type ?
                    this.getLanguage().translateOption(item.type, 'phoneNumber', this.entityType) :
                    null,
            }));
    }

    afterRender() {
        this.updateCharacterCount();
    }

    /**
     * Updates the character counter below the textarea.
     */
    updateCharacterCount() {
        const length = (this.$el.find('textarea[name="message"]').val() || '').length;

        this.$el.find('.character-count').text(length);
    }

    /**
     * Reads and validates the form.
     *
     * @return {{phoneNumber: string, message: string}|null} `null` if invalid.
     */
    getFormData() {
        const phoneNumber = (this.$el.find('[name="phoneNumber"]').val() || '').trim();
        const message = (this.$el.find('textarea[name="message"]').val() || '').trim();

        if (!phoneNumber) {
            Espo.Ui.warning(this.translate('composeSmsPhoneNumberRequired', 'messages'));

            return null;
        }

        if (!this.isMobile({phoneNumber})) {
            Espo.Ui.warning(this.translate('composeSmsMobileOnly', 'messages'));

            return null;
        }

        if (!message) {
            Espo.Ui.warning(this.translate('composeSmsMessageRequired', 'messages'));

            return null;
        }

        return {phoneNumber, message};
    }

    /**
     * Sends the SMS.
     */
    async actionSend() {
        const data = this.getFormData();

        if (!data) {
            return;
        }

        this.disableButton('send');
        Espo.Ui.notify(this.translate('pleaseWait', 'messages'));

        try {
            // TODO: adapt to your backend endpoint.
            await Espo.Ajax.postRequest('Sms/ComposeSms/send', {
                entityType: this.entityType,
                entityId: this.entityId,
                phoneNumber: data.phoneNumber,
                message: data.message,
            });
        } catch (e) {
            this.enableButton('send');

            return;
        }

        Espo.Ui.success(this.translate('composeSmsSent', 'messages'));
        this.close();
    }
}
