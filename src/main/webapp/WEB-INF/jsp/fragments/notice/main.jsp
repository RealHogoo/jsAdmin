<%@ page contentType="text/html; charset=UTF-8" %>

<div class="page-root" id="noticePage">
    <h2 class="page-title">공지사항 관리</h2>

    <div class="toolbar btns" role="toolbar" aria-label="notice actions">
        <a href="#" class="btn" data-perm-lvl="1" id="btnNoticeSearch" role="button">조회</a>
        <a href="#" class="btn" data-perm-lvl="5" id="btnNoticeSave" role="button">저장</a>
        <a href="#" class="btn" data-perm-lvl="10" id="btnNoticeDelete" role="button">삭제</a>
        <a href="#" class="btn" id="btnNoticeNew" role="button">신규</a>
        <a href="#" class="btn" id="btnNoticeRefresh" role="button">새로고침</a>
    </div>

    <div class="grid-2col">
        <div class="panel">
            <div class="panel-title">공지 정보</div>
            <div id="noticeForm" class="form-grid">
                <input type="hidden" id="noti_seq" name="noti_seq" />

                <div class="form-item">
                    <label>NOTI_TYPE_CD</label>
                    <input type="text" class="input" id="noti_type_cd" name="noti_type_cd" maxlength="10" />
                </div>

                <div class="form-item full">
                    <label>TITLE *</label>
                    <input type="text" class="input" id="title" name="title" maxlength="500" />
                </div>

                <div class="form-item full">
                    <label>CONTENT</label>
                    <textarea class="textarea" id="content" name="content" rows="10"></textarea>
                </div>

                <div class="form-item">
                    <label>START_DT</label>
                    <input type="date" class="input" id="start_dt" name="start_dt" />
                </div>

                <div class="form-item">
                    <label>END_DT</label>
                    <input type="date" class="input" id="end_dt" name="end_dt" />
                </div>

                <div class="form-item">
                    <label>PIN_YN</label>
                    <select class="input" id="pin_yn" name="pin_yn">
                        <option value="N">N</option>
                        <option value="Y">Y</option>
                    </select>
                </div>

                <div class="form-item">
                    <label>POPUP_YN</label>
                    <select class="input" id="popup_yn" name="popup_yn">
                        <option value="N">N</option>
                        <option value="Y">Y</option>
                    </select>
                </div>

                <div class="form-item">
                    <label>USE_YN</label>
                    <select class="input" id="use_yn" name="use_yn">
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                    </select>
                </div>

                <div class="form-item">
                    <label>VIEW_CNT</label>
                    <input type="text" class="input" id="view_cnt" name="view_cnt" readonly />
                </div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-title">공지 목록</div>
            <table class="tbl" id="noticeTable">
                <thead>
                    <tr>
                        <th>NOTI_SEQ</th>
                        <th>TYPE</th>
                        <th>TITLE</th>
                        <th>기간</th>
                        <th>PIN</th>
                        <th>POPUP</th>
                        <th>VIEW</th>
                        <th>USE</th>
                    </tr>
                </thead>
                <tbody id="noticeListBody"></tbody>
            </table>
        </div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/notice/notice.js"></script>
