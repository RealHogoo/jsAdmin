package com.realhogoo.jsadmin;

import com.realhogoo.jsadmin.api.TraceIdFilter;
import com.realhogoo.jsadmin.auth.jwt.JwtAuthFilter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ImportResource;
import org.springframework.web.servlet.view.InternalResourceViewResolver;

import java.io.File;

@SpringBootApplication(scanBasePackages = "com.realhogoo.jsadmin")
@ImportResource(locations = {"classpath:spring/root-context.xml"})
public class AdminServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AdminServiceApplication.class, args);
    }

    @Bean
    public InternalResourceViewResolver internalResourceViewResolver() {
        InternalResourceViewResolver resolver = new InternalResourceViewResolver();
        resolver.setPrefix("/WEB-INF/jsp/");
        resolver.setSuffix(".jsp");
        return resolver;
    }

    @Bean
    public TomcatServletWebServerFactory tomcatFactory() {
        TomcatServletWebServerFactory factory = new TomcatServletWebServerFactory();
        factory.setDocumentRoot(new File("src/main/webapp"));
        return factory;
    }

    @Bean
    public FilterRegistrationBean<TraceIdFilter> traceIdFilterRegistration() {
        FilterRegistrationBean<TraceIdFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new TraceIdFilter());
        registration.setName("traceIdFilter");
        registration.addUrlPatterns("*.json");
        registration.setOrder(1);
        return registration;
    }

    @Bean
    public FilterRegistrationBean<JwtAuthFilter> jwtAuthFilterRegistration() {
        FilterRegistrationBean<JwtAuthFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new JwtAuthFilter());
        registration.setName("jwtAuthFilter");
        registration.addUrlPatterns("*.json");
        registration.setOrder(2);
        return registration;
    }
}
