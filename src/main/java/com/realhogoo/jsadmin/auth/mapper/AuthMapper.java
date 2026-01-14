package com.realhogoo.jsadmin.auth.mapper;

import com.realhogoo.jsadmin.auth.dto.LoginUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AuthMapper {
    LoginUser selectUserForLogin(@Param("user_id") String userId);
}
