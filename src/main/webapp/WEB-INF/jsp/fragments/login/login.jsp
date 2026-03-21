<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<div class="login-page" data-page="login">
    <div class="login-shell panel">
        <div class="login-head">
            <div class="login-eyebrow">ADMIN SERVICE</div>
            <h2 class="login-title">관리자 로그인</h2>
            <p class="login-desc">운영 기능 접근을 위해 관리자 계정으로 로그인하세요.</p>
        </div>

        <div class="login-form">
            <div class="form-item full">
                <label for="login_user_id">아이디</label>
                <input id="login_user_id" class="input login-input" type="text" autocomplete="username" placeholder="아이디를 입력하세요" />
            </div>

            <div class="form-item full">
                <label for="login_user_pw">비밀번호</label>
                <input id="login_user_pw" class="input login-input" type="password" autocomplete="current-password" placeholder="비밀번호를 입력하세요" />
            </div>

            <div id="loginMsg" class="login-msg" aria-live="polite"></div>

            <div class="btns login-actions">
                <button type="button" id="btnLogin" class="btn login-submit">로그인</button>
            </div>
        </div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/login/login.js"></script>
