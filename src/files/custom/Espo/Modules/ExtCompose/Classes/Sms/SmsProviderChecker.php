<?php

namespace Espo\Modules\ExtCompose\Classes\Sms;

use Espo\Core\Utils\Config;
use Espo\Entities\Integration;
use Espo\ORM\EntityManager;

/**
 * Checks that an SMS provider is selected in the settings and that its integration is enabled.
 */
class SmsProviderChecker
{
    public function __construct(
        private Config $config,
        private EntityManager $entityManager,
    ) {}

    public function isEnabled(): bool
    {
        $provider = $this->config->get('smsProvider');

        if (!$provider) {
            return false;
        }

        $integration = $this->entityManager->getEntityById(Integration::ENTITY_TYPE, $provider);

        return $integration && $integration->get('enabled');
    }
}