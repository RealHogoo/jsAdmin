package com.realhogoo.jsadmin.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class MainController {

    @GetMapping("/main.do")
    public String main() {
        // /WEB-INF/jsp/dashboard/app.jsp
        return "dashboard/app";
    }
}
