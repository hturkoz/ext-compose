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

namespace Espo\Modules\ExtCompose\Tools\Pdf;  
  
use Espo\Core\Acl;  
use Espo\Core\Exceptions\ForbiddenSilent;  
use Espo\Core\Exceptions\NotFound;  
use Espo\Entities\User;  
use Espo\Core\Utils\Log;  
use Espo\ORM\EntityManager;  
use Espo\Tools\EmailTemplate\Data;  
use Espo\Tools\EmailTemplate\Params;  
use Espo\Tools\EmailTemplate\Processor;
use Espo\Core\Utils\Language; 
use Espo\ORM\Query\Part\Condition as Cond;

use stdClass;

class ComposePdf 
{  
    public function __construct(  
        private Processor $processor,  
        private User $user,  
        private Acl $acl,  
        private EntityManager $entityManager,
        private Language $language,
        private Log $log,
    ) {}  
  
    /**  
     * Prepare template with processed placeholders.  
     *  
     * @throws NotFound  
     * @throws ForbiddenSilent  
     */  

     public function prepareTemplate(string $templateId, ?string $parentType, ?string $parentId): array  
    {  

        $template = $this->entityManager->getEntityById('Template', $templateId);  
  
        if (!$template) {  
            throw new NotFound();  
        }  
  
        if (!$this->acl->checkEntityRead($template)) {  
            throw new ForbiddenSilent();  
        }  
  
        $data = Data::create()  
            ->withParentType($parentType)  
            ->withParentId($parentId)  
            ->withUser($this->user);  
  
        $params = Params::create()  
            ->withApplyAcl(true)  
            ->withCopyAttachments(false); 
  
        // Process body  
        $body = $template->get('body') ?? '';  
        $processedBody = $this->processField($body, $params, $data);// $customData);  
  
        // Process header if it exists  
        $header = $template->get('header') ?? '';  
        $processedHeader = $this->processField($header, $params, $data);//, $customData);  
  
        // Process footer if it exists  
        $footer = $template->get('footer') ?? '';  
        $processedFooter = $this->processField($footer, $params, $data);//, $customData);  
  
        // Return all processed fields along with other Template metadata  
        return [  
            'body' => $processedBody,  
            'header' => $processedHeader,  
            'footer' => $processedFooter,  
            'style' => $template->get('style'),  
            'printHeader' => $template->get('printHeader'),  
            'printFooter' => $template->get('printFooter'),  
            'headerPosition' => $template->get('headerPosition'),  
            'footerPosition' => $template->get('footerPosition'),  
            'topMargin' => $template->get('topMargin'),  
            'bottomMargin' => $template->get('bottomMargin'),  
            'leftMargin' => $template->get('leftMargin'),  
            'rightMargin' => $template->get('rightMargin'),  
            'pageOrientation' => $template->get('pageOrientation'),  
            'pageFormat' => $template->get('pageFormat'),  
            'pageWidth' => $template->get('pageWidth'),  
            'pageHeight' => $template->get('pageHeight'),  
            'fontFace' => $template->get('fontFace'),  
            'title' => $template->get('title'), 
            'fileName' => $template->get('fileName'),  
            'isHtml' => true,  
        ];  
    }

    private function processField(string $content, Params $params, Data $data): string    
    {    
        if (empty($content)) {    
            return '';    
        }  
      
        $emailTemplate = $this->entityManager    
            ->getRDBRepositoryByClass(\Espo\Entities\EmailTemplate::class)    
            ->getNew();    
            
        $emailTemplate->set('body', $content);    
        $emailTemplate->set('subject', '');    
        $emailTemplate->set('isHtml', true);    
      
        $result = $this->processor->process($emailTemplate, $params, $data);
        
        return $result->getBody();    
    }
}
