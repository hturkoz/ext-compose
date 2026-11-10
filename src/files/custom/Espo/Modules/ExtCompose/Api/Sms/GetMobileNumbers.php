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
use Espo\Core\Exceptions\Forbidden;
use Espo\Core\Exceptions\NotFound;
use Espo\Modules\ExtCompose\Classes\Sms\MobileNumberChecker;
use Espo\ORM\EntityManager;

/**
 * Returns the mobile phone numbers of a record.
 */
class GetMobileNumbers implements Action
{
    public function __construct(
        private EntityManager $entityManager,
        private Acl $acl,
        private MobileNumberChecker $checker,
    ) {}

    public function process(Request $request): Response
    {
        $entityType = $request->getQueryParam('entityType');
        $entityId = $request->getQueryParam('entityId');

        if (!$entityType || !$entityId) {
            throw new BadRequest();
        }

        $entity = $this->entityManager->getEntityById($entityType, $entityId);

        if (!$entity) {
            throw new NotFound();
        }

        if (!$this->acl->checkEntityRead($entity)) {
            throw new Forbidden();
        }

        $list = [];

        foreach ($entity->get('phoneNumberData') ?? [] as $item) {
            if (!empty($item->invalid) || !$this->checker->isMobile($item->phoneNumber)) {
                continue;
            }

            $list[] = [
                'phoneNumber' => $item->phoneNumber,
                'type' => $item->type ?? null,
                'primary' => !empty($item->primary),
                'optOut' => !empty($item->optOut),
            ];
        }

        return ResponseComposer::json($list);
    }
}
