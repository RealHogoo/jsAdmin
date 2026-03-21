<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="myPage" class="page-root" data-page-url="/mypage/main.do">
    <h2 class="page-title">마이페이지</h2>
    <p class="muted">내 계정 기본 정보와 비밀번호를 관리합니다.</p>

    <div class="grid-2col">
        <section class="panel">
            <div class="panel-title">기본 정보</div>
            <div class="form-grid">
                <div class="form-item">
                    <label for="my_login_id">아이디</label>
                    <input type="text" class="input" id="my_login_id" readonly>
                </div>
                <div class="form-item">
                    <label for="my_use_yn">사용 여부</label>
                    <input type="text" class="input" id="my_use_yn" readonly>
                </div>
                <div class="form-item full">
                    <label for="my_user_nm">사용자명</label>
                    <input type="text" class="input" id="my_user_nm">
                </div>
                <div class="form-item">
                    <label for="my_last_login_at">최근 로그인</label>
                    <input type="text" class="input" id="my_last_login_at" readonly>
                </div>
                <div class="form-item">
                    <label for="my_pwd_reset_yn">비밀번호 초기화 여부</label>
                    <input type="text" class="input" id="my_pwd_reset_yn" readonly>
                </div>
            </div>
            <div class="btns" style="margin-top:12px;">
                <a href="javascript:void(0)" class="btn" id="btnMyPageSave">기본정보 저장</a>
            </div>
        </section>

        <section class="panel">
            <div class="panel-title">비밀번호 변경</div>
            <div class="form-grid">
                <div class="form-item full">
                    <label for="my_current_password">현재 비밀번호</label>
                    <input type="password" class="input" id="my_current_password" autocomplete="current-password">
                </div>
                <div class="form-item full">
                    <label for="my_new_password">새 비밀번호</label>
                    <input type="password" class="input" id="my_new_password" autocomplete="new-password">
                </div>
                <div class="form-item full">
                    <label for="my_new_password_confirm">새 비밀번호 확인</label>
                    <input type="password" class="input" id="my_new_password_confirm" autocomplete="new-password">
                </div>
            </div>
            <div class="btns" style="margin-top:12px;">
                <a href="javascript:void(0)" class="btn" id="btnMyPageChangePassword">비밀번호 변경</a>
            </div>
            <p id="myPageMsg" class="muted" style="margin-top:12px;"></p>
        </section>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/mypage/mypage.js"></script>
