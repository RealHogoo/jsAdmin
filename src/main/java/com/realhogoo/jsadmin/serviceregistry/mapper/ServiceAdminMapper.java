package com.realhogoo.jsadmin.serviceregistry.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface ServiceAdminMapper {
    List<Map<String, Object>> selectServiceList(Map<String, Object> param);

    Map<String, Object> selectServiceDetail(Long serviceSeq);

    Long selectServiceSeqByCode(String serviceCd);

    void insertService(Map<String, Object> param);

    int updateService(Map<String, Object> param);

    int updateServiceUseYn(Map<String, Object> param);
}
