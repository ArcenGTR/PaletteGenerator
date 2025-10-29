<#import "template.ftl" as layout>
<#import "user-profile-commons.ftl" as userProfileCommons>
<#import "register-commons.ftl" as registerCommons>

<style>
    :root {
        --bg-color: #f5f5f5;
        --card-bg-color: #ffffff;
        --border-color: #e0e0e0;
        --text-color: #333333;
        --label-color: #616161;
        --input-bg-color: #fafafa;
        --accent-color: #007bff;
        --accent-color-hover: #0056b3;
        --error-color: #e53935;
        --shadow-color: rgba(0, 0, 0, 0.1);
    }
    
    a {
        text-decoration: none;
        color: inherit;
    }

    .divider {
        border: 0;
        height: 1px;
        background: var(--border-color);
        margin: 2rem 0;
    }

    .social-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        text-decoration: none;
        color: #fff;
        font-size: 0.9rem;
        font-weight: 500;
        transition: transform 0.2s;
        background-color: #757575;
    }
    
    .social-button:hover {
        transform: translateY(-2px);
    }

    .social-login-container {
        width: 100%;
        max-width: 380px;
    }
    
    .social-login-title {
        font-size: 1rem;
        text-align: center;
        color: var(--label-color);
        margin-bottom: 1rem;
    }
    
    .social-list {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        padding: 0;
        margin: 0;
        list-style: none;
        gap: 1rem;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        background-color: var(--bg-color);
        color: var(--text-color);
        margin: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    .app-header {
        border-bottom: 1px solid #e0e0e0;
        padding: 1rem;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100vw;
        box-sizing: border-box;
        position: absolute;
        top: 0;
        background-color: var(--card-bg-color);
        box-shadow: 0 2px 4px var(--shadow-color);
    }

    .app-logo {
        font-size: 1.875rem;
        font-weight: 700;
        color: var(--text-color);
        transition: all 0.3s ease-in-out;
        cursor: pointer;
        text-decoration: none;
    }

    .app-logo:hover {
        transform: scale(1.01);
    }

    .registration-page-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 380px;
    }

    .registration-card {
        background-color: var(--card-bg-color);
        padding: 2.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 15px var(--shadow-color);
        width: 100%;
        box-sizing: border-box;
        margin-bottom: 1.5rem;
    }

    .registration-title {
        text-align: center;
        font-size: 1.75rem;
        font-weight: 500;
        margin-bottom: 2rem;
        color: var(--text-color);
    }

    .form-group {
        margin-bottom: 1.25rem;
    }

    .form-label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--label-color);
    }

    .form-input {
        width: 100%;
        padding: 0.75rem 1rem;
        background-color: var(--input-bg-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-color);
        font-size: 1rem;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .form-input:focus {
        border-color: var(--accent-color);
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
    }

    .error-message {
        color: var(--error-color);
        font-size: 0.8rem;
        margin-top: 0.5rem;
        display: block;
    }

    .form-buttons {
        margin-top: 2rem;
    }

    .registration-button {
        width: 100%;
        padding: 0.75rem 1rem;
        background-color: var(--accent-color);
        color: #fff;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.1s;
    }

    .registration-button:hover {
        background-color: var(--accent-color-hover);
        transform: translateY(-1px);
    }

    .registration-button:active {
        transform: translateY(0);
    }
    
    .back-to-login {
        display: block;
        text-align: center;
        margin-top: 1rem;
        font-size: 0.9rem;
        color: var(--label-color);
    }

    .back-to-login a {
        color: var(--accent-color);
        text-decoration: none;
        transition: color 0.2s;
    }

    .back-to-login a:hover {
        color: var(--accent-color-hover);
    }

    .input-group {
        position: relative;
    }

    .password-toggle {
        background: transparent;
        border: none;
        color: var(--text-color);
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
    }

    .g-recaptcha {
        margin-top: 1.5rem;
        display: flex;
        justify-content: center;
    }
</style>

<div class="app-header">
    <div class="app-logo">
        <a href="${url.loginUrl}">PaletteGen</a>
    </div>
</div>

<@layout.registrationLayout displayMessage=messagesPerField.exists('global') displayRequiredFields=true; section>
    <#if section = "form">
        <div class="registration-page-container">
            <div class="registration-card">
                <h1 class="registration-title">
                    <#if messageHeader??>
                        ${kcSanitize(msg("${messageHeader}"))?no_esc}
                    <#else>
                        ${msg("registerTitle")}
                    </#if>
                </h1>
                
                <form id="kc-register-form" action="${url.registrationAction}" method="post">
                    <@userProfileCommons.userProfileFormFields; callback, attribute>
                        <#if callback = "beforeField">
                            <div class="form-group">
                                <label for="${attribute.name}" class="form-label">
                                    ${kcSanitize(attribute.displayName)?no_esc}
                                    <#if attribute.required> *</#if>
                                </label>
                        </#if>

                        <#if callback = "onField">
                            <input type="${(attribute.name == 'email')?then('email', 'text')}"
                                id="${attribute.name}"
                                class="form-input"
                                name="${attribute.name}"
                                value="${(attribute.value!'')}"
                                <#if attribute.autocomplete??>autocomplete="${attribute.autocomplete}"</#if>
                                <#if messagesPerField.existsError(attribute.name)>
                                    aria-invalid="true"
                                <#else>
                                    aria-invalid="false"
                                </#if>
                                <#if attribute.readOnly> readonly </#if>
                                <#if attribute.placeholder??>placeholder="${kcSanitize(attribute.placeholder)?no_esc}"</#if>
                            />
                            <#if messagesPerField.existsError(attribute.name)>
                                <span id="input-error-${attribute.name}" class="error-message" aria-live="polite">
                                    ${kcSanitize(messagesPerField.get(attribute.name))?no_esc}
                                </span>
                            </#if>
                        </#if>

                        <#if callback = "afterField">
                            </div>
                            <#if passwordRequired?? && (attribute.name == 'username' || (attribute.name == 'email' && realm.registrationEmailAsUsername))>
                                <div class="form-group">
                                    <label for="password" class="form-label">${msg("password")} *</label>
                                    <div class="input-group" dir="ltr">
                                        <input type="password" id="password" class="form-input" name="password" autocomplete="new-password"
                                               aria-invalid="<#if messagesPerField.existsError('password','password-confirm')>true</#if>"
                                        />
                                        <button class="password-toggle" type="button" aria-label="${msg('showPassword')}"
                                                aria-controls="password" data-password-toggle
                                                data-icon-show="${properties.kcFormPasswordVisibilityIconShow!}" data-icon-hide="${properties.kcFormPasswordVisibilityIconHide!}"
                                                data-label-show="${msg('showPassword')}" data-label-hide="${msg('hidePassword')}">
                                            <i class="${properties.kcFormPasswordVisibilityIconShow!}" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                    <#if messagesPerField.existsError('password')>
                                        <span id="input-error-password" class="error-message" aria-live="polite">
                                            ${kcSanitize(messagesPerField.get('password'))?no_esc}
                                        </span>
                                    </#if>
                                </div>
                                <div class="form-group">
                                    <label for="password-confirm" class="form-label">${msg("passwordConfirm")} *</label>
                                    <div class="input-group" dir="ltr">
                                        <input type="password" id="password-confirm" class="form-input" name="password-confirm" autocomplete="new-password"
                                               aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>"
                                        />
                                        <button class="password-toggle" type="button" aria-label="${msg('showPassword')}"
                                                aria-controls="password-confirm" data-password-toggle
                                                data-icon-show="${properties.kcFormPasswordVisibilityIconShow!}" data-icon-hide="${properties.kcFormPasswordVisibilityIconHide!}"
                                                data-label-show="${msg('showPassword')}" data-label-hide="${msg('hidePassword')}">
                                            <i class="${properties.kcFormPasswordVisibilityIconShow!}" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                    <#if messagesPerField.existsError('password-confirm')>
                                        <span id="input-error-password-confirm" class="error-message" aria-live="polite">
                                            ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                                        </span>
                                    </#if>
                                </div>
                            </#if>
                        </#if>
                    </@userProfileCommons.userProfileFormFields>

                    <@registerCommons.termsAcceptance/>

                    <#if recaptchaRequired?? && (recaptchaVisible!false)>
                        <div class="form-group g-recaptcha">
                            <div class="${properties.kcInputWrapperClass!}">
                                <div class="g-recaptcha" data-size="compact" data-sitekey="${recaptchaSiteKey}" data-action="${recaptchaAction}"></div>
                            </div>
                        </div>
                    </#if>

                    <div class="form-buttons">
                        <#if recaptchaRequired?? && !(recaptchaVisible!false)>
                            <script>
                                function onSubmitRecaptcha(token) {
                                    document.getElementById("kc-register-form").requestSubmit();
                                }
                            </script>
                            <button class="registration-button g-recaptcha"
                                    data-sitekey="${recaptchaSiteKey}" data-callback='onSubmitRecaptcha' data-action='${recaptchaAction}' type="submit">
                                ${msg("doRegister")}
                            </button>
                        <#else>
                            <input class="registration-button" type="submit" value="${msg("doRegister")}"/>
                        </#if>
                    </div>
                </form>
            </div>
            
            <div class="back-to-login">
                <span><a href="${url.loginUrl}">${kcSanitize(msg("backToLogin"))?no_esc}</a></span>
            </div>
        </div>
    <#elseif section = "socialProviders" >
        <#if social?? && social.providers?has_content>
            <div class="social-login-container">
                <hr class="divider"/>
                <h2 class="social-login-title">${msg("identity-provider-login-label")}</h2>
                <ul class="social-list">
                    <#list social.providers as p>
                        <li>
                            <a data-once-link id="social-${p.alias}"
                                class="social-button" type="button" href="${p.loginUrl}">
                                <#if p.iconClasses?has_content>
                                    <i class="${properties.kcCommonLogoIdP!} ${p.iconClasses!}" aria-hidden="true"></i>
                                    <span class="social-button-text">${p.displayName!}</span>
                                <#else>
                                    <span class="social-button-text">${p.displayName!}</span>
                                </#if>
                            </a>
                        </li>
                    </#list>
                </ul>
            </div>
        </#if>
    </#if>
</@layout.registrationLayout>