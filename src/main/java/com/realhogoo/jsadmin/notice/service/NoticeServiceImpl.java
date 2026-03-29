package com.realhogoo.jsadmin.notice.service;

import com.realhogoo.jsadmin.notice.mapper.NoticeMapper;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NoticeServiceImpl implements NoticeService {
    private static final int MAX_NOTICE_TYPE_CODE_LENGTH = 30;
    private static final int MAX_NOTICE_TITLE_LENGTH = 300;
    private static final int MAX_NOTICE_CONTENT_LENGTH = 4000;

    private final NoticeMapper noticeMapper;

    public NoticeServiceImpl(NoticeMapper noticeMapper) {
        this.noticeMapper = noticeMapper;
    }

    @Override
    public List<Map<String, Object>> selectNoticeList(Map<String, Object> param) {
        return noticeMapper.selectNoticeList(param == null ? new HashMap<String, Object>() : param);
    }

    @Override
    public Map<String, Object> selectNoticeDetail(Long notiSeq) {
        if (notiSeq == null) {
            throw new IllegalArgumentException("noti_seq is required");
        }
        return noticeMapper.selectNoticeDetail(notiSeq);
    }

    @Override
    public Long saveNotice(Map<String, Object> param, String userId) {
        if (param == null) {
            throw new IllegalArgumentException("param is required");
        }

        Long notiSeq = toLongNullable(param.get("noti_seq"));
        String title = toStrOrNull(param.get("title"));
        String actor = toStrOrNull(userId);
        if (actor == null) actor = "SYSTEM";

        if (title == null) {
            throw new IllegalArgumentException("title is required");
        }
        validateLength("noti_type_cd", toStrOrNull(param.get("noti_type_cd")), MAX_NOTICE_TYPE_CODE_LENGTH);
        validateLength("title", title, MAX_NOTICE_TITLE_LENGTH);
        validateLength("content", toStrOrNull(param.get("content")), MAX_NOTICE_CONTENT_LENGTH);

        String startDt = toDateStrOrNull(param.get("start_dt"));
        String endDt = toDateStrOrNull(param.get("end_dt"));
        if (startDt != null && endDt != null && startDt.compareTo(endDt) > 0) {
            throw new IllegalArgumentException("start_dt must be less than or equal to end_dt");
        }

        param.put("noti_type_cd", toStrOrNull(param.get("noti_type_cd")));
        param.put("title", title);
        param.put("content", toStrOrNull(param.get("content")));
        param.put("start_dt", startDt);
        param.put("end_dt", endDt);
        param.put("pin_yn", normalizeYn(param.get("pin_yn"), "N"));
        param.put("popup_yn", normalizeYn(param.get("popup_yn"), "N"));
        param.put("use_yn", normalizeYn(param.get("use_yn"), "Y"));
        param.put("updated_by", actor);

        if (notiSeq == null) {
            param.put("created_by", actor);
            noticeMapper.insertNotice(param);
            Object created = param.get("noti_seq");
            return created == null ? null : Long.valueOf(String.valueOf(created));
        }

        noticeMapper.updateNotice(param);
        return notiSeq;
    }

    @Override
    public int deleteNotice(Long notiSeq, String userId) {
        if (notiSeq == null) {
            throw new IllegalArgumentException("noti_seq is required");
        }

        String actor = toStrOrNull(userId);
        if (actor == null) actor = "SYSTEM";

        Map<String, Object> p = new HashMap<String, Object>();
        p.put("noti_seq", notiSeq);
        p.put("updated_by", actor);
        return noticeMapper.deleteNotice(p);
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

    private void validateLength(String field, String value, int maxLength) {
        if (value != null && value.length() > maxLength) {
            throw new IllegalArgumentException(field + " length must be " + maxLength + " or less");
        }
    }
}
