<%@ page contentType="text/html; charset=UTF-8" %>

<div>
  <h3>메뉴관리</h3>

  <button type="button" id="btnMenuRefresh">새로고침</button>
  <table border="1" width="100%" id="menuTable">
    <thead>
      <tr>
        <th>menu_seq</th>
        <th>up_menu_seq</th>
        <th>menu_nm</th>
        <th>menu_url</th>
        <th>menu_type_cd</th>
        <th>sort_ord</th>
        <th>use_yn</th>
      </tr>
    </thead>
    <tbody id="menuListBody"></tbody>
  </table>
</div>

<script src="${pageContext.request.contextPath}/static/js/menu/menu.js"></script>
