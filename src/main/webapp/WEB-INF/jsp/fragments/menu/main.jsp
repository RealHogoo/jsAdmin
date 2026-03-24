<%@ page contentType="text/html; charset=UTF-8" %>

<div id="menuPage" class="page-root" data-page-url="/menu/main.do">
    <div class="page-title-row">
        <div class="page-title-group">
            <h2 class="page-title">메뉴관리</h2>
        </div>
    </div>

    <div class="toolbar btns no-wrap" role="toolbar" aria-label="page actions">
        <label for="search_use_yn">사용여부</label>
        <select class="input" id="search_use_yn" style="max-width:140px;">
            <option value="Y">사용</option>
            <option value="N">미사용</option>
            <option value="">전체</option>
        </select>
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

        <div class="panel panel-list">
            <div class="panel-title">메뉴 목록</div>
            <div class="grid-scroll" id="menuListWrap">
                <table class="tbl" id="menuTable">
                    <thead>
                    <tr>
                        <th style="width:30px;">No.</th>
                        <th style="width:120px;">상위메뉴</th>
                        <th style="width:180px;">메뉴명</th>
                        <th style="width:280px;">URL</th>
                        <th style="width:140px;">메뉴유형</th>
                        <th style="width:180px;">아이콘</th>
                        <th style="width:100px;">정렬순서</th>
                        <th style="width:100px;">사용여부</th>
                    </tr>
                    </thead>
                    <tbody id="menuListBody"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/menu/menu.js?v=20260325_01"></script>
