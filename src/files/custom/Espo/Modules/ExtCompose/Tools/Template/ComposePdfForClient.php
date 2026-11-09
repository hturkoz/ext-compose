<?php  
  
namespace Espo\Modules\ExtCompose\Tools\Template;  
  
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

class ComposePdfForClient  
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