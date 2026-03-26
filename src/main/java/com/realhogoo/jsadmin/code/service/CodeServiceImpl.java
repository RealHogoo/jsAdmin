package com.realhogoo.jsadmin.code.service;

import com.realhogoo.jsadmin.code.mapper.CodeMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class CodeServiceImpl implements CodeService {

    private final CodeMapper codeMapper;

    public CodeServiceImpl(CodeMapper codeMapper) {
        this.codeMapper = codeMapper;
    }

    @Override
    public List<Map<String, Object>> selectCodeListAll() {
        return codeMapper.selectCodeListAll();
    }

    @Override
    public Long saveCode(Map<String, Object> param, String userId) {
        if (param == null) {
            throw new IllegalArgumentException("param is required");
        }

        String codeGrpCd = toStr(param.get("code_grp_cd"));
        String codeCd = toStr(param.get("code_cd"));
        String codeNm = toStr(param.get("code_nm"));
        Long codeSeq = toLongNullable(param.get("code_seq"));
        String actor = (userId == null || userId.trim().isEmpty()) ? "SYSTEM" : userId.trim();

        if (isBlank(codeGrpCd) || isBlank(codeCd) || isBlank(codeNm)) {
            throw new IllegalArgumentException("code_grp_cd, code_cd, code_nm are required");
        }

        Integer dup = codeMapper.countDupCode(codeGrpCd, codeCd, codeSeq);
        if (dup != null && dup > 0) {
            throw new IllegalStateException("duplicate code exists");
        }

        param.put("code_grp_cd", codeGrpCd);
        param.put("code_cd", codeCd);
        param.put("code_nm", codeNm);
        param.put("code_desc", toStrOrNull(param.get("code_desc")));
        param.put("sort_ord", toInt(param.get("sort_ord"), 0));
        param.put("use_yn", normalizeUseYn(param.get("use_yn")));
        param.put("updated_by", actor);

        if (codeSeq == null) {
            param.put("created_by", actor);
            codeMapper.insertCode(param);
            Object created = param.get("code_seq");
            return created == null ? null : Long.valueOf(String.valueOf(created));
        }

        codeMapper.updateCode(param);
        return codeSeq;
    }

    @Override
    public int deleteCode(Long codeSeq, String userId) {
        if (codeSeq == null) {
            throw new IllegalArgumentException("code_seq is required");
        }
        String actor = (userId == null || userId.trim().isEmpty()) ? "SYSTEM" : userId.trim();
        Map<String, Object> p = new HashMap<>();
        p.put("code_seq", codeSeq);
        p.put("updated_by", actor);
        return codeMapper.deleteCode(p);
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private String toStr(Object v) {
        return v == null ? null : String.valueOf(v).trim();
    }

    private String toStrOrNull(Object v) {
        String s = toStr(v);
        return isBlank(s) ? null : s;
    }

    private String normalizeUseYn(Object v) {
        String s = toStr(v);
        if (isBlank(s)) return "Y";
        return "N".equalsIgnoreCase(s) ? "N" : "Y";
    }

    private Long toLongNullable(Object v) {
        if (v == null) return null;
        String s = String.valueOf(v).trim();
        if (s.isEmpty() || "null".equalsIgnoreCase(s)) return null;
        return Long.valueOf(s);
    }

    private Integer toInt(Object v, int def) {
        if (v == null) return def;
        if (v instanceof Number) return ((Number) v).intValue();
        String s = String.valueOf(v).trim();
        if (s.isEmpty()) return def;
        return Integer.parseInt(s);
    }
}
