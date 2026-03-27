<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="userPage" class="page-root" data-page-url="/user/main.do">
    <jsp:include page="/WEB-INF/jsp/common/page-header.jspf">
        <jsp:param name="title" value="&#xc0ac;&#xc6a9;&#xc790; &#xad00;&#xb9ac;" />
        <jsp:param name="help" value="&#xacc4;&#xc815; &#xb4f1;&#xb85d;, &#xc218;&#xc815;, &#xbe44;&#xd65c;&#xc131;&#xd654;, &#xc7a0;&#xae08; &#xd574;&#xc81c;&#xc640; &#xbe44;&#xbc00;&#xbc88;&#xd638; &#xcd08;&#xae30;&#xd654;&#xb97c; &#xcc98;&#xb9ac;&#xd569;&#xb2c8;&#xb2e4;." />
    </jsp:include>

    <div class="toolbar btns">
        <input type="text" class="input" id="userMgmtKeyword" placeholder="&#xb85c;&#xadf8;&#xc778; &#xc544;&#xc774;&#xb514; &#xb610;&#xb294; &#xc0ac;&#xc6a9;&#xc790;&#xba85;" style="max-width:220px;">
        <select id="userMgmtUseYn" class="input" style="max-width:140px;">
            <option value="">&#xc804;&#xccb4; &#xc0c1;&#xd0dc;</option>
            <option value="Y">&#xc0ac;&#xc6a9;</option>
            <option value="N">&#xbbf8;&#xc0ac;&#xc6a9;</option>
        </select>
        <a href="javascript:void(0)" class="btn" id="btnUserMgmtSearch">&#xc870;&#xd68c;</a>
        <a href="javascript:void(0)" class="btn" id="btnUserMgmtNew">&#xc2e0;&#xaddc;</a>
        <a href="javascript:void(0)" class="btn" id="btnUserMgmtSave">&#xc800;&#xc7a5;</a>
        <a href="javascript:void(0)" class="btn" id="btnUserMgmtResetPw">&#xbe44;&#xbc00;&#xbc88;&#xd638; &#xcd08;&#xae30;&#xd654;</a>
        <a href="javascript:void(0)" class="btn" id="btnUserMgmtUnlock">&#xc7a0;&#xae08; &#xd574;&#xc81c;</a>
        <a href="javascript:void(0)" class="btn" id="btnUserMgmtDelete">&#xbe44;&#xd65c;&#xc131;&#xd654;</a>
    </div>

    <div class="grid-2col">
        <section class="panel">
            <div class="panel-title">&#xc0ac;&#xc6a9;&#xc790; &#xc0c1;&#xc138;</div>
            <div class="form-grid" id="userMgmtForm">
                <div class="form-item">
                    <label for="user_seq">&#xc0ac;&#xc6a9;&#xc790; &#xbc88;&#xd638;</label>
                    <input type="text" class="input" id="user_seq" readonly>
                </div>
                <div class="form-item">
                    <label for="use_yn">&#xc0ac;&#xc6a9; &#xc5ec;&#xbd80;</label>
                    <select id="use_yn" class="input">
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                    </select>
                </div>
                <div class="form-item">
                    <label for="login_id">&#xb85c;&#xadf8;&#xc778; &#xc544;&#xc774;&#xb514;</label>
                    <input type="text" class="input" id="login_id">
                </div>
                <div class="form-item">
                    <label for="user_nm">&#xc0ac;&#xc6a9;&#xc790;&#xba85;</label>
                    <input type="text" class="input" id="user_nm">
                </div>
                <div class="form-item full">
                    <label for="user_pw">&#xbe44;&#xbc00;&#xbc88;&#xd638;</label>
                    <input type="password" class="input" id="user_pw" placeholder="&#xc2e0;&#xaddc; &#xb4f1;&#xb85d; &#xc2dc; &#xd544;&#xc218;, &#xc218;&#xc815; &#xc2dc; &#xbe44;&#xc6cc;&#xb450;&#xba74; &#xc720;&#xc9c0;&#xb429;&#xb2c8;&#xb2e4;.">
                </div>
                <div class="form-item">
                    <label for="login_fail_cnt">&#xc2e4;&#xd328; &#xd69f;&#xc218;</label>
                    <input type="text" class="input" id="login_fail_cnt" readonly>
                </div>
                <div class="form-item">
                    <label for="lock_yn">&#xc7a0;&#xae08; &#xc5ec;&#xbd80;</label>
                    <input type="text" class="input" id="lock_yn" readonly>
                </div>
                <div class="form-item">
                    <label for="lock_until_at">&#xc9c0;&#xc5f0;/&#xc7a0;&#xae08; &#xb9cc;&#xb8cc;</label>
                    <input type="text" class="input" id="lock_until_at" readonly>
                </div>
                <div class="form-item">
                    <label for="pwd_reset_yn">&#xcd08;&#xae30;&#xd654; &#xc5ec;&#xbd80;</label>
                    <input type="text" class="input" id="pwd_reset_yn" readonly>
                </div>
                <div class="form-item">
                    <label for="last_login_at">&#xcd5c;&#xadfc; &#xb85c;&#xadf8;&#xc778;</label>
                    <input type="text" class="input" id="last_login_at" readonly>
                </div>
            </div>
        </section>

        <section class="panel panel-list">
            <div class="panel-title">&#xc0ac;&#xc6a9;&#xc790; &#xbaa9;&#xb85d;</div>
            <div id="userMgmtGrid" class="vgrid vgrid-fill">
                <div class="vgrid-head">
                    <div class="vgrid-cell vgrid-head-cell" data-width="30px" data-align="center">No.</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="160px" data-align="left">&#xb85c;&#xadf8;&#xc778; &#xc544;&#xc774;&#xb514;</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="160px" data-align="left">&#xc0ac;&#xc6a9;&#xc790;&#xba85;</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="90px" data-align="center">&#xc0ac;&#xc6a9;&#xc5ec;&#xbd80;</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="90px" data-align="center">&#xc2e4;&#xd328;</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="120px" data-align="center">&#xc7a0;&#xae08;</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="110px" data-align="center">&#xcd08;&#xae30;&#xd654;&#xc5ec;&#xbd80;</div>
                </div>
                <div class="vgrid-body">
                    <div class="vgrid-spacer" aria-hidden="true"></div>
                    <div class="vgrid-rows"></div>
                    <div class="vgrid-empty" style="display:none;"></div>
                </div>
            </div>
        </section>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/user/user.js?v=20260328_01"></script>
