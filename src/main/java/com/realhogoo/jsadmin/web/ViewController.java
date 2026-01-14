package com.realhogoo.jsadmin.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class ViewController {

    // 기본 홈 조각
    @PostMapping("/home.do")
    public String homeFragment() {
        return "fragments/home";
    }

    // 로그인 화면 조각
    @PostMapping("/login.do")
    public String loginFragment() {
        return "fragments/login/login";
    }
}
