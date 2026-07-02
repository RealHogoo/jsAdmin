<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="resolvedServiceName" value="${empty serviceName ? param.serviceName : serviceName}" />
<c:if test="${empty resolvedServiceName}">
    <c:set var="resolvedServiceName" value="연계 서비스" />
</c:if>

<div class="login-page" data-page="login" data-login-context="service">
    <div class="login-stage">
        <div class="login-shell panel">
            <div class="login-primary">
                <div class="login-head">
                    <div class="login-eyebrow">SSO ACCESS</div>
                    <h2 class="login-title"><c:out value="${resolvedServiceName}" /> 접속 로그인</h2>
                    <p class="login-desc">공통 인증을 통해 <c:out value="${resolvedServiceName}" />에 접근합니다.</p>
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

            <div class="qr-approve-box" id="qrApproveBox" hidden>
                <div class="login-head">
                    <div class="login-eyebrow">QR ACCESS</div>
                    <h2 class="login-title">QR 로그인 승인</h2>
                    <p class="login-desc">현재 모바일 인증으로 PC 로그인을 승인합니다. 승인 후 이 모바일 인증은 만료됩니다.</p>
                </div>
                <div id="qrApproveMsg" class="login-msg is-info" aria-live="polite">승인 대기 중입니다.</div>
                <div class="btns login-actions qr-approve-actions">
                    <button type="button" id="btnQrApprove" class="btn login-submit">승인하고 모바일 인증 만료</button>
                </div>
            </div>
        </div>

        <div class="qr-login-box panel" id="qrLoginBox">
            <div class="qr-login-head">
                <strong>QR 로그인</strong>
            </div>
            <div id="qrLoginImage" class="qr-login-image" aria-live="polite"></div>
            <div id="qrLoginMsg" class="login-msg" aria-live="polite"></div>
        </div>
    </div>
</div>
