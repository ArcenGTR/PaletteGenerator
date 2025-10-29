<#import "template.ftl" as layout>
<#import "passkeys.ftl" as passkeys>
<#import "vars.ftl" as vars>

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

    #kc-header-wrapper {
        display: none !important;
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

    .login-page-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 380px;
    }
    
    .login-card {
        background-color: var(--card-bg-color);
        padding: 2.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 15px var(--shadow-color);
        width: 100%;
        box-sizing: border-box;
        margin-bottom: 1.5rem;
    }
    
    .login-title {
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
    
    .form-input[aria-invalid="true"] {
        border-color: var(--error-color);
    }
    
    .error-message {
        color: var(--error-color);
        font-size: 0.8rem;
        margin-top: 0.5rem;
        display: block;
    }
    
    .form-options-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }
    
    .remember-label {
        font-size: 0.9rem;
        color: var(--label-color);
    }
    
    .forgot-password {
        font-size: 0.9rem;
        color: var(--accent-color);
        text-decoration: none;
        transition: color 0.2s;
    }
    
    .forgot-password:hover {
        color: var(--accent-color-hover);
    }
    
    .login-button {
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
    
    .login-button:hover {
        background-color: var(--accent-color-hover);
        transform: translateY(-1px);
    }
    
    .login-button:active {
        transform: translateY(0);
    }
    
    .registration-link-container {
        text-align: center;
        font-size: 0.9rem;
        color: var(--label-color);
    }
    
    .registration-link {
        color: var(--accent-color);
        text-decoration: none;
        transition: color 0.2s;
    }
    
    .registration-link:hover {
        color: var(--accent-color-hover);
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
    
    .divider {
        border: 0;
        height: 1px;
        background: var(--border-color);
        margin: 2rem 0;
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

    a {
        text-decoration: none;
        color: inherit;
    }
</style>

<div class="app-header">
    <div class="app-logo">
        <a href="${vars.frontendUrl}">PaletteGen</a>
    </div>
</div>

<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "form">
        <div class="login-page-container">
            <div class="login-card">
                <h1 class="login-title">${msg("loginAccountTitle")}</h1>
                <#if realm.password>
                    <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                        <#if !usernameHidden??>
                            <div class="form-group">
                                <label for="username" class="form-label"><#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if></label>
                                <input tabindex="2" id="username" class="form-input" name="username" value="${(login.username!'')}" type="text"
                                    autofocus autocomplete="${(enableWebAuthnConditionalUI?has_content)?then('username webauthn', 'username')}"
                                    aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                                    dir="ltr"
                                />
                                <#if messagesPerField.existsError('username','password')>
                                    <span id="input-error" class="error-message" aria-live="polite">
                                        ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                                    </span>
                                </#if>
                            </div>
                        </#if>
                        <div class="form-group">
                            <label for="password" class="form-label">${msg("password")}</label>
                            <div class="input-group">
                                <input tabindex="3" id="password" class="form-input" name="password" type="password" autocomplete="current-password"
                                    aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                                />
                                <button class="password-toggle" type="button" aria-label="${msg("showPassword")}"
                                        aria-controls="password" data-password-toggle tabindex="4"
                                        data-icon-show="${properties.kcFormPasswordVisibilityIconShow!}" data-icon-hide="${properties.kcFormPasswordVisibilityIconHide!}"
                                        data-label-show="${msg('showPassword')}" data-label-hide="${msg('hidePassword')}">
                                    <i class="${properties.kcFormPasswordVisibilityIconShow!}" aria-hidden="true"></i>
                                </button>
                            </div>
                            <#if usernameHidden?? && messagesPerField.existsError('username','password')>
                                <span id="input-error" class="error-message" aria-live="polite">
                                    ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                                </span>
                            </#if>
                        </div>
                        <div class="form-options-wrapper">
                            <div class="remember-me">
                                <#if realm.rememberMe && !usernameHidden??>
                                    <label class="remember-label">
                                        <#if login.rememberMe??>
                                            <input tabindex="5" id="rememberMe" name="rememberMe" type="checkbox" checked> ${msg("rememberMe")}
                                        <#else>
                                            <input tabindex="5" id="rememberMe" name="rememberMe" type="checkbox"> ${msg("rememberMe")}
                                        </#if>
                                    </label>
                                </#if>
                            </div>
                            <#if realm.resetPasswordAllowed>
                                <a tabindex="6" href="${url.loginResetCredentialsUrl}" class="forgot-password">${msg("doForgotPassword")}</a>
                            </#if>
                        </div>
                        <div class="form-buttons">
                            <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                            <input tabindex="7" class="login-button" name="login" id="kc-login" type="submit" value="${msg("doLogIn")}"/>
                        </div>
                    </form>
                </#if>
                <@passkeys.conditionalUIData />
                <script type="module" src="${url.resourcesPath}/js/passwordVisibility.js"></script>
            </div>
            <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
                <div class="registration-link-container">
                    <span>${msg("noAccount")} <a tabindex="8" href="${url.registrationUrl}" class="registration-link">${msg("doRegister")}</a></span>
                </div>
            </#if>
        </div>
    
    <#elseif section = "socialProviders" >
        <#if realm.password && social?? && social.providers?has_content>
            <div class="social-login-container">
                <hr class="divider"/>
                <h2 class="social-login-title">${msg("identity-provider-login-label")}</h2>
                <ul class="social-list">
                    <#list social.providers as p>
                        <li>
                            <a data-once-link data-disabled-class="${properties.kcFormSocialAccountListButtonDisabledClass!}" id="social-${p.alias}"
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