package com.realhogoo.jsadmin.config;

import com.realhogoo.jsadmin.access.mapper.AccessMapper;
import com.realhogoo.jsadmin.apipolicy.mapper.ApiPolicyMapper;
import com.realhogoo.jsadmin.auth.jwt.JwtProvider;
import com.realhogoo.jsadmin.auth.mapper.AuthMapper;
import com.realhogoo.jsadmin.code.mapper.CodeMapper;
import com.realhogoo.jsadmin.common.interceptor.LowercaseMapKeyInterceptor;
import com.realhogoo.jsadmin.health.mapper.HealthMapper;
import com.realhogoo.jsadmin.menu.mapper.MenuMapper;
import com.realhogoo.jsadmin.notice.mapper.NoticeMapper;
import com.realhogoo.jsadmin.timeline.mapper.TimelineMapper;
import com.realhogoo.jsadmin.user.mapper.UserMapper;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.apache.ibatis.plugin.Interceptor;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.PropertiesLoaderUtils;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Properties;

@Configuration
@EnableTransactionManagement
@MapperScan(basePackageClasses = {
    AccessMapper.class,
    ApiPolicyMapper.class,
    AuthMapper.class,
    CodeMapper.class,
    HealthMapper.class,
    MenuMapper.class,
    NoticeMapper.class,
    TimelineMapper.class,
    UserMapper.class
})
@PropertySource(value = {
    "classpath:application.properties",
    "classpath:app.properties"
}, ignoreResourceNotFound = true)
public class InfrastructureConfig implements EnvironmentAware {

    private static final String DEFAULT_VENDOR = "oracle";

    private Environment environment;

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
        return new PropertySourcesPlaceholderConfigurer();
    }

    @Bean
    public JwtProvider jwtProvider() {
        return new JwtProvider(
            requiredProperty("jwt.secret"),
            environment.getProperty("jwt.issuer", "jsAdmin"),
            Long.parseLong(environment.getProperty("jwt.exp_seconds", "3600"))
        );
    }

    @Bean(destroyMethod = "close")
    public DataSource dataSource() {
        String vendor = dbVendor();
        Properties common = loadProperties("db/common.properties");
        Properties vendorProperties = loadProperties("db/" + vendor + ".properties");

        HikariConfig config = new HikariConfig();
        config.setPoolName("jsadmin-" + vendor);
        config.setDriverClassName(property(vendorProperties, "jdbc.driverClassName", "db.driver"));
        config.setJdbcUrl(property(vendorProperties, "jdbc.url", "db.url"));
        config.setUsername(property(vendorProperties, "jdbc.username", "db.username"));
        config.setPassword(property(vendorProperties, "jdbc.password", "db.password"));
        config.setMaximumPoolSize(intProperty(
            vendorProperties,
            common,
            new String[] { "jdbc.maximumPoolSize", "db.maxActive" },
            5
        ));
        config.setMinimumIdle(intProperty(
            vendorProperties,
            common,
            new String[] { "jdbc.minimumIdle", "db.minIdle", "db.initialSize" },
            1
        ));
        config.setConnectionTimeout(longProperty(
            vendorProperties,
            common,
            new String[] { "jdbc.connectionTimeoutMs" },
            30000L
        ));
        config.setValidationTimeout(longProperty(
            vendorProperties,
            common,
            new String[] { "jdbc.validationTimeoutMs" },
            5000L
        ));
        return new HikariDataSource(config);
    }

    @Bean
    public org.apache.ibatis.session.SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        String vendor = dbVendor();
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        List<Resource> mapperResources = new ArrayList<Resource>();

        addResources(mapperResources, resolver.getResources("classpath:/mybatis/mappers/common/**/*.xml"));
        Resource[] vendorResources = resolver.getResources("classpath:/mybatis/mappers/" + vendor + "/**/*.xml");
        addResources(mapperResources, vendorResources);

        if (vendorResources.length == 0) {
            throw new IllegalStateException("No MyBatis mapper XML files found for db vendor: " + vendor);
        }

        SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
        factoryBean.setDataSource(dataSource);
        factoryBean.setMapperLocations(mapperResources.toArray(new Resource[0]));
        factoryBean.setPlugins(new Interceptor[] { new LowercaseMapKeyInterceptor() });
        return factoryBean.getObject();
    }

    @Bean
    public PlatformTransactionManager txManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }

    private void addResources(List<Resource> target, Resource[] resources) {
        if (resources == null) {
            return;
        }
        for (Resource resource : resources) {
            target.add(resource);
        }
    }

    private String dbVendor() {
        String vendor = environment.getProperty("app.db.vendor", DEFAULT_VENDOR);
        String normalized = vendor == null ? DEFAULT_VENDOR : vendor.trim().toLowerCase(Locale.ROOT);
        if (!"oracle".equals(normalized) && !"postgres".equals(normalized)) {
            throw new IllegalStateException("Unsupported app.db.vendor: " + vendor);
        }
        return normalized;
    }

    private Properties loadProperties(String location) {
        try {
            return PropertiesLoaderUtils.loadProperties(new ClassPathResource(location));
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load properties: " + location, e);
        }
    }

    private String requiredProperty(String key) {
        String value = environment.getProperty(key);
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalStateException("Required property missing: " + key);
        }
        return value.trim();
    }

    private String property(Properties source, String... keys) {
        for (String key : keys) {
            String envValue = environment.getProperty(key);
            if (envValue != null && !envValue.trim().isEmpty()) {
                return envValue.trim();
            }
        }
        for (String key : keys) {
            String value = source.getProperty(key);
            if (value != null && !value.trim().isEmpty()) {
                return value.trim();
            }
        }
        return null;
    }

    private int intProperty(Properties source, Properties fallback, String[] keys, int defaultValue) {
        String value = property(source, keys);
        if (value == null) {
            value = property(fallback, keys);
        }
        return value == null ? defaultValue : Integer.parseInt(value);
    }

    private long longProperty(Properties source, Properties fallback, String[] keys, long defaultValue) {
        String value = property(source, keys);
        if (value == null) {
            value = property(fallback, keys);
        }
        return value == null ? defaultValue : Long.parseLong(value);
    }
}
