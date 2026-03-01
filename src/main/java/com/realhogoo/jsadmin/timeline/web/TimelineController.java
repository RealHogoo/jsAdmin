package com.realhogoo.jsadmin.timeline.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class TimelineController {

    @PostMapping("/timeline/home.do")
    public String home() {
        return "fragments/timeline/main";
    }

    @PostMapping("/timeline/main.do")
    public String main() {
        return "fragments/timeline/main";
    }
}
