package com.app.TaskManager.controller;

import com.app.TaskManager.entity.Task;
import com.app.TaskManager.entity.User;
import com.app.TaskManager.repository.TaskRepository;
import com.app.TaskManager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;


    private User getAuthenticatedUser() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return userRepository.findByEmail(email).orElse(null);
    }

    // Get ALL tasks for the logged-in user
    @GetMapping
    public ResponseEntity<?> getMyTasks() {
        User user = getAuthenticatedUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Task> tasks = taskRepository.findByUser(user);

        // Sort by taskOrder (for drag & drop) then by ID
        tasks.sort((t1, t2) -> {
            int order1 = t1.getTaskOrder() == null ? 0 : t1.getTaskOrder();
            int order2 = t2.getTaskOrder() == null ? 0 : t2.getTaskOrder();
            return Integer.compare(order1, order2);
        });

        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createTask(@RequestBody Task task) {
        User user = getAuthenticatedUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        task.setUser(user);

        task.setTaskOrder(9999);

        Task savedTask = taskRepository.save(task);
        return ResponseEntity.ok(savedTask);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<?> updateTask(@PathVariable Long taskId, @RequestBody Task updatedTask) {
        User user = getAuthenticatedUser();
        Task existingTask = taskRepository.findById(taskId).orElse(null);


        if (existingTask == null || !existingTask.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Task not found or access denied");
        }

        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setStatus(updatedTask.getStatus());
        existingTask.setDeadline(updatedTask.getDeadline());
        existingTask.setPriority(updatedTask.getPriority());
        existingTask.setTags(updatedTask.getTags());

        taskRepository.save(existingTask);
        return ResponseEntity.ok(existingTask);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTask(@PathVariable Long taskId) {
        User user = getAuthenticatedUser();
        Task task = taskRepository.findById(taskId).orElse(null);

        if (task == null || !task.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        taskRepository.delete(task);
        return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
    }


    @PutMapping("/reorder")
    public ResponseEntity<?> reorderTasks(@RequestBody List<Long> taskIds) {
        User user = getAuthenticatedUser();
        List<Task> userTasks = taskRepository.findByUser(user);


        Map<Long, Task> taskMap = userTasks.stream()
                .collect(Collectors.toMap(Task::getId, t -> t));

        for (int i = 0; i < taskIds.size(); i++) {
            Long id = taskIds.get(i);
            Task t = taskMap.get(id);
            if (t != null) {
                t.setTaskOrder(i);
                taskRepository.save(t);
            }
        }
        return ResponseEntity.ok(Map.of("message", "Order updated"));
    }
}