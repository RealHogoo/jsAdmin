package com.realhogoo.jsadmin.notice.service;

import java.util.List;
import java.util.Map;

public interface NoticeService {
    List<Map<String, Object>> selectNoticeList(Map<String, Object> param);
    Map<String, Object> selectNoticeDetail(Long notiSeq);
    Long saveNotice(Map<String, Object> param, String userId);
    int deleteNotice(Long notiSeq, String userId);
}
