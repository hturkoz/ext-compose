<div class="panel no-side-margin">
    <div class="panel-body">
        <div class="row">
            <div class="col-sm-12">
                <div class="field form-group" data-name="phoneNumber">
                    <label class="control-label">
                        {{translate 'composeSmsPhoneNumber' category='labels' scope='Global'}}
                        <span class="required-sign">*</span>
                    </label>
                    {{#if phoneNumbers.length}}
                        <select class="form-control" name="phoneNumber">
                            {{#each phoneNumbers}}
                                <option value="{{phoneNumber}}"{{#if primary}} selected{{/if}}>
                                    {{phoneNumber}}
                                    {{#if typeLabel}} ({{typeLabel}}){{/if}}
                                    {{#if primary}} - {{translate 'Primary' category='labels' scope='Global'}}{{/if}}
                                    {{#if optOut}} - {{translate 'Opted Out' category='labels' scope='Global'}}{{/if}}
                                </option>
                            {{/each}}
                        </select>
                    {{else}}
                        <input
                            type="tel"
                            class="form-control"
                            name="phoneNumber"
                            placeholder="{{translate 'composeSmsEnterPhoneNumber' category='labels' scope='Global'}}"
                            autocomplete="tel"
                        >
                    {{/if}}
                </div>

                <div class="field form-group" data-name="message">
                    <label class="control-label">
                        {{translate 'composeSmsMessage' category='labels' scope='Global'}}
                        <span class="required-sign">*</span>
                    </label>
                    <textarea
                        class="form-control"
                        name="message"
                        rows="4"
                        maxlength="{{maxLength}}"
                        placeholder="{{translate 'composeSmsEnterMessage' category='labels' scope='Global'}}"
                    ></textarea>
                    <div class="help-block">
                        <span class="character-count">0</span>/{{maxLength}}
                        {{translate 'composeSmsCharacters' category='labels' scope='Global'}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
