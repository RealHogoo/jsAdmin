package com.realhogoo.jsadmin.code.mapper;

import org.egovframe.rte.psl.dataaccess.mapper.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper("codeMapper")
public interface CodeMapper {
    List<Map<String, Object>> selectCodeListAll();
    int insertCode(Map<String, Object> param);
    int updateCode(Map<String, Object> param);
    int deleteCode(Map<String, Object> param);
    int countDupCode(@Param("code_grp_cd") String codeGrpCd, @Param("code_cd") String codeCd, @Param("code_seq") Long codeSeq);
}
