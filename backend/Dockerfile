# Use an official OpenJDK image
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy the built jar file
COPY target/TaskManager-0.0.1-SNAPSHOT.jar app.jar

# Expose the port your app runs on
EXPOSE 8080

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
