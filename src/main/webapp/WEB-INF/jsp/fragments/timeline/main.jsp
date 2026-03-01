<%@ page contentType="text/html; charset=UTF-8" %>

<div class="page-root" id="timelinePage">
    <h2 class="page-title">타임라인 관리</h2>

    <div class="panel">
        <div class="panel-title">조회 조건</div>
        <div class="form-grid">
            <div class="form-item">
                <label>기간 시작</label>
                <input type="date" class="input" id="timeline_from" />
            </div>
            <div class="form-item">
                <label>기간 종료</label>
                <input type="date" class="input" id="timeline_to" />
            </div>
            <div class="form-item full">
                <label>키워드</label>
                <input type="text" class="input" id="timeline_keyword" placeholder="제목/내용 검색" />
            </div>
        </div>

        <div class="btns" style="margin-top:10px;">
            <a href="#" class="btn" onclick="alert('타임라인 조회 API 연결 예정'); return false;">조회</a>
        </div>
    </div>

    <div class="panel">
        <div class="panel-title">조회 결과</div>
        <table class="tbl">
            <thead>
                <tr>
                    <th style="width:120px;">일시</th>
                    <th style="width:120px;">구분</th>
                    <th>내용</th>
                    <th style="width:120px;">처리자</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colspan="4" class="muted">조회 기능 구현 전입니다.</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
