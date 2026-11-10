<?php

namespace Espo\Modules\ExtCompose\Classes\Sms;

use Brick\PhoneNumber\PhoneNumber;
use Brick\PhoneNumber\PhoneNumberParseException;
use Brick\PhoneNumber\PhoneNumberType;

/**
 * Checks whether a phone number can receive SMS messages.
 */
class MobileNumberChecker
{
    /** Region used to parse numbers written in a local format (e.g. 0470 12 34 56). */
    private const DEFAULT_REGION = 'BE';

    /**
     * @return bool `true` if the number is valid and is a mobile line.
     */
    public function isMobile(string $number): bool
    {
        try {
            $phoneNumber = PhoneNumber::parse($number, self::DEFAULT_REGION);
        } catch (PhoneNumberParseException) {
            return false;
        }

        if (!$phoneNumber->isValidNumber()) {
            return false;
        }

        $type = $phoneNumber->getNumberType();

        return $type === PhoneNumberType::MOBILE ||
            $type === PhoneNumberType::FIXED_LINE_OR_MOBILE;
    }
}