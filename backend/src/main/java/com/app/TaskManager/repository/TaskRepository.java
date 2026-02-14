package com.app.TaskManager.repository;

import com.app.TaskManager.entity.Task;
import com.app.TaskManager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUser(User user);

}
