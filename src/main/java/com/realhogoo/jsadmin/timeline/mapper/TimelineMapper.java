package com.realhogoo.jsadmin.timeline.mapper;

import org.egovframe.rte.psl.dataaccess.mapper.Mapper;

import java.util.List;
import java.util.Map;

@Mapper("timelineMapper")
public interface TimelineMapper {
    List<Map<String, Object>> selectTimelineList(Map<String, Object> param);
    Map<String, Object> selectTimelineDetail(Long timelineSeq);
    int insertTimeline(Map<String, Object> param);
    int updateTimeline(Map<String, Object> param);
    int deleteTimeline(Map<String, Object> param);
}
