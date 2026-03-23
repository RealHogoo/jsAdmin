<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div class="page-root" id="timelinePage">
    <h2 class="page-title">타임라인 관리</h2>

    <div class="toolbar btns" role="toolbar" aria-label="timeline actions">
        <a href="#" class="btn" data-perm-lvl="1" id="btnTimelineSearch" role="button">조회</a>
        <a href="#" class="btn" data-perm-lvl="5" id="btnTimelineSave" role="button">저장</a>
        <a href="#" class="btn" data-perm-lvl="10" id="btnTimelineDelete" role="button">삭제</a>
        <a href="#" class="btn" id="btnTimelineNew" role="button">신규</a>
        <a href="#" class="btn" id="btnTimelineRefresh" role="button">새로고침</a>
    </div>

    <div class="grid-2col">
        <div class="panel">
            <div class="panel-title">타임라인 정보</div>
            <div id="timelineForm" class="form-grid">
                <input type="hidden" id="timeline_seq" name="timeline_seq" />

                <div class="form-item">
                    <label>타입 코드</label>
                    <input type="text" class="input" id="timeline_type_cd" name="timeline_type_cd" maxlength="30" />
                </div>

                <div class="form-item">
                    <label>이벤트 일자 *</label>
                    <input type="date" class="input" id="event_dt" name="event_dt" />
                </div>

                <div class="form-item full">
                    <label>제목 *</label>
                    <input type="text" class="input" id="title" name="title" maxlength="300" />
                </div>

                <div class="form-item full">
                    <label>내용</label>
                    <textarea class="textarea" id="content" name="content" rows="10"></textarea>
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
            <div class="panel-title">타임라인 목록</div>
            <div class="form-grid" style="margin-bottom:8px;">
                <div class="form-item">
                    <label>이벤트 시작일</label>
                    <input type="date" class="input" id="event_dt_from" />
                </div>
                <div class="form-item">
                    <label>이벤트 종료일</label>
                    <input type="date" class="input" id="event_dt_to" />
                </div>
                <div class="form-item full">
                    <label>제목</label>
                    <input type="text" class="input" id="search_title" placeholder="제목 검색" />
                </div>
            </div>

            <div class="grid-scroll" id="timelineListWrap">
                <table class="tbl" id="timelineTable">
                    <thead>
                        <tr>
                            <th style="width:90px;">SEQ</th>
                            <th style="width:120px;">TYPE</th>
                            <th>TITLE</th>
                            <th style="width:120px;">EVENT_DT</th>
                            <th style="width:70px;">USE</th>
                        </tr>
                    </thead>
                    <tbody id="timelineListBody"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/timeline/timeline-main.js"></script>
