<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>메뉴 관리</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        #wrap {
            display: flex;
            gap: 20px;
        }
        #menuTree {
            width: 50%;
            border: 1px solid #ddd;
            padding: 10px;
            box-sizing: border-box;
            background: #fff;
        }
        #menuFormArea {
            flex: 1;
            border: 1px solid #ddd;
            padding: 10px;
            box-sizing: border-box;
            background: #fff;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        th, td {
            border: 1px solid #eee;
            padding: 4px 6px;
        }
        th {
            background: #f8f9fa;
        }
        tr:hover {
            background: #f1f1f1;
        }
        .indent-1 { padding-left: 10px; }
        .indent-2 { padding-left: 30px; }
        .indent-3 { padding-left: 50px; }
        .indent-4 { padding-left: 70px; }
        .btn {
            padding: 5px 10px;
            font-size: 12px;
            cursor: pointer;
        }
        .btn-primary {
            background: #007bff;
            border: 1px solid #007bff;
            color: #fff;
        }
        .btn-danger {
            background: #dc3545;
            border: 1px solid #dc3545;
            color: #fff;
        }
        .btn-secondary {
            background: #6c757d;
            border: 1px solid #6c757d;
            color: #fff;
        }
        .form-row {
            margin-bottom: 8px;
        }
        .form-row label {
            display: inline-block;
            width: 90px;
        }
        .form-row input[type="text"],
        .form-row input[type="number"] {
            width: 200px;
        }
        .error-msg {
            color: #d9534f;
            min-height: 18px;
        }
        .info-msg {
            color: #28a745;
            min-height: 18px;
        }
    </style>
</head>
<body>

<h2>메뉴 관리</h2>

<div id="wrap">

    <!-- 좌측: 메뉴 트리 -->
    <div id="menuTree">
        <div style="margin-bottom: 10px;">
            <button type="button" class="btn btn-primary" onclick="newRootMenu()">루트 메뉴 추가</button>
        </div>
        <table>
            <thead>
            <tr>
                <th style="width:50px;">ID</th>
                <th>메뉴명</th>
                <th style="width:60px;">정렬</th>
                <th style="width:50px;">사용</th>
                <th style="width:80px;">관리</th>
            </tr>
            </thead>
            <tbody>
            <c:forEach var="m" items="${menuList}">
                <tr onclick="editMenu(
                        '${m.menuId}',
                        '${m.upMenuId}',
                        '${fn:escapeXml(m.menuNm)}',
                        '${fn:escapeXml(m.menuUrl)}',
                        '${m.sortOrd}',
                        '${m.useYn}',
                        '${fn:escapeXml(m.remark)}'
                    )">
                    <td>${m.menuId}</td>
                    <td class="indent-${m.lvl}">
                        <c:forEach var="i" begin="2" end="${m.lvl}">
                            &nbsp;&nbsp;└
                        </c:forEach>
                        ${m.menuNm}
                    </td>
                    <td>${m.sortOrd}</td>
                    <td>${m.useYn}</td>
                    <td>
                        <button type="button" class="btn btn-secondary"
                                onclick="event.stopPropagation(); newChildMenu('${m.menuId}', '${fn:escapeXml(m.menuNm)}');">
                            하위추가
                        </button>
                    </td>
                </tr>
            </c:forEach>
            </tbody>
        </table>
    </div>

    <!-- 우측: 메뉴 상세/등록 폼 -->
    <div id="menuFormArea">
        <h3 id="formTitle">메뉴 등록</h3>

        <form id="menuForm" onsubmit="return false;">
            <input type="hidden" id="menuId" name="menuId"/>

            <div class="form-row">
                <label>부모 메뉴 ID</label>
                <input type="text" id="upMenuId" name="upMenuId" readonly />
                <span id="pMenuNmLabel"></span>
            </div>
            <div class="form-row">
                <label>메뉴명</label>
                <input type="text" id="menuNm" name="menuNm" required />
            </div>
            <div class="form-row">
                <label>URL</label>
                <input type="text" id="menuUrl" name="menuUrl" />
            </div>
            <div class="form-row">
                <label>정렬순서</label>
                <input type="number" id="sortOrd" name="sortOrd" value="10" />
            </div>
            <div class="form-row">
                <label>사용여부</label>
                <select id="useYn" name="useYn">
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                </select>
            </div>
            <div class="form-row">
                <label>비고</label>
                <input type="text" id="remark" name="remark" />
            </div>

            <div style="margin-top: 10px;">
                <button type="button" class="btn btn-primary" onclick="saveMenu()">저장</button>
                <button type="button" class="btn btn-secondary" onclick="resetForm()">신규</button>
                <button type="button" class="btn btn-danger" onclick="deleteMenu()">삭제</button>
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

    function resetForm() {
        resetMessages();
        document.getElementById("menuForm").reset();
        document.getElementById("menuId").value = "";
        document.getElementById("upMenuId").value = "";
        document.getElementById("pMenuNmLabel").innerText = "";
        document.getElementById("formTitle").innerText = "메뉴 등록";
    }

    function newRootMenu() {
        resetForm();
        document.getElementById("formTitle").innerText = "루트 메뉴 등록";
    }

    function newChildMenu(upMenuId, pMenuNm) {
        resetForm();
        document.getElementById("upMenuId").value = upMenuId;
        document.getElementById("pMenuNmLabel").innerText = " (부모: " + pMenuNm + ")";
        document.getElementById("formTitle").innerText = "하위 메뉴 등록";
    }

    function editMenu(menuId, upMenuId, menuNm, menuUrl, sortOrd, useYn, remark) {
        resetMessages();
        document.getElementById("formTitle").innerText = "메뉴 수정";

        document.getElementById("menuId").value = menuId || "";
        document.getElementById("upMenuId").value = (upMenuId && upMenuId !== "null") ? upMenuId : "";
        document.getElementById("menuNm").value = menuNm || "";
        document.getElementById("menuUrl").value = (menuUrl && menuUrl !== "null") ? menuUrl : "";
        document.getElementById("sortOrd").value = sortOrd || 10;
        document.getElementById("useYn").value = useYn || "Y";
        document.getElementById("remark").value = (remark && remark !== "null") ? remark : "";
    }

    function saveMenu() {
        resetMessages();

        var form = document.getElementById("menuForm");
        var formData = new FormData(form);
        var params = new URLSearchParams();

        formData.forEach(function (value, key) {
            params.append(key, value);
        });

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "<c:url value='/system/menu/saveMenu.json'/>", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var resp = JSON.parse(xhr.responseText);
                        if (resp.success) {
                            document.getElementById("infoMsg").innerText = "저장되었습니다.";
                            // 새로고침으로 리스트 갱신 (1차 버전)
                            window.location.reload();
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

    function deleteMenu() {
        resetMessages();

        var menuId = document.getElementById("menuId").value;
        if (!menuId) {
            document.getElementById("errorMsg").innerText = "삭제할 메뉴를 선택하세요.";
            return;
        }

        if (!confirm("선택한 메뉴를 삭제하시겠습니까? (USE_YN='N')")) {
            return;
        }

        var params = new URLSearchParams();
        params.append("menuId", menuId);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "<c:url value='/system/menu/deleteMenu.json'/>", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var resp = JSON.parse(xhr.responseText);
                        if (resp.success) {
                            document.getElementById("infoMsg").innerText = "삭제되었습니다.";
                            window.location.reload();
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
