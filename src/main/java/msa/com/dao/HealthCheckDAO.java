package msa.com.dao;


import org.springframework.stereotype.Repository;

import egovframework.rte.psl.dataaccess.EgovAbstractMapper;

@Repository("healthCheckDAO")
public class HealthCheckDAO extends EgovAbstractMapper {

    public String selectHealth() {
        // Mapper namespace.id = "health.selectDual"
        return (String) selectOne("health.selectDual");
    }
}
