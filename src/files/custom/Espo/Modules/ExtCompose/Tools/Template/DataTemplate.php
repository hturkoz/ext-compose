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

namespace Espo\Modules\ExtCompose\Tools\Template;  
  
use Espo\Tools\Pdf\Template;  
  
class DataTemplate implements Template  
{  
    private array $data;  
      
    public function __construct(array $data)  
    {  
        $this->data = $data;  
    }  
      
    public function getFontFace(): ?string  
    {  
        return $this->data['fontFace'] ?? null;  
    }  
      
    public function getBottomMargin(): float  
    {  
        return (float) ($this->data['bottomMargin'] ?? 0.0);  
    }  
      
    public function getTopMargin(): float  
    {  
        return (float) ($this->data['topMargin'] ?? 0.0);  
    }  
      
    public function getLeftMargin(): float  
    {  
        return (float) ($this->data['leftMargin'] ?? 0.0);  
    }  
      
    public function getRightMargin(): float  
    {  
        return (float) ($this->data['rightMargin'] ?? 0.0);  
    }  
      
    public function hasFooter(): bool  
    {  
        return !empty($this->data['footer']);  
    }  
      
    public function getFooter(): string  
    {  
        return $this->data['footer'] ?? '';  
    }  
      
    public function getFooterPosition(): float  
    {  
        return (float) ($this->data['footerPosition'] ?? 0.0);  
    }  
      
    public function hasHeader(): bool  
    {  
        return !empty($this->data['header']);  
    }  
      
    public function getHeader(): string  
    {  
        return $this->data['header'] ?? '';  
    }  
      
    public function getHeaderPosition(): float  
    {  
        return (float) ($this->data['headerPosition'] ?? 0.0);  
    }  
      
    public function getBody(): string  
    {  
        return $this->data['body'] ?? $this->data['templateBody'];  
    }

    public function getTemplateBody(): string  
    {  
        return $this->data['templateBody'] ?? $this->data['body'];  
    }  
      
    public function getPageOrientation(): string  
    {  
        return $this->data['pageOrientation'] ?? 'Portrait';  
    }  
      
    public function getPageFormat(): string  
    {  
        return $this->data['pageFormat'] ?? 'A4';  
    }  
      
    public function getPageWidth(): float  
    {  
        return (float) ($this->data['pageWidth'] ?? 0.0);  
    }  
      
    public function getPageHeight(): float  
    {  
        return (float) ($this->data['pageHeight'] ?? 0.0);  
    }  
      
    public function hasTitle(): bool  
    {  
        return isset($this->data['title']) && $this->data['title'] !== null;  
    }  
      
    public function getTitle(): string  
    {  
        return $this->data['title'] ?? '';  
    }  
    
    public function getFileName(): string  
    {  
        return $this->data['fileName'] ?? 'file.pdf';  
    } 

    public function getStyle(): ?string  
    {  
        return $this->data['style'] ?? null;  
    }  
}