<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<!-- login.jsp: markup + page-only script import (no inline JS) -->
<div class="login-box" data-page="login">
    <h3>Login</h3>

    <div class="row">
        <label for="login_user_id">User ID</label>
        <input id="login_user_id" type="text" autocomplete="username" />
    </div>

    <div class="row">
        <label for="login_user_pw">Password</label>
        <input id="login_user_pw" type="password" autocomplete="current-password" />
    </div>

    <div class="row actions">
        <button type="button" id="btnLogin">Login</button>
        <span id="loginMsg" class="msg"></span>
    </div>
</div>

<!-- page-only JS -->
<script src="${pageContext.request.contextPath}/static/js/login/login.js"></script>
