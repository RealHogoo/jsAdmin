package com.realhogoo.jsadmin.notice.mapper;

import org.egovframe.rte.psl.dataaccess.mapper.Mapper;

import java.util.List;
import java.util.Map;

@Mapper("noticeMapper")
public interface NoticeMapper {
    List<Map<String, Object>> selectNoticeList(Map<String, Object> param);
    List<Map<String, Object>> selectPopupNoticeList();
    Map<String, Object> selectNoticeDetail(Long notiSeq);
    int insertNotice(Map<String, Object> param);
    int updateNotice(Map<String, Object> param);
    int deleteNotice(Map<String, Object> param);
}
