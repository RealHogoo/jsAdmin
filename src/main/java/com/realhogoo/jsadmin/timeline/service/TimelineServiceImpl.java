package com.realhogoo.jsadmin.timeline.service;

import com.realhogoo.jsadmin.timeline.mapper.TimelineMapper;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TimelineServiceImpl implements TimelineService {

    private final TimelineMapper timelineMapper;

    public TimelineServiceImpl(TimelineMapper timelineMapper) {
        this.timelineMapper = timelineMapper;
    }

    @Override
    public List<Map<String, Object>> selectTimelineList(Map<String, Object> param) {
        ensureSchema();
        Map<String, Object> p = param == null ? new HashMap<String, Object>() : new HashMap<String, Object>(param);
        Integer reqPage = toIntOrNull(p.get("page"));
        Integer reqSize = toIntOrNull(p.get("size"));
        if (reqPage != null || reqSize != null) {
            int page = reqPage == null ? 1 : reqPage.intValue();
            int size = reqSize == null ? 18 : reqSize.intValue();
            if (page < 1) page = 1;
            if (size < 1) size = 18;
            if (size > 100) size = 100;
            p.put("offset", (page - 1) * size);
            p.put("size", size);
        }
        return timelineMapper.selectTimelineList(p);
    }

    @Override
    public Map<String, Object> selectTimelineDetail(Long timelineSeq) {
        ensureSchema();
        if (timelineSeq == null) {
            throw new IllegalArgumentException("timeline_seq is required");
        }
        return timelineMapper.selectTimelineDetail(timelineSeq);
    }

    @Override
    public Long saveTimeline(Map<String, Object> param, String userId) {
        ensureSchema();
        if (param == null) {
            throw new IllegalArgumentException("param is required");
        }

        Long timelineSeq = toLongNullable(param.get("timeline_seq"));
        String title = toStrOrNull(param.get("title"));
        String actor = toStrOrNull(userId);
        if (actor == null) actor = "SYSTEM";

        if (title == null) {
            throw new IllegalArgumentException("title is required");
        }

        String eventDt = toDateStrOrNull(param.get("event_dt"));
        if (eventDt == null) {
            throw new IllegalArgumentException("event_dt is required");
        }

        param.put("timeline_type_cd", toStrOrNull(param.get("timeline_type_cd")));
        param.put("title", title);
        param.put("content", toStrOrNull(param.get("content")));
        param.put("event_dt", eventDt);
        param.put("use_yn", normalizeYn(param.get("use_yn"), "Y"));
        param.put("updated_by", actor);

        if (timelineSeq == null) {
            param.put("created_by", actor);
            timelineMapper.insertTimeline(param);
            Object created = param.get("timeline_seq");
            return created == null ? null : Long.valueOf(String.valueOf(created));
        }

        timelineMapper.updateTimeline(param);
        return timelineSeq;
    }

    @Override
    public int deleteTimeline(Long timelineSeq, String userId) {
        ensureSchema();
        if (timelineSeq == null) {
            throw new IllegalArgumentException("timeline_seq is required");
        }

        String actor = toStrOrNull(userId);
        if (actor == null) actor = "SYSTEM";

        Map<String, Object> p = new HashMap<String, Object>();
        p.put("timeline_seq", timelineSeq);
        p.put("updated_by", actor);
        return timelineMapper.deleteTimeline(p);
    }

    private void ensureSchema() {
        timelineMapper.ensureTimelineTable();
        timelineMapper.ensureTimelineSequence();
        timelineMapper.ensureTimelineIndex();
    }

    private String toStrOrNull(Object v) {
        if (v == null) return null;
        String s = String.valueOf(v).trim();
        if (s.isEmpty() || "null".equalsIgnoreCase(s)) return null;
        return s;
    }

    private Long toLongNullable(Object v) {
        if (v == null) return null;
        String s = String.valueOf(v).trim();
        if (s.isEmpty() || "null".equalsIgnoreCase(s)) return null;
        return Long.valueOf(s);
    }

    private String normalizeYn(Object v, String def) {
        String s = toStrOrNull(v);
        if (s == null) return def;
        return "N".equalsIgnoreCase(s) ? "N" : "Y";
    }

    private String toDateStrOrNull(Object v) {
        String s = toStrOrNull(v);
        if (s == null) return null;
        if (!s.matches("\\d{4}-\\d{2}-\\d{2}")) {
            throw new IllegalArgumentException("date format must be yyyy-MM-dd");
        }
        return s;
    }

    private Integer toIntOrNull(Object v) {
        if (v == null) return null;
        if (v instanceof Number) return ((Number) v).intValue();
        String s = String.valueOf(v).trim();
        if (s.isEmpty() || "null".equalsIgnoreCase(s)) return null;
        try {
            return Integer.valueOf(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
