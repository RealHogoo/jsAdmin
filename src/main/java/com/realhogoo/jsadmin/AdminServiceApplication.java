package com.realhogoo.jsadmin;

import com.realhogoo.jsadmin.api.TraceIdFilter;
import com.realhogoo.jsadmin.api.SecurityHeadersFilter;
import com.realhogoo.jsadmin.auth.jwt.JwtAuthFilter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.view.InternalResourceViewResolver;

import java.io.File;

@SpringBootApplication(scanBasePackages = "com.realhogoo.jsadmin")
@EnableScheduling
public class AdminServiceApplication extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(AdminServiceApplication.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(AdminServiceApplication.class);
    }

    @Bean
    public InternalResourceViewResolver internalResourceViewResolver() {
        InternalResourceViewResolver resolver = new InternalResourceViewResolver();
        resolver.setPrefix("/WEB-INF/jsp/");
        resolver.setSuffix(".jsp");
        return resolver;
    }

    @Bean
    public TomcatServletWebServerFactory tomcatFactory(@Value("${app.dev-document-root:false}") boolean useDevDocumentRoot) {
        TomcatServletWebServerFactory factory = new TomcatServletWebServerFactory();
        if (useDevDocumentRoot) {
            File devRoot = new File("src/main/webapp");
            if (devRoot.exists() && devRoot.isDirectory()) {
                factory.setDocumentRoot(devRoot);
            }
        }
        return factory;
    }

    @Bean
    public FilterRegistrationBean<TraceIdFilter> traceIdFilterRegistration() {
        FilterRegistrationBean<TraceIdFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new TraceIdFilter());
        registration.setName("traceIdFilter");
        registration.addUrlPatterns("*.json");
        registration.setOrder(2);
        return registration;
    }

    @Bean
    public FilterRegistrationBean<JwtAuthFilter> jwtAuthFilterRegistration() {
        FilterRegistrationBean<JwtAuthFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new JwtAuthFilter());
        registration.setName("jwtAuthFilter");
        registration.addUrlPatterns("*.json");
        registration.setOrder(3);
        return registration;
    }

    @Bean
    public FilterRegistrationBean<SecurityHeadersFilter> securityHeadersFilterRegistration() {
        FilterRegistrationBean<SecurityHeadersFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new SecurityHeadersFilter());
        registration.setName("securityHeadersFilter");
        registration.addUrlPatterns("/*");
        registration.setOrder(1);
        return registration;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
