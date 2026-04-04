package com.realhogoo.jsadmin.health.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ServiceRegistryMapper {
    List<Map<String, Object>> selectServiceRegistryList();

    Map<String, Object> selectServiceRegistryByCode(@Param("serviceCd") String serviceCd);
}
