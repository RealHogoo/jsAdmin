package com.realhogoo.jsadmin.timeline.web;

import com.realhogoo.jsadmin.auth.AuthRequestSupport;
import com.realhogoo.jsadmin.timeline.service.TimelineService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class TimelineController {

    private final TimelineService timelineService;

    public TimelineController(TimelineService timelineService) {
        this.timelineService = timelineService;
    }

    @PostMapping("/timeline/home.do")
    public String home() {
        return "fragments/timeline/home";
    }

    @PostMapping("/timeline/main.do")
    public String main() {
        return "fragments/timeline/main";
    }

    @PostMapping("/timeline/list.json")
    @ResponseBody
    public Map<String, Object> list(@RequestBody(required = false) Map<String, Object> param) {
        List<Map<String, Object>> list = timelineService.selectTimelineList(param);
        return ok(list);
    }

    @PostMapping("/timeline/detail.json")
    @ResponseBody
    public Map<String, Object> detail(@RequestBody Map<String, Object> param) {
        Long timelineSeq = toLong(param == null ? null : param.get("timeline_seq"));
        Map<String, Object> data = timelineService.selectTimelineDetail(timelineSeq);
        return ok(data);
    }

    @PostMapping("/timeline/save.json")
    @ResponseBody
    public Map<String, Object> save(@RequestBody Map<String, Object> param, HttpServletRequest req) {
        AuthRequestSupport.ensureAdmin(req);
        String userId = req.getAttribute("user_id") == null ? null : String.valueOf(req.getAttribute("user_id"));
        try {
            Long timelineSeq = timelineService.saveTimeline(param, userId);
            return ok(Collections.singletonMap("timeline_seq", timelineSeq));
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @PostMapping("/timeline/delete.json")
    @ResponseBody
    public Map<String, Object> delete(@RequestBody Map<String, Object> param, HttpServletRequest req) {
        AuthRequestSupport.ensureAdmin(req);
        String userId = req.getAttribute("user_id") == null ? null : String.valueOf(req.getAttribute("user_id"));
        Long timelineSeq = toLong(param == null ? null : param.get("timeline_seq"));
        try {
            int cnt = timelineService.deleteTimeline(timelineSeq, userId);
            return ok(Collections.singletonMap("deleted", cnt));
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    private Map<String, Object> ok(Object data) {
        Map<String, Object> res = new HashMap<String, Object>();
        res.put("ok", true);
        res.put("code", "OK");
        res.put("message", "success");
        res.put("data", data);
        return res;
    }

    private Map<String, Object> fail(String message) {
        Map<String, Object> res = new HashMap<String, Object>();
        res.put("ok", false);
        res.put("code", "ERR");
        res.put("message", message == null ? "failed" : message);
        res.put("data", null);
        return res;
    }

    private Long toLong(Object v) {
        if (v == null) return null;
        if (v instanceof Number) return ((Number) v).longValue();
        String s = String.valueOf(v).trim();
        if (s.isEmpty() || "null".equalsIgnoreCase(s)) return null;
        return Long.valueOf(s);
    }
}
