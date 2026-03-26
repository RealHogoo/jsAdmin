<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>권한 관리</title>
    <style>
        body { font-family: Arial, sans-serif; }
        #wrap { display: flex; gap: 20px; }
        #roleListArea, #roleFormArea {
            border: 1px solid #ddd;
            padding: 10px;
            box-sizing: border-box;
            background: #fff;
        }
        #roleListArea { width: 30%; }
        #roleFormArea { flex: 1; }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        th, td {
            border: 1px solid #eee;
            padding: 4px 6px;
        }
        th { background: #f8f9fa; }
        tr:hover { background: #f1f1f1; cursor: pointer; }

        .form-row { margin-bottom: 8px; }
        .form-row label {
            display: inline-block;
            width: 90px;
        }
        .form-row input[type="text"] {
            width: 200px;
        }
        .form-row select {
            width: 210px;
        }

        .menu-tree {
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid #eee;
            padding: 5px;
        }
        .menu-item {
            font-size: 13px;
        }
        .indent-1 { padding-left: 10px; }
        .indent-2 { padding-left: 30px; }
        .indent-3 { padding-left: 50px; }
        .indent-4 { padding-left: 70px; }

        .btn { padding: 5px 10px; font-size: 12px; cursor: pointer; }
        .btn-primary { background: #007bff; border: 1px solid #007bff; color: #fff; }
        .btn-danger  { background: #dc3545; border: 1px solid #dc3545; color: #fff; }
        .btn-secondary { background: #6c757d; border: 1px solid #6c757d; color: #fff; }

        .error-msg { color: #d9534f; min-height: 18px; }
        .info-msg  { color: #28a745; min-height: 18px; }
    </style>
</head>
<body>

<h2>권한 관리</h2>

<div id="wrap">

    <!-- 좌측: ROLE 목록 -->
    <div id="roleListArea">
        <div style="margin-bottom: 10px;">
            <button type="button" class="btn btn-primary" onclick="newRole()">신규 권한</button>
        </div>
        <table>
            <thead>
            <tr>
                <th style="width:60px;">ROLE ID</th>
                <th>ROLE 코드</th>
                <th>ROLE 이름</th>
                <th style="width:40px;">사용</th>
            </tr>
            </thead>
            <tbody>
            <c:forEach var="r" items="${roleList}">
                <tr onclick="goRoleDetail('${r.roleId}')">
                    <td>${r.roleId}</td>
                    <td>${r.roleCd}</td>
                    <td>${r.roleNm}</td>
                    <td>${r.useYn}</td>
                </tr>
            </c:forEach>
            </tbody>
        </table>
    </div>

    <!-- 우측: ROLE 상세 + 메뉴 매핑 -->
    <div id="roleFormArea">
        <h3 id="formTitle">
            <c:choose>
                <c:when test="${not empty selectedRole}">
                    권한 수정
                </c:when>
                <c:otherwise>
                    권한 등록
                </c:otherwise>
            </c:choose>
        </h3>

        <form id="roleForm" onsubmit="return false;">
            <input type="hidden" id="roleId" name="roleId" value="${selectedRole.roleId}" />

            <div class="form-row">
                <label>ROLE 코드</label>
                <input type="text" id="roleCd" name="roleCd" value="${selectedRole.roleCd}" required />
            </div>
            <div class="form-row">
                <label>ROLE 이름</label>
                <input type="text" id="roleNm" name="roleNm" value="${selectedRole.roleNm}" required />
            </div>
            <div class="form-row">
                <label>사용여부</label>
                <select id="useYn" name="useYn">
                    <option value="Y" <c:if test="${selectedRole.useYn == 'Y' || empty selectedRole}">selected</c:if>>Y</option>
                    <option value="N" <c:if test="${selectedRole.useYn == 'N'}">selected</c:if>>N</option>
                </select>
            </div>
            <div class="form-row">
                <label>비고</label>
                <input type="text" id="remark" name="remark" value="${selectedRole.remark}" />
            </div>

            <div class="form-row">
                <label>메뉴 권한</label>
                <div class="menu-tree">
                    <c:set var="selectedMenuIds" value="${selectedRole.menuIdList}" />
                    <c:forEach var="m" items="${menuList}">
                        <div class="menu-item indent-${m.lvl}">
                            <input type="checkbox"
                                   name="menuIds"
                                   value="${m.menuId}"
                                   <c:if test="${selectedMenuIds ne null && selectedMenuIds.contains(m.menuId)}">checked</c:if> />
                            ${m.menuNm} (${m.menuId})
                        </div>
                    </c:forEach>
                </div>
            </div>

            <div style="margin-top: 10px;">
                <button type="button" class="btn btn-primary" onclick="saveRole()">저장</button>
                <button type="button" class="btn btn-secondary" onclick="newRole()">신규</button>
                <button type="button" class="btn btn-danger" onclick="deleteRole()">삭제</button>
            </div>

            <div class="error-msg" id="errorMsg"></div>
            <div class="info-msg" id="infoMsg"></div>
        </form>
    </div>

</div>

<script type="text/javascript">
    function resetMessages() {
        document.getElementById("errorMsg").innerText = "";
        document.getElementById("infoMsg").innerText  = "";
    }

    function goRoleDetail(roleId) {
        // 같은 화면에서 roleId만 바꿔서 다시 로딩
        window.location.href = "<c:url value='/system/role/list.do'/>?roleId=" + roleId;
    }

    function newRole() {
        resetMessages();
        window.location.href = "<c:url value='/system/role/list.do'/>";
    }

    function saveRole() {
        resetMessages();

        var form = document.getElementById("roleForm");
        var formData = new FormData(form);
        var params = new URLSearchParams();

        formData.forEach(function (value, key) {
            params.append(key, value);
        });

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "<c:url value='/system/role/saveRole.json'/>", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var resp = JSON.parse(xhr.responseText);
                        if (resp.success) {
                            document.getElementById("infoMsg").innerText = "저장되었습니다.";
                            // 현재 ROLE 기준으로 다시 로딩
                            var roleId = document.getElementById("roleId").value;
                            if (roleId) {
                                goRoleDetail(roleId);
                            } else {
                                window.location.reload();
                            }
                        } else {
                            document.getElementById("errorMsg").innerText = resp.message || "저장에 실패했습니다.";
                        }
                    } catch (e) {
                        document.getElementById("errorMsg").innerText = "응답 처리 중 오류가 발생했습니다.";
                    }
                } else {
                    document.getElementById("errorMsg").innerText = "서버 통신 실패 (status=" + xhr.status + ")";
                }
            }
        };
        xhr.send(params.toString());
    }

    function deleteRole() {
        resetMessages();

        var roleId = document.getElementById("roleId").value;
        if (!roleId) {
            document.getElementById("errorMsg").innerText = "삭제할 권한을 선택하세요.";
            return;
        }

        if (!confirm("선택한 권한을 삭제하시겠습니까? (USE_YN='N')")) {
            return;
        }

        var params = new URLSearchParams();
        params.append("roleId", roleId);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "<c:url value='/system/role/deleteRole.json'/>", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var resp = JSON.parse(xhr.responseText);
                        if (resp.success) {
                            document.getElementById("infoMsg").innerText = "삭제되었습니다.";
                            window.location.href = "<c:url value='/system/role/list.do'/>";
                        } else {
                            document.getElementById("errorMsg").innerText = resp.message || "삭제에 실패했습니다.";
                        }
                    } catch (e) {
                        document.getElementById("errorMsg").innerText = "응답 처리 중 오류가 발생했습니다.";
                    }
                } else {
                    document.getElementById("errorMsg").innerText = "서버 통신 실패 (status=" + xhr.status + ")";
                }
            }
        };
        xhr.send(params.toString());
    }
</script>

</body>
</html>
