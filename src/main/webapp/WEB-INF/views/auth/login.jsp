<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>관리자 로그인</title>
    <style>
        /* 최소한의 레이아웃만, 나중에 공통 CSS로 교체 */
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
        }
        .login-wrapper {
            width: 360px;
            margin: 100px auto;
            padding: 30px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .login-wrapper h1 {
            font-size: 20px;
            margin-bottom: 20px;
            text-align: center;
        }
        .form-row {
            margin-bottom: 15px;
        }
        .form-row label {
            display: block;
            margin-bottom: 5px;
        }
        .form-row input[type="text"],
        .form-row input[type="password"] {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
        }
        .btn-area {
            margin-top: 20px;
        }
        .btn-login {
            width: 100%;
            padding: 10px;
            border: none;
            background: #007bff;
            color: #fff;
            font-size: 14px;
            cursor: pointer;
        }
        .btn-login:hover {
            background: #0056b3;
        }
        .error-msg {
            margin-top: 10px;
            color: #d9534f;
            min-height: 18px;
        }
    </style>
</head>
<body>
<div class="login-wrapper">
    <h1>MSA 관리자 포털</h1>

    <form id="loginForm" onsubmit="return false;">
        <div class="form-row">
            <label for="loginId">아이디</label>
            <input type="text" id="loginId" name="loginId" autocomplete="off" required>
        </div>
        <div class="form-row">
            <label for="password">비밀번호</label>
            <input type="password" id="password" name="password" required>
        </div>

        <div class="btn-area">
            <button type="button" class="btn-login" onclick="doLogin()">로그인</button>
        </div>

        <div class="error-msg" id="errorMsg"></div>
    </form>
</div>

<script type="text/javascript">
    function doLogin() {
        var form = document.getElementById("loginForm");
        var formData = new FormData(form);

        var params = new URLSearchParams();
        formData.forEach(function (value, key) {
            params.append(key, value);
        });

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "<c:url value='/login.json'/>", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var resp = JSON.parse(xhr.responseText);
                        if (resp.success) {
                            // 로그인 성공 → 메인으로 이동
                            window.location.href = "<c:url value='/main.do'/>";
                        } else {
                            document.getElementById("errorMsg").innerText = resp.message || "로그인에 실패했습니다.";
                        }
                    } catch (e) {
                        document.getElementById("errorMsg").innerText = "응답 처리 중 오류가 발생했습니다.";
                    }
                } else {
                    document.getElementById("errorMsg").innerText = "서버 통신에 실패했습니다. (status=" + xhr.status + ")";
                }
            }
        };
        xhr.send(params.toString());
    }

    // Enter 키로 로그인
    document.getElementById("password").addEventListener("keyup", function (e) {
        if (e.keyCode === 13) {
            doLogin();
        }
    });
</script>
</body>
</html>
