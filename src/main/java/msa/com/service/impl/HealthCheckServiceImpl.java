package msa.com.service.impl;

import javax.annotation.Resource;

import org.springframework.stereotype.Service;

import msa.com.dao.HealthCheckDAO;
import msa.com.service.HealthCheckService;


@Service("healthCheckService")
public class HealthCheckServiceImpl implements HealthCheckService {

    @Resource(name = "healthCheckDAO")
    private HealthCheckDAO healthCheckDAO;

    @Override
    public boolean isDbUp() {
        try {
            String result = healthCheckDAO.selectHealth();
            return "1".equals(result);
        } catch (Exception e) {
            // 로깅은 나중에 log4j2/logback 설정 후 처리
            return false;
        }
    }
}
