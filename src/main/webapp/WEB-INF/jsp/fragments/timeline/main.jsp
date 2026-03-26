<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div class="page-root" id="timelinePage" data-page-url="/timeline/main.do">
    <div class="page-title-row">
        <div class="page-title-group">
            <h2 class="page-title">&#xd0c0;&#xc784;&#xb77c;&#xc778; &#xad00;&#xb9ac;</h2>
        </div>
    </div>

    <details class="page-help">
        <summary><span class="page-help-toggle">?</span></summary>
        <div class="page-help-body">
            &#xd0c0;&#xc784;&#xb77c;&#xc778; &#xc774;&#xbca4;&#xd2b8;&#xb97c; &#xb4f1;&#xb85d;&#xd558;&#xace0; &#xae30;&#xac04;&#xacfc; &#xc0ac;&#xc6a9; &#xc5ec;&#xbd80;&#xb97c; &#xad00;&#xb9ac;&#xd569;&#xb2c8;&#xb2e4;.
        </div>
    </details>

    <div class="toolbar btns" role="toolbar" aria-label="timeline actions">
        <a href="#" class="btn" data-perm-lvl="1" id="btnTimelineSearch" role="button">&#xc870;&#xd68c;</a>
        <a href="#" class="btn" data-perm-lvl="5" id="btnTimelineSave" role="button">&#xc800;&#xc7a5;</a>
        <a href="#" class="btn" data-perm-lvl="10" id="btnTimelineDelete" role="button">&#xc0ad;&#xc81c;</a>
        <a href="#" class="btn" id="btnTimelineNew" role="button">&#xc2e0;&#xaddc;</a>
        <a href="#" class="btn" id="btnTimelineRefresh" role="button">&#xc0c8;&#xb85c;&#xace0;&#xce68;</a>
    </div>

    <div class="grid-2col">
        <div class="panel">
            <div class="panel-title">&#xd0c0;&#xc784;&#xb77c;&#xc778; &#xc815;&#xbcf4;</div>
            <div id="timelineForm" class="form-grid">
                <input type="hidden" id="timeline_seq" name="timeline_seq" />

                <div class="form-item">
                    <label>&#xc720;&#xd615; &#xcf54;&#xb4dc;</label>
                    <input type="text" class="input" id="timeline_type_cd" name="timeline_type_cd" maxlength="30" />
                </div>

                <div class="form-item">
                    <label>&#xc774;&#xbca4;&#xd2b8; &#xc77c;&#xc790; *</label>
                    <input type="date" class="input" id="event_dt" name="event_dt" />
                </div>

                <div class="form-item full">
                    <label>&#xc81c;&#xbaa9; *</label>
                    <input type="text" class="input" id="title" name="title" maxlength="300" />
                </div>

                <div class="form-item full">
                    <label>&#xb0b4;&#xc6a9;</label>
                    <textarea class="textarea" id="content" name="content" rows="10"></textarea>
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
            <div class="panel-title">&#xd0c0;&#xc784;&#xb77c;&#xc778; &#xbaa9;&#xb85d;</div>
            <div class="form-grid" style="margin-bottom:8px;">
                <div class="form-item">
                    <label>&#xc774;&#xbca4;&#xd2b8; &#xc2dc;&#xc791;&#xc77c;</label>
                    <input type="date" class="input" id="event_dt_from" />
                </div>
                <div class="form-item">
                    <label>&#xc774;&#xbca4;&#xd2b8; &#xc885;&#xb8cc;&#xc77c;</label>
                    <input type="date" class="input" id="event_dt_to" />
                </div>
                <div class="form-item full">
                    <label>&#xc81c;&#xbaa9;</label>
                    <input type="text" class="input" id="search_title" placeholder="&#xc81c;&#xbaa9; &#xac80;&#xc0c9;" />
                </div>
            </div>

            <div class="grid-scroll" id="timelineListWrap">
                <table class="tbl" id="timelineTable">
                    <thead>
                        <tr>
                            <th style="width:30px;">No.</th>
                            <th style="width:140px;">&#xc720;&#xd615;</th>
                            <th style="width:320px;">&#xc81c;&#xbaa9;</th>
                            <th style="width:140px;">&#xc774;&#xbca4;&#xd2b8;&#xc77c;&#xc790;</th>
                            <th style="width:80px;">&#xc0ac;&#xc6a9;&#xc5ec;&#xbd80;</th>
                        </tr>
                    </thead>
                    <tbody id="timelineListBody"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/timeline/timeline-main.js?v=20260324_02"></script>
