package com.realhogoo.jsadmin.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class MainController {

    @GetMapping("/main.do")
    public String main() {
        return "dashboard/app";
    }

    @PostMapping("/home.do")
    public String homeFragment() {
        return "fragments/home";
    }

    @PostMapping("/login.do")
    public String loginFragment() {
        return "fragments/login/login";
    }
}
