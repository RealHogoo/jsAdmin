package msa.com.service;

public interface HealthCheckService {

    /**
     * DB가 살아 있는지 여부
     */
    boolean isDbUp();
}
