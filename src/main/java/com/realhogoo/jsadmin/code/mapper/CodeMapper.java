package com.realhogoo.jsadmin.code.mapper;

import org.egovframe.rte.psl.dataaccess.mapper.Mapper;

import java.util.List;
import java.util.Map;

@Mapper("codeMapper")
public interface CodeMapper {
    List<Map<String, Object>> selectCodeListAll();
}
