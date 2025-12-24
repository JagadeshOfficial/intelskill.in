FROM maven:latest AS build

# Set the working directory
WORKDIR /app

# Copy the pom.xml file
COPY pom.xml /app/

# Copy the source code
COPY src /app/src

# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jdk

# Set the working directory
WORKDIR /app

# Copy the built jar file from the build stage
# The artifactId in pom.xml is auth-service and version is 1.0.0
# default naming is ${artifactId}-${version}.jar
COPY --from=build /app/target/auth-service-1.0.0.jar /app/auth-service.jar

# Expose the port the app runs on
EXPOSE 8081

# Command to run the application
ENTRYPOINT ["java", "-jar", "/app/auth-service.jar"]
