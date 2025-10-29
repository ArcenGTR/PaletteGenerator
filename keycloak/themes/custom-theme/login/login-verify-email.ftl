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

    .alert-warning.pf-m-warning {
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

    .email-verify-page-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 380px;
    }

    .email-verify-card {
        background-color: var(--card-bg-color);
        padding: 2.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 15px var(--shadow-color);
        width: 100%;
        box-sizing: border-box;
        margin-bottom: 1.5rem;
        text-align: center;
    }

    .email-verify-title {
        font-size: 1.75rem;
        font-weight: 500;
        margin-bottom: 2rem;
        color: var(--text-color);
    }

    .instruction {
        font-size: 1rem;
        color: var(--label-color);
        line-height: 1.5;
        margin-bottom: 1.5rem;
    }

    .instruction a {
        color: var(--accent-color);
        text-decoration: none;
        transition: color 0.2s;
    }

    .instruction a:hover {
        color: var(--accent-color-hover);
    }

    .form-buttons {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 2rem;
    }

    .main-button {
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

    .main-button:hover {
        background-color: var(--accent-color-hover);
        transform: translateY(-1px);
    }
    
    .cancel-button {
        width: 100%;
        padding: 0.75rem 1rem;
        background-color: #e0e0e0;
        color: var(--text-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.1s;
    }

    .cancel-button:hover {
        background-color: #d5d5d5;
        transform: translateY(-1px);
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

<@layout.registrationLayout displayInfo=true; section>
    <#if section = "form">
        <div class="email-verify-page-container">
            <div class="email-verify-card">
                <h1 class="email-verify-title">${msg("emailVerifyTitle")}</h1>
                <p class="instruction">
                    <#if verifyEmail??>
                        ${msg("emailVerifyInstruction1",verifyEmail)}
                    <#else>
                        ${msg("emailVerifyInstruction4",user.email)}
                    </#if>
                </p>
                <#if isAppInitiatedAction??>
                    <form id="kc-verify-email-form" action="${url.loginAction}" method="post">
                        <div class="form-buttons">
                            <#if verifyEmail??>
                                <input class="main-button" type="submit" value="${msg("emailVerifyResend")}" />
                            <#else>
                                <input class="main-button" type="submit" value="${msg("emailVerifySend")}" />
                            </#if>
                            <button class="cancel-button" type="submit" name="cancel-aia" value="true" formnovalidate>${msg("doCancel")}</button>
                        </div>
                    </form>
                </#if>
            </div>
            <#if !isAppInitiatedAction??>
                <p class="instruction" style="text-align: center;">
                    ${msg("emailVerifyInstruction2")}
                    <br/>
                    <a href="${url.loginAction}">${msg("doClickHere")}</a> ${msg("emailVerifyInstruction3")}
                </p>
            </#if>
        </div>
    </#if>
</@layout.registrationLayout>