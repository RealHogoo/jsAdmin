<%@ page contentType="text/html; charset=UTF-8" %>

<div class="page-root" id="codePage">
    <h2 class="page-title">코드관리</h2>

    <div class="toolbar btns" role="toolbar" aria-label="page actions">
        <a href="#" class="btn" data-perm-lvl="1" id="btnCodeSearch" role="button">조회</a>
        <a href="#" class="btn" data-perm-lvl="5" id="btnCodeSave" role="button">저장</a>
        <a href="#" class="btn" data-perm-lvl="10" id="btnCodeDelete" role="button">삭제</a>
        <a href="#" class="btn" id="btnCodeNew" role="button">신규</a>
        <a href="#" class="btn" id="btnCodeRefresh" role="button">새로고침</a>
    </div>

    <div class="grid-2col">
        <div class="panel">
            <div class="panel-title">코드 정보</div>
            <div id="codeForm" class="form-grid">
                <input type="hidden" id="code_seq" name="code_seq" />

                <div class="form-item">
                    <label>CODE_GRP_CD</label>
                    <input type="text" class="input" id="code_grp_cd" name="code_grp_cd" />
                </div>

                <div class="form-item">
                    <label>CODE_CD</label>
                    <input type="text" class="input" id="code_cd" name="code_cd" />
                </div>

                <div class="form-item full">
                    <label>CODE_NM</label>
                    <input type="text" class="input" id="code_nm" name="code_nm" />
                </div>

                <div class="form-item full">
                    <label>CODE_DESC</label>
                    <input type="text" class="input" id="code_desc" name="code_desc" />
                </div>

                <div class="form-item">
                    <label>SORT_ORD</label>
                    <input type="number" class="input" id="sort_ord" name="sort_ord" />
                </div>

                <div class="form-item">
                    <label>USE_YN</label>
                    <select class="input" id="use_yn" name="use_yn">
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-title">코드 목록</div>
            <table class="tbl" id="codeTable">
                <thead>
                    <tr>
                        <th>CODE_SEQ</th>
                        <th>CODE_GRP_CD</th>
                        <th>CODE_CD</th>
                        <th>CODE_NM</th>
                        <th>CODE_DESC</th>
                        <th>SORT_ORD</th>
                        <th>USE_YN</th>
                    </tr>
                </thead>
                <tbody id="codeListBody"></tbody>
            </table>
        </div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/code/code.js"></script>
