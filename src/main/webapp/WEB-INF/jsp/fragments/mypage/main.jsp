<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="myPage" class="page-root" data-page-url="/mypage/main.do">
    <div class="page-title-row">
        <div class="page-title-group">
            <h2 class="page-title">&#xb9c8;&#xc774;&#xd398;&#xc774;&#xc9c0;</h2>
        </div>
    </div>

    <details class="page-help">
        <summary><span class="page-help-toggle">?</span></summary>
        <div class="page-help-body">
            &#xb0b4; &#xacc4;&#xc815; &#xae30;&#xbcf8; &#xc815;&#xbcf4;&#xc640; &#xbe44;&#xbc00;&#xbc88;&#xd638;&#xb97c; &#xad00;&#xb9ac;&#xd569;&#xb2c8;&#xb2e4;.
        </div>
    </details>

    <div class="grid-2col">
        <section class="panel">
            <div class="panel-title">&#xae30;&#xbcf8; &#xc815;&#xbcf4;</div>
            <div class="form-grid">
                <div class="form-item">
                    <label for="my_login_id">&#xc544;&#xc774;&#xb514;</label>
                    <input type="text" class="input" id="my_login_id" readonly>
                </div>
                <div class="form-item">
                    <label for="my_use_yn">&#xc0ac;&#xc6a9; &#xc5ec;&#xbd80;</label>
                    <input type="text" class="input" id="my_use_yn" readonly>
                </div>
                <div class="form-item full">
                    <label for="my_user_nm">&#xc0ac;&#xc6a9;&#xc790;&#xba85;</label>
                    <input type="text" class="input" id="my_user_nm">
                </div>
                <div class="form-item">
                    <label for="my_last_login_at">&#xcd5c;&#xadfc; &#xb85c;&#xadf8;&#xc778;</label>
                    <input type="text" class="input" id="my_last_login_at" readonly>
                </div>
                <div class="form-item">
                    <label for="my_pwd_reset_yn">&#xbe44;&#xbc00;&#xbc88;&#xd638; &#xcd08;&#xae30;&#xd654; &#xc5ec;&#xbd80;</label>
                    <input type="text" class="input" id="my_pwd_reset_yn" readonly>
                </div>
            </div>
            <div class="btns" style="margin-top:12px;">
                <a href="javascript:void(0)" class="btn" id="btnMyPageSave">&#xae30;&#xbcf8;&#xc815;&#xbcf4; &#xc800;&#xc7a5;</a>
            </div>
        </section>

        <section class="panel">
            <div class="panel-title">&#xbe44;&#xbc00;&#xbc88;&#xd638; &#xbcf4;&#xbcc0;</div>
            <div class="form-grid">
                <div class="form-item full">
                    <label for="my_current_password">&#xd604;&#xc7ac; &#xbe44;&#xbc00;&#xbc88;&#xd638;</label>
                    <input type="password" class="input" id="my_current_password" autocomplete="current-password">
                </div>
                <div class="form-item full">
                    <label for="my_new_password">&#xc0c8; &#xbe44;&#xbc00;&#xbc88;&#xd638;</label>
                    <input type="password" class="input" id="my_new_password" autocomplete="new-password">
                </div>
                <div class="form-item full">
                    <label for="my_new_password_confirm">&#xc0c8; &#xbe44;&#xbc00;&#xbc88;&#xd638; &#xd655;&#xc778;</label>
                    <input type="password" class="input" id="my_new_password_confirm" autocomplete="new-password">
                </div>
            </div>
            <div class="btns" style="margin-top:12px;">
                <a href="javascript:void(0)" class="btn" id="btnMyPageChangePassword">&#xbe44;&#xbc00;&#xbc88;&#xd638; &#xbcf4;&#xbcc0;</a>
            </div>
            <p id="myPageMsg" class="muted" style="margin-top:12px;"></p>
        </section>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/mypage/mypage.js"></script>
