<#import "template.ftl" as layout>
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

    .reset-password-page-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 380px;
    }

    .reset-password-card {
        background-color: var(--card-bg-color);
        padding: 2.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 15px var(--shadow-color);
        width: 100%;
        box-sizing: border-box;
        margin-bottom: 1.5rem;
    }

    .reset-password-title {
        text-align: center;
        font-size: 1.75rem;
        font-weight: 500;
        margin-bottom: 2rem;
        color: var(--text-color);
    }
    
    .info-message {
        text-align: center;
        font-size: 1rem;
        color: var(--label-color);
        margin-bottom: 1.5rem;
        line-height: 1.5;
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

    .submit-button {
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

    .submit-button:hover {
        background-color: var(--accent-color-hover);
        transform: translateY(-1px);
    }

    .submit-button:active {
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

<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('username'); section>
    <#if section = "form">
        <div class="reset-password-page-container">
            <div class="reset-password-card">
                <h1 class="reset-password-title">${msg("emailForgotTitle")}</h1>
                <p class="info-message">
                    <#if realm.duplicateEmailsAllowed>
                        ${msg("emailInstructionUsername")}
                    <#else>
                        ${msg("emailInstruction")}
                    </#if>
                </p>
                <form id="kc-reset-password-form" action="${url.loginAction}" method="post">
                    <div class="form-group">
                        <label for="username" class="form-label">
                            <#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>
                        </label>
                        <input type="text" id="username" name="username" class="form-input" autofocus value="${(auth.attemptedUsername!'')}" aria-invalid="<#if messagesPerField.existsError('username')>true</#if>" dir="ltr"/>
                        <#if messagesPerField.existsError('username')>
                            <span id="input-error-username" class="error-message" aria-live="polite">
                                ${kcSanitize(messagesPerField.get('username'))?no_esc}
                            </span>
                        </#if>
                    </div>
                    
                    <div class="form-buttons">
                        <input class="submit-button" type="submit" value="${msg("doSubmit")}"/>
                    </div>
                </form>
            </div>
            <div class="back-to-login">
                <span><a href="${url.loginUrl}">${kcSanitize(msg("backToLogin"))?no_esc}</a></span>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>