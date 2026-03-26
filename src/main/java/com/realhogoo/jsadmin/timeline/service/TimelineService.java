package com.realhogoo.jsadmin.timeline.service;

import java.util.List;
import java.util.Map;

public interface TimelineService {
    List<Map<String, Object>> selectTimelineList(Map<String, Object> param);
    Map<String, Object> selectTimelineDetail(Long timelineSeq);
    Long saveTimeline(Map<String, Object> param, String userId);
    int deleteTimeline(Long timelineSeq, String userId);
}
