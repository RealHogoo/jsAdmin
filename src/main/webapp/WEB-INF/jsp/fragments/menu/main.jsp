<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="menuPage" class="page-root" data-page-url="/menu/main.do">
    <jsp:include page="/WEB-INF/jsp/common/page-header.jsp">
        <jsp:param name="title" value="&#xba54;&#xb274; &#xad00;&#xb9ac;" />
        <jsp:param name="help" value="&#xc88c;&#xce21; &#xba54;&#xb274; &#xad6c;&#xc870;, URL, &#xc544;&#xc774;&#xcf58;, &#xc815;&#xb82c; &#xc21c;&#xc11c;&#xb97c; &#xad00;&#xb9ac;&#xd569;&#xb2c8;&#xb2e4;." />
    </jsp:include>

    <div class="toolbar btns no-wrap" role="toolbar" aria-label="page actions">
        <label for="search_use_yn">&#xc0ac;&#xc6a9;&#xc5ec;&#xbd80;</label>
        <select class="input" id="search_use_yn" style="max-width:140px;">
            <option value="Y">&#xc0ac;&#xc6a9;</option>
            <option value="N">&#xbbf8;&#xc0ac;&#xc6a9;</option>
            <option value="">&#xc804;&#xccb4;</option>
        </select>
        <a href="#" class="btn" data-perm-lvl="1" id="btnSearch" role="button">&#xc870;&#xd68c;</a>
        <a href="#" class="btn" data-perm-lvl="5" id="btnSave" role="button">&#xc800;&#xc7a5;</a>
        <a href="#" class="btn" data-perm-lvl="10" id="btnDelete" role="button">&#xc0ad;&#xc81c;</a>
        <a href="#" class="btn" id="btnNew" role="button">&#xc2e0;&#xaddc;</a>
        <a href="#" class="btn" id="btnMenuRefresh" role="button">&#xc0c8;&#xb85c;&#xace0;&#xce68;</a>
    </div>

    <div class="grid-2col">
        <div class="panel">
            <div class="panel-title">&#xba54;&#xb274; &#xc815;&#xbcf4;</div>
            <div id="menuForm" class="form-grid">
                <input type="hidden" id="menu_seq" name="menu_seq" />

                <div class="form-item">
                    <label>&#xc0c1;&#xc704; &#xba54;&#xb274;</label>
                    <input type="text" class="input" id="up_menu_seq" name="up_menu_seq" />
                </div>

                <div class="form-item">
                    <label>&#xba54;&#xb274;&#xba85;</label>
                    <input type="text" class="input" id="menu_nm" name="menu_nm" />
                </div>

                <div class="form-item full">
                    <label>URL</label>
                    <input type="text" class="input" id="menu_url" name="menu_url" />
                </div>

                <div class="form-item">
                    <label>&#xba54;&#xb274; &#xc720;&#xd615;</label>
                    <select class="input" id="menu_type_cd" name="menu_type_cd">
                        <option value="">&#xc120;&#xd0dd;</option>
                    </select>
                </div>

                <div class="form-item">
                    <label>ICON</label>
                    <div class="icon-field">
                        <input type="text" style="display:none;" class="input" id="icon_class" name="icon_class" placeholder="icon value">
                        <span class="icon-preview is-empty" id="menuIconPreview">-</span>
                        <a href="#" class="btn" id="btnSelectIcon" role="button">&#xc120;&#xd0dd;</a>
                    </div>
                </div>

                <div class="form-item">
                    <label>&#xc815;&#xb82c;</label>
                    <input type="number" class="input" id="sort_ord" name="sort_ord" />
                </div>

                <div class="form-item">
                    <label>&#xc0ac;&#xc6a9;&#xc5ec;&#xbd80;</label>
                    <select class="input" id="use_yn" name="use_yn">
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="panel panel-list">
            <div class="panel-title">&#xba54;&#xb274; &#xbaa9;&#xb85d;</div>
            <div class="grid-scroll" id="menuListWrap">
                <table class="tbl" id="menuTable">
                    <thead>
                    <tr>
                        <th style="width:30px;">No.</th>
                        <th style="width:120px;">&#xc0c1;&#xc704;&#xba54;&#xb274;</th>
                        <th style="width:180px;">&#xba54;&#xb274;&#xba85;</th>
                        <th style="width:280px;">URL</th>
                        <th style="width:140px;">&#xba54;&#xb274;&#xc720;&#xd615;</th>
                        <th style="width:180px;">&#xc544;&#xc774;&#xcf58;</th>
                        <th style="width:100px;">&#xc815;&#xb82c;&#xc21c;&#xc11c;</th>
                        <th style="width:100px;">&#xc0ac;&#xc6a9;&#xc5ec;&#xbd80;</th>
                    </tr>
                    </thead>
                    <tbody id="menuListBody"></tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="icon-picker" id="menuIconPicker" aria-hidden="true">
        <div class="icon-picker__backdrop" data-icon-picker-close="1"></div>
        <div class="icon-picker__dialog" role="dialog" aria-modal="true" aria-labelledby="menuIconPickerTitle">
            <div class="icon-picker__head">
                <strong id="menuIconPickerTitle">&#xba54;&#xb274; &#xc544;&#xc774;&#xcf58; &#xc120;&#xd0dd;</strong>
                <a href="#" class="btn" id="btnCloseIconPicker" data-icon-picker-close="1" role="button">&#xb2eb;&#xae30;</a>
            </div>
            <div class="icon-picker__body">
                <div class="icon-picker__toolbar">
                    <input type="text" class="input" id="menuIconFilter" placeholder="&#xc544;&#xc774;&#xcf58; &#xac80;&#xc0c9;" />
                </div>
                <div class="icon-picker__grid" id="menuIconPickerGrid"></div>
            </div>
        </div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/menu/menu.js?v=${assetVersion}"></script>
