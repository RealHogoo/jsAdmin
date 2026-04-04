<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<div class="login-page" data-page="login">
    <div class="login-shell panel">
        <div class="login-head">
            <div class="login-eyebrow">SSO ACCESS</div>
            <h2 class="login-title">&#49436;&#48708;&#49828; &#47196;&#44536;&#51064;</h2>
            <p class="login-desc">&#44277;&#53685; &#51064;&#51613;&#51012; &#49324;&#50857;&#54644; &#50612;&#46300;&#48124; &#48143; &#49828;&#52992;&#51460; &#49436;&#48708;&#49828;&#50640; &#51217;&#44540;&#54633;&#45768;&#45796;.</p>
        </div>

        <div class="login-form">
            <div class="form-item full">
                <label for="login_user_id">&#50500;&#51060;&#46356;</label>
                <input id="login_user_id" class="input login-input" type="text" autocomplete="username" placeholder="&#50500;&#51060;&#46356;&#47484; &#51077;&#47141;&#54616;&#49464;&#50836;" />
            </div>

            <div class="form-item full">
                <label for="login_user_pw">&#48708;&#48128;&#48264;&#54840;</label>
                <input id="login_user_pw" class="input login-input" type="password" autocomplete="current-password" placeholder="&#48708;&#48128;&#48264;&#54840;&#47484; &#51077;&#47141;&#54616;&#49464;&#50836;" />
            </div>

            <div id="loginMsg" class="login-msg" aria-live="polite"></div>

            <div class="btns login-actions">
                <button type="button" id="btnLogin" class="btn login-submit">&#47196;&#44536;&#51064;</button>
            </div>
        </div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/login/login.js?v=${assetVersion}"></script>
