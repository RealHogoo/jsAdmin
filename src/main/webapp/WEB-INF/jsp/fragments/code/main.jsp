<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div class="page-root" id="codePage" data-page-url="/code/main.do">
    <jsp:include page="/WEB-INF/jsp/common/page-header.jspf">
        <jsp:param name="title" value="&#xcf54;&#xb4dc; &#xad00;&#xb9ac;" />
        <jsp:param name="help" value="&#xacf5;&#xd1b5; &#xcf54;&#xb4dc; &#xadf8;&#xb8f9;, &#xcf54;&#xb4dc;, &#xc815;&#xb82c; &#xc21c;&#xc11c;, &#xc0ac;&#xc6a9; &#xc5ec;&#xbd80;&#xb97c; &#xad00;&#xb9ac;&#xd569;&#xb2c8;&#xb2e4;." />
    </jsp:include>

    <div class="toolbar btns" role="toolbar" aria-label="page actions">
        <a href="#" class="btn" data-perm-lvl="1" id="btnCodeSearch" role="button">&#xc870;&#xd68c;</a>
        <a href="#" class="btn" data-perm-lvl="5" id="btnCodeSave" role="button">&#xc800;&#xc7a5;</a>
        <a href="#" class="btn" data-perm-lvl="10" id="btnCodeDelete" role="button">&#xc0ad;&#xc81c;</a>
        <a href="#" class="btn" id="btnCodeNew" role="button">&#xc2e0;&#xaddc;</a>
        <a href="#" class="btn" id="btnCodeRefresh" role="button">&#xc0c8;&#xb85c;&#xace0;&#xce68;</a>
    </div>

    <div class="grid-2col">
        <div class="panel">
            <div class="panel-title">&#xcf54;&#xb4dc; &#xc815;&#xbcf4;</div>
            <div id="codeForm" class="form-grid">
                <input type="hidden" id="code_seq" name="code_seq" />

                <div class="form-item">
                    <label>&#xcf54;&#xb4dc;&#xadf8;&#xb8f9;</label>
                    <input type="text" class="input" id="code_grp_cd" name="code_grp_cd" />
                </div>

                <div class="form-item">
                    <label>&#xcf54;&#xb4dc;</label>
                    <input type="text" class="input" id="code_cd" name="code_cd" />
                </div>

                <div class="form-item full">
                    <label>&#xcf54;&#xb4dc;&#xba85;</label>
                    <input type="text" class="input" id="code_nm" name="code_nm" />
                </div>

                <div class="form-item full">
                    <label>&#xcf54;&#xb4dc; &#xc124;&#xba85;</label>
                    <input type="text" class="input" id="code_desc" name="code_desc" />
                </div>

                <div class="form-item">
                    <label>&#xc815;&#xb82c;&#xc21c;&#xc11c;</label>
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
            <div class="panel-title">&#xcf54;&#xb4dc; &#xbaa9;&#xb85d;</div>
            <div class="grid-scroll" id="codeListWrap">
                <table class="tbl" id="codeTable">
                    <thead>
                        <tr>
                            <th style="width:30px;">No.</th>
                            <th style="width:160px;">&#xcf54;&#xb4dc;&#xadf8;&#xb8f9;</th>
                            <th style="width:160px;">&#xcf54;&#xb4dc;</th>
                            <th style="width:220px;">&#xcf54;&#xb4dc;&#xba85;</th>
                            <th style="width:320px;">&#xcf54;&#xb4dc;&#xc124;&#xba85;</th>
                            <th style="width:100px;">&#xc815;&#xb82c;&#xc21c;&#xc11c;</th>
                            <th style="width:100px;">&#xc0ac;&#xc6a9;&#xc5ec;&#xbd80;</th>
                        </tr>
                    </thead>
                    <tbody id="codeListBody"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/code/code.js?v=20260328_01"></script>
