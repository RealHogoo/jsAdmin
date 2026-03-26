package com.realhogoo.jsadmin.notice.web;

import com.realhogoo.jsadmin.notice.service.NoticeService;
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
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    @PostMapping("/notice/main.do")
    public String main() {
        return "fragments/notice/main";
    }

    @PostMapping("/notice/list.do")
    public String listPage() {
        return "fragments/notice/main";
    }

    @PostMapping("/notice/list.json")
    @ResponseBody
    public Map<String, Object> list(@RequestBody(required = false) Map<String, Object> param) {
        List<Map<String, Object>> list = noticeService.selectNoticeList(param);
        return ok(list);
    }

    @PostMapping("/notice/detail.json")
    @ResponseBody
    public Map<String, Object> detail(@RequestBody Map<String, Object> param) {
        Long notiSeq = toLong(param == null ? null : param.get("noti_seq"));
        Map<String, Object> data = noticeService.selectNoticeDetail(notiSeq);
        return ok(data);
    }

    @PostMapping("/notice/save.json")
    @ResponseBody
    public Map<String, Object> save(@RequestBody Map<String, Object> param, HttpServletRequest req) {
        String userId = req.getAttribute("user_id") == null ? null : String.valueOf(req.getAttribute("user_id"));
        try {
            Long notiSeq = noticeService.saveNotice(param, userId);
            return ok(Collections.singletonMap("noti_seq", notiSeq));
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @PostMapping("/notice/delete.json")
    @ResponseBody
    public Map<String, Object> delete(@RequestBody Map<String, Object> param, HttpServletRequest req) {
        String userId = req.getAttribute("user_id") == null ? null : String.valueOf(req.getAttribute("user_id"));
        Long notiSeq = toLong(param == null ? null : param.get("noti_seq"));
        try {
            int cnt = noticeService.deleteNotice(notiSeq, userId);
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
