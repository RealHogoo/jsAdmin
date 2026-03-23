<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="userPage" class="page-root" data-page-url="/user/main.do">
    <h2 class="page-title">사용자 관리</h2>
    <p class="muted">계정 등록, 수정, 비활성화, 잠금 해제와 비밀번호 초기화를 처리합니다.</p>

    <div class="toolbar btns">
        <input type="text" class="input" id="userMgmtKeyword" placeholder="로그인 아이디 또는 사용자명" style="max-width:220px;">
        <select id="userMgmtUseYn" class="input" style="max-width:140px;">
            <option value="">전체 상태</option>
            <option value="Y">사용</option>
            <option value="N">미사용</option>
        </select>
        <a href="javascript:void(0)" class="btn" id="btnUserMgmtSearch">조회</a>
        <a href="javascript:void(0)" class="btn" id="btnUserMgmtNew">신규</a>
        <a href="javascript:void(0)" class="btn" id="btnUserMgmtSave">저장</a>
        <a href="javascript:void(0)" class="btn" id="btnUserMgmtResetPw">비밀번호 초기화</a>
        <a href="javascript:void(0)" class="btn" id="btnUserMgmtUnlock">잠금 해제</a>
        <a href="javascript:void(0)" class="btn" id="btnUserMgmtDelete">비활성화</a>
    </div>

    <div class="grid-2col">
        <section class="panel">
            <div class="panel-title">사용자 상세</div>
            <div class="form-grid" id="userMgmtForm">
                <div class="form-item">
                    <label for="user_seq">사용자 번호</label>
                    <input type="text" class="input" id="user_seq" readonly>
                </div>
                <div class="form-item">
                    <label for="use_yn">사용 여부</label>
                    <select id="use_yn" class="input">
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                    </select>
                </div>
                <div class="form-item">
                    <label for="login_id">로그인 아이디</label>
                    <input type="text" class="input" id="login_id">
                </div>
                <div class="form-item">
                    <label for="user_nm">사용자명</label>
                    <input type="text" class="input" id="user_nm">
                </div>
                <div class="form-item full">
                    <label for="user_pw">비밀번호</label>
                    <input type="password" class="input" id="user_pw" placeholder="신규 등록 시 필수, 수정 시 비워두면 유지됩니다.">
                </div>
                <div class="form-item">
                    <label for="login_fail_cnt">실패 횟수</label>
                    <input type="text" class="input" id="login_fail_cnt" readonly>
                </div>
                <div class="form-item">
                    <label for="lock_yn">잠금 여부</label>
                    <input type="text" class="input" id="lock_yn" readonly>
                </div>
                <div class="form-item">
                    <label for="lock_until_at">지연/잠금 만료</label>
                    <input type="text" class="input" id="lock_until_at" readonly>
                </div>
                <div class="form-item">
                    <label for="pwd_reset_yn">초기화 여부</label>
                    <input type="text" class="input" id="pwd_reset_yn" readonly>
                </div>
                <div class="form-item">
                    <label for="last_login_at">최근 로그인</label>
                    <input type="text" class="input" id="last_login_at" readonly>
                </div>
            </div>
        </section>

        <section class="panel panel-list">
            <div class="panel-title">사용자 목록</div>
            <div id="userMgmtGrid" class="vgrid"></div>
        </section>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/user/user.js"></script>
