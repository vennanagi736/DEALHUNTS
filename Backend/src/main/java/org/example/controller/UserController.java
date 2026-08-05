package org.example.controller;

import org.example.dto.ApiResponse;
import org.example.dto.LoginRequest;
import org.example.dto.LoginResponse;
import org.example.entity.User;
import org.example.repository.UserRepository;
import org.example.security.JWTUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

  @PostMapping("/register")
public ApiResponse register(@RequestBody User user) {

    if(userRepository.findByEmail(user.getEmail())!= null){
        return new ApiResponse(
            false,
            "Email already exists"
        );
    }

    user.setPassword(passwordEncoder.encode(user.getPassword()));
    user.setRole("ROLE_USER");

    userRepository.save(user);

    return new ApiResponse(
        true,
        "User registered successfully"
    );
}

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail().trim());

        if (user == null) {
            return new LoginResponse(
                    false,
                    "User not found",
                    null,
                    null,
                    null,
                    null
            );
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new LoginResponse(
                    false,
                    "Invalid password",
                    null,
                    null,
                    null,
                    null
            );
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return new LoginResponse(
                true,
                "Login successful",
                token,
                user.getEmail(),
                user.getRole(),
                user.getId()
        );
    }
}

