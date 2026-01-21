<%@ page contentType="text/html; charset=UTF-8" %>

<div id="menuPage">
    <h3>메뉴관리</h3>

    <div class="btns" role="toolbar" aria-label="page actions">
	    <a href="#" class="btn" data-perm-lvl="1" id="btnSearch" role="button">조회</a>
	    <a href="#" class="btn" data-perm-lvl="5" id="btnSave" role="button">저장</a>
	    <a href="#" class="btn" data-perm-lvl="10" id="btnDelete" role="button">삭제</a>
	    <a href="#" class="btn" id="btnNew" role="button">신규</a>
	    <a href="#" class="btn" id="btnMenuRefresh" role="button">새로고침</a>
	</div>

    <div id="menuForm">
        <input type="hidden" id="menu_seq" name="menu_seq" />

        <div>
            <label>상위메뉴</label>
            <input type="text" id="up_menu_seq" name="up_menu_seq" />
        </div>

        <div>
            <label>메뉴명</label>
            <input type="text" id="menu_nm" name="menu_nm" />
        </div>

        <div>
            <label>URL</label>
            <input type="text" id="menu_url" name="menu_url" />
        </div>

        <div>
            <label>메뉴타입</label>
            <input type="text" id="menu_type_cd" name="menu_type_cd" />
        </div>

        <div>
            <label>ICON</label>
            <input type="text" id="icon_class" name="icon_class" />
        </div>

        <div>
            <label>정렬</label>
            <input type="number" id="sort_ord" name="sort_ord" />
        </div>

        <div>
            <label>사용여부</label>
            <select id="use_yn" name="use_yn">
                <option value="Y">Y</option>
                <option value="N">N</option>
            </select>
        </div>
    </div>

    <table border="1" width="100%" id="menuTable">
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

<script src="${pageContext.request.contextPath}/static/js/menu/menu.js"></script>
