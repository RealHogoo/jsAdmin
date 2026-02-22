package com.realhogoo.jsadmin.code.service;

import com.realhogoo.jsadmin.code.mapper.CodeMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

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
}
