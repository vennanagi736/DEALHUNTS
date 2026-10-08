package org.example.controller;

import java.util.Map;
import java.util.Optional;

import org.example.dto.AddressRequest;
import org.example.dto.ApiResponse;
import org.example.dto.LoginRequest;
import org.example.dto.LoginResponse;
import org.example.entity.Address;
import org.example.entity.User;
import org.example.repository.AddressRepository;
import org.example.repository.UserRepository;
import org.example.security.JWTUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;


    // ============================================================
    // USER REGISTER
    // ============================================================

    @PostMapping("/register")
    public ApiResponse register(@RequestBody User user) {

        if (userRepository.findByEmail(user.getEmail()) != null) {

            return new ApiResponse(
                false,
                "Email already exists"
            );
        }

        user.setPassword(
            passwordEncoder.encode(user.getPassword())
        );

        user.setRole("ROLE_USER");

        userRepository.save(user);

        return new ApiResponse(
            true,
            "User registered successfully"
        );
    }


    // ============================================================
    // USER LOGIN
    // ============================================================

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request) {

        User user =
            userRepository.findByEmail(
                request.getEmail().trim()
            );

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

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            return new LoginResponse(
                false,
                "Invalid password",
                null,
                null,
                null,
                null
            );
        }

        String token =
            jwtUtil.generateToken(
                user.getEmail(),
                user.getRole()
            );

        return new LoginResponse(
            true,
            "Login successful",
            token,
            user.getEmail(),
            user.getRole(),
            user.getId()
        );
    }


    // ============================================================
    // USER COUNT
    // ============================================================

    @GetMapping("/count")
    public ResponseEntity<Long> getUserCount() {

        return ResponseEntity.ok(
            userRepository.count()
        );
    }


    // ============================================================
    // CURRENT USER PROFILE
    // ============================================================

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(
            Authentication authentication) {

        String email =
            authentication.getName();

        User user =
            userRepository.findByEmail(email);

        if (user == null) {

            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
            Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole()
            )
        );
    }


    // ============================================================
    // GET CURRENT USER ADDRESS
    // ============================================================

    @GetMapping("/address")
    public ResponseEntity<?> getMyAddress(
            Authentication authentication) {

        // --------------------------------------------------------
        // FIND CURRENT USER FROM JWT
        // --------------------------------------------------------

        String email =
            authentication.getName();

        User user =
            userRepository.findByEmail(email);

        if (user == null) {

            return ResponseEntity
                .status(404)
                .body(
                    Map.of(
                        "success", false,
                        "message", "User not found"
                    )
                );
        }


        // --------------------------------------------------------
        // FIND ADDRESS USING USER ID MAPPING
        // --------------------------------------------------------

        Optional<Address> addressOptional =
            addressRepository.findByUser(user);

        // --------------------------------------------------------
        // ADDRESS DOES NOT EXIST YET
        // --------------------------------------------------------

        if (addressOptional.isEmpty()) {

            return ResponseEntity.ok(
                Map.of(
                    "success", true,
                    "saved", false
                )
            );
        }


        // --------------------------------------------------------
        // ADDRESS EXISTS
        // --------------------------------------------------------

        Address address =
            addressOptional.get();

        return ResponseEntity.ok(
            Map.of(
                "success", true,
                "saved", true,
                "id", address.getId(),
                "address", address.getAddress(),
                "latitude", address.getLatitude(),
                "longitude", address.getLongitude()
            )
        );
    }


    // ============================================================
    // SAVE / UPDATE CURRENT USER ADDRESS
    // ============================================================

    @PutMapping("/address")
    public ResponseEntity<?> saveMyAddress(
            @RequestBody AddressRequest request,
            Authentication authentication) {

        // --------------------------------------------------------
        // FIND CURRENT USER FROM JWT
        // --------------------------------------------------------

        String email =
            authentication.getName();

        User user =
            userRepository.findByEmail(email);

        if (user == null) {

            return ResponseEntity
                .status(404)
                .body(
                    Map.of(
                        "success", false,
                        "message", "User not found"
                    )
                );
        }


        // ========================================================
        // VALIDATE ADDRESS
        // ========================================================

        if (request.getAddress() == null ||
            request.getAddress().trim().isEmpty()) {

            return ResponseEntity
                .badRequest()
                .body(
                    Map.of(
                        "success", false,
                        "message", "Address is required"
                    )
                );
        }


        // ========================================================
        // VALIDATE LATITUDE
        // ========================================================

        if (request.getLatitude() == null) {

            return ResponseEntity
                .badRequest()
                .body(
                    Map.of(
                        "success", false,
                        "message", "Latitude is required"
                    )
                );
        }

        if (request.getLatitude() < -90 ||
            request.getLatitude() > 90) {

            return ResponseEntity
                .badRequest()
                .body(
                    Map.of(
                        "success", false,
                        "message",
                        "Latitude must be between -90 and 90"
                    )
                );
        }


        // ========================================================
        // VALIDATE LONGITUDE
        // ========================================================

        if (request.getLongitude() == null) {

            return ResponseEntity
                .badRequest()
                .body(
                    Map.of(
                        "success", false,
                        "message", "Longitude is required"
                    )
                );
        }

        if (request.getLongitude() < -180 ||
            request.getLongitude() > 180) {

            return ResponseEntity
                .badRequest()
                .body(
                    Map.of(
                        "success", false,
                        "message",
                        "Longitude must be between -180 and 180"
                    )
                );
        }


        // ========================================================
        // FIND EXISTING ADDRESS
        // ========================================================

        Address address;

        Optional<Address> existingAddress =
            addressRepository.findByUser(user);

        if (existingAddress.isPresent()) {

            // ----------------------------------------------------
            // UPDATE EXISTING ADDRESS
            // ----------------------------------------------------

            address =
                existingAddress.get();

        } else {

            // ----------------------------------------------------
            // CREATE NEW ADDRESS
            // ----------------------------------------------------

            address =
                new Address();

            address.setUser(user);
        }


        // ========================================================
        // SET ADDRESS DATA
        // ========================================================

        address.setAddress(
            request.getAddress().trim()
        );

        address.setLatitude(
            request.getLatitude()
        );

        address.setLongitude(
            request.getLongitude()
        );


        // ========================================================
        // SAVE
        // ========================================================

        Address savedAddress =
            addressRepository.save(address);


        // ========================================================
        // RESPONSE
        // ========================================================

        return ResponseEntity.ok(
            Map.of(
                "success", true,
                "saved", true,
                "message",
                "Address saved successfully",
                "id", savedAddress.getId(),
                "address", savedAddress.getAddress(),
                "latitude", savedAddress.getLatitude(),
                "longitude", savedAddress.getLongitude()
            )
        );
    }
}