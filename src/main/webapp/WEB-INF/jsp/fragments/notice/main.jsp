<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div class="page-root" id="noticePage" data-page-url="/notice/main.do">
    <div class="page-title-row">
        <div class="page-title-group">
            <h2 class="page-title">&#xacf5;&#xc9c0;&#xc0ac;&#xd56d; &#xad00;&#xb9ac;</h2>
        </div>
    </div>

    <details class="page-help">
        <summary><span class="page-help-toggle">?</span></summary>
        <div class="page-help-body">
            &#xacf5;&#xc9c0;&#xc0ac;&#xd56d; &#xb4f1;&#xb85d;, &#xace0;&#xc815;, &#xd31d;&#xc5c5;, &#xac8c;&#xc2dc; &#xae30;&#xac04;&#xc744; &#xad00;&#xb9ac;&#xd569;&#xb2c8;&#xb2e4;.
        </div>
    </details>

    <div class="toolbar btns" role="toolbar" aria-label="notice actions">
        <a href="#" class="btn" data-perm-lvl="1" id="btnNoticeSearch" role="button">&#xc870;&#xd68c;</a>
        <a href="#" class="btn" data-perm-lvl="5" id="btnNoticeSave" role="button">&#xc800;&#xc7a5;</a>
        <a href="#" class="btn" data-perm-lvl="10" id="btnNoticeDelete" role="button">&#xc0ad;&#xc81c;</a>
        <a href="#" class="btn" id="btnNoticeNew" role="button">&#xc2e0;&#xaddc;</a>
        <a href="#" class="btn" id="btnNoticeRefresh" role="button">&#xc0c8;&#xb85c;&#xace0;&#xce68;</a>
    </div>

    <div class="grid-2col">
        <div class="panel">
            <div class="panel-title">&#xacf5;&#xc9c0; &#xc815;&#xbcf4;</div>
            <div id="noticeForm" class="form-grid">
                <input type="hidden" id="noti_seq" name="noti_seq" />

                <div class="form-item">
                    <label>&#xacf5;&#xc9c0; &#xc720;&#xd615;</label>
                    <input type="text" class="input" id="noti_type_cd" name="noti_type_cd" maxlength="10" />
                </div>

                <div class="form-item full">
                    <label>&#xc81c;&#xbaa9; *</label>
                    <input type="text" class="input" id="title" name="title" maxlength="500" />
                </div>

                <div class="form-item full">
                    <label>&#xb0b4;&#xc6a9;</label>
                    <textarea class="textarea" id="content" name="content" rows="10"></textarea>
                </div>

                <div class="form-item">
                    <label>&#xc2dc;&#xc791;&#xc77c;</label>
                    <input type="date" class="input" id="start_dt" name="start_dt" />
                </div>

                <div class="form-item">
                    <label>&#xc885;&#xb8cc;&#xc77c;</label>
                    <input type="date" class="input" id="end_dt" name="end_dt" />
                </div>

                <div class="form-item">
                    <label>&#xc0c1;&#xb2e8;&#xace0;&#xc815;&#xc5ec;&#xbd80;</label>
                    <select class="input" id="pin_yn" name="pin_yn">
                        <option value="N">N</option>
                        <option value="Y">Y</option>
                    </select>
                </div>

                <div class="form-item">
                    <label>&#xd31d;&#xc5c5;&#xc5ec;&#xbd80;</label>
                    <select class="input" id="popup_yn" name="popup_yn">
                        <option value="N">N</option>
                        <option value="Y">Y</option>
                    </select>
                </div>

                <div class="form-item">
                    <label>&#xc0ac;&#xc6a9;&#xc5ec;&#xbd80;</label>
                    <select class="input" id="use_yn" name="use_yn">
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                    </select>
                </div>

                <div class="form-item">
                    <label>&#xc870;&#xd68c;&#xc218;</label>
                    <input type="text" class="input" id="view_cnt" name="view_cnt" readonly />
                </div>
            </div>
        </div>

        <div class="panel panel-list">
            <div class="panel-title">&#xacf5;&#xc9c0; &#xbaa9;&#xb85d;</div>
            <div class="grid-scroll" id="noticeListWrap">
                <table class="tbl" id="noticeTable">
                    <thead>
                        <tr>
                            <th style="width:30px;">No.</th>
                            <th style="width:120px;">&#xc720;&#xd615;</th>
                            <th style="width:260px;">&#xc81c;&#xbaa9;</th>
                            <th style="width:240px;">&#xae30;&#xac04;</th>
                            <th style="width:100px;">&#xc0c1;&#xb2e8;&#xace0;&#xc815;&#xc5ec;&#xbd80;</th>
                            <th style="width:100px;">&#xd31d;&#xc5c5;&#xc5ec;&#xbd80;</th>
                            <th style="width:90px;">&#xc870;&#xd68c;&#xc218;</th>
                            <th style="width:100px;">&#xc0ac;&#xc6a9;&#xc5ec;&#xbd80;</th>
                        </tr>
                    </thead>
                    <tbody id="noticeListBody"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/notice/notice.js?v=20260324_02"></script>
