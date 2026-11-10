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

namespace Espo\Modules\ExtCompose\Api\Template;  
  
use Espo\Core\Api\Action;  
use Espo\Core\Api\Request;  
use Espo\Core\Api\Response;  
use Espo\Core\Api\ResponseComposer;
use Espo\Core\ORM\EntityManager;  
use Espo\Tools\Pdf\Builder;  
use Espo\Tools\Pdf\Data\DataLoaderManager;  
use Espo\Tools\Pdf\Params;   
use Espo\Core\Utils\Log; 
use Espo\Core\Utils\Json;

use Espo\Modules\ExtCompose\Tools\Template\DataTemplate;

class ComposePdfFactory implements Action  
{  
    public function __construct(  
        private EntityManager $entityManager,  
        private Builder $builder,  
        private DataLoaderManager $dataLoaderManager,
        private Log $log, 

    ) {}  
      
    public function process(Request $request): Response  
    {  
        $data = $request->getParsedBody();  
          
        $entityType = $data->entityType ?? null;  
        $entityId = $data->entityId ?? null;  
        
        $templateData = $data->templateData ?? null;  
        
        if (is_string($templateData)) {  
            $templateDataArray = Json::decode($templateData, true);  
        } else {   
            $templateDataArray = json_decode(Json::encode($templateData), true);  
        } 

        $entity = $this->entityManager->getEntityById($entityType, $entityId);  
          
        if (!$entity) {  
            throw new NotFound("Entity not found");  
        }  

        $entity = $this->entityManager->getEntityById($entityType, $entityId);  
        $template = new DataTemplate($templateDataArray);  
          
        $params = Params::create()->withAcl(true);  
        $pdfData = $this->dataLoaderManager->load($entity, $params);

        $printer = $this->builder  
            ->setTemplate($template)  
            ->setEngine('Dompdf')  
            ->build();  
              
        $contents = $printer->printEntity($entity, $params, $pdfData);  
          
        $stream = $contents->getStream();  
        $pdfContent = $stream->getContents();  
        $base64Pdf = base64_encode($pdfContent);  

        return ResponseComposer::json([  
            'pdf' => $base64Pdf  
        ]);       
    }  
}
