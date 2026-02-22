package com.realhogoo.jsadmin.health.mapper;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface HealthMapper {
    int ping();
}
