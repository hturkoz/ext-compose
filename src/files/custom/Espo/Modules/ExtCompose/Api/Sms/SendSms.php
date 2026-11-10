<?php
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

namespace Espo\Modules\ExtCompose\Api\Sms;

use Espo\Core\Acl;
use Espo\Core\Api\Action;
use Espo\Core\Api\Request;
use Espo\Core\Api\Response;
use Espo\Core\Api\ResponseComposer;
use Espo\Core\Exceptions\BadRequest;
use Espo\Core\Exceptions\Error;
use Espo\Core\Exceptions\Forbidden;
use Espo\Core\Exceptions\NotFound;
use Espo\Core\Sms\SmsFactory;
use Espo\Core\Sms\SmsSender;
use Espo\Core\Utils\Config;
use Espo\Core\Utils\Log;
use Espo\Modules\ExtCompose\Classes\Sms\MobileNumberChecker;
use Espo\Modules\ExtCompose\Classes\Sms\SmsProviderChecker;
use Espo\ORM\EntityManager;

/**
 * Sends an SMS to a mobile number, on behalf of a record.
 */
class SendSms implements Action
{
    private const MAX_LENGTH = 160;

    public function __construct(
        private EntityManager $entityManager,
        private Acl $acl,
        private Config $config,
        private Log $log,
        private MobileNumberChecker $mobileChecker,
        private SmsProviderChecker $providerChecker,
        private SmsFactory $smsFactory,
        private SmsSender $smsSender,
    ) {}

    public function process(Request $request): Response
    {
        $data = $request->getParsedBody();

        $entityType = $data->entityType ?? null;
        $entityId = $data->entityId ?? null;
        $phoneNumber = trim($data->phoneNumber ?? '');
        $message = trim($data->message ?? '');

        if (!$entityType || !$entityId || !$phoneNumber || !$message) {
            throw new BadRequest();
        }

        if (mb_strlen($message) > self::MAX_LENGTH) {
            throw new BadRequest('Message too long.');
        }

        if (!$this->providerChecker->isEnabled()) {
            throw new BadRequest('The SMS provider is not enabled.');
        }

        if (!$this->mobileChecker->isMobile($phoneNumber)) {
            throw new BadRequest('Only mobile numbers can receive SMS messages.');
        }

        $entity = $this->entityManager->getEntityById($entityType, $entityId);

        if (!$entity) {
            throw new NotFound();
        }

        if (!$this->acl->checkEntityRead($entity)) {
            throw new Forbidden();
        }

        $fromNumber = $this->config->get('outboundSmsFromNumber');

        if (!$fromNumber) {
            throw new BadRequest('No SMS sender number configured.');
        }

        $sms = $this->smsFactory->create();

        $sms->setFromNumber($fromNumber);
        $sms->addToNumber($phoneNumber);
        $sms->setBody($message);

        try {
            $this->smsSender->send($sms);
        } catch (\Throwable $e) {
            $this->log->error("ComposeSms: sending failed: {$e->getMessage()}", ['exception' => $e]);

            throw new Error('The SMS could not be sent.');
        }

        return ResponseComposer::json(true);
    }
}
