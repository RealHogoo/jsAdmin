<%@ page contentType="text/html; charset=UTF-8" %>

<div id="menuPage" class="page-root">
    <h2 class="page-title">메뉴관리</h2>

    <div class="toolbar">
        <label for="search_use_yn">사용여부</label>
        <select class="input" id="search_use_yn" style="max-width:140px;">
            <option value="Y">사용</option>
            <option value="N">미사용</option>
            <option value="">전체</option>
        </select>
    </div>

    <div class="toolbar btns" role="toolbar" aria-label="page actions">
        <a href="#" class="btn" data-perm-lvl="1" id="btnSearch" role="button">조회</a>
        <a href="#" class="btn" data-perm-lvl="5" id="btnSave" role="button">저장</a>
        <a href="#" class="btn" data-perm-lvl="10" id="btnDelete" role="button">삭제</a>
        <a href="#" class="btn" id="btnNew" role="button">신규</a>
        <a href="#" class="btn" id="btnMenuRefresh" role="button">새로고침</a>
    </div>

    <div class="grid-2col">
        <div class="panel">
            <div class="panel-title">메뉴 정보</div>
            <div id="menuForm" class="form-grid">
                <input type="hidden" id="menu_seq" name="menu_seq" />

                <div class="form-item">
                    <label>상위메뉴</label>
                    <input type="text" class="input" id="up_menu_seq" name="up_menu_seq" />
                </div>

                <div class="form-item">
                    <label>메뉴명</label>
                    <input type="text" class="input" id="menu_nm" name="menu_nm" />
                </div>

                <div class="form-item full">
                    <label>URL</label>
                    <input type="text" class="input" id="menu_url" name="menu_url" />
                </div>

                <div class="form-item">
                    <label>메뉴타입</label>
                    <select class="input" id="menu_type_cd" name="menu_type_cd">
                        <option value="">선택</option>
                    </select>
                </div>

                <div class="form-item">
                    <label>ICON</label>
                    <input type="text" class="input" id="icon_class" name="icon_class" />
                </div>

                <div class="form-item">
                    <label>정렬</label>
                    <input type="number" class="input" id="sort_ord" name="sort_ord" />
                </div>

                <div class="form-item">
                    <label>사용여부</label>
                    <select class="input" id="use_yn" name="use_yn">
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-title">메뉴 목록</div>
            <table class="tbl" id="menuTable">
                <thead>
                    <tr>
                        <th>menu_seq</th>
                        <th>up_menu_seq</th>
                        <th>menu_nm</th>
                        <th>menu_url</th>
                        <th>menu_type_cd</th>
                        <th>icon_class</th>
                        <th>sort_ord</th>
                        <th>use_yn</th>
                    </tr>
                </thead>
                <tbody id="menuListBody"></tbody>
            </table>
        </div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/menu/menu.js"></script>
