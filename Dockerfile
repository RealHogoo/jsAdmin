FROM tomcat:8.5-jdk8-temurin

# 타임존 한국으로
RUN ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && echo "Asia/Seoul" > /etc/timezone

# 오라클 드라이버 (war 안에 포함돼 있으면 생략 가능)
# docker/lib/ojdbc8.jar 파일을 NAS에도 같이 올릴 거야.
COPY docker/lib/ojdbc8.jar /usr/local/tomcat/lib/

# 빌드된 WAR 복사
COPY admin-service.war /usr/local/tomcat/webapps/admin-service.war

ENV CATALINA_OPTS="-Xms512m -Xmx512m"
EXPOSE 8080
