<%@ page contentType="text/html; charset=UTF-8" %>

<div>
    <h3>코드관리</h3>

    <button type="button" id="btnCodeRefresh">새로고침</button>

    <table border="1" width="100%" id="codeTable">
        <thead>
            <tr>
                <th>CODE_SEQ</th>
                <th>CODE_GRP_CD</th>
                <th>CODE_CD</th>
                <th>CODE_NM</th>
                <th>SORT_ORD</th>
                <th>USE_YN</th>
            </tr>
        </thead>
        <tbody id="codeListBody"></tbody>
    </table>
</div>

<script src="${pageContext.request.contextPath}/static/js/code/code.js"></script>
