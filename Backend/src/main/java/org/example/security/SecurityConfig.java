package org.example.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JWTUtil jwtUtil;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JWTUtil jwtUtil,
                          CorsConfigurationSource corsConfigurationSource) {
        this.jwtUtil = jwtUtil;
        this.corsConfigurationSource = corsConfigurationSource;
    }
    static {
    System.out.println("=== SECURITY CONFIG CLASS LOADED ===");
}

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        System.out.println("=== MY SECURITY CONFIG IS LOADED ===");

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                .requestMatchers(
                    "/vendor/login",
                    "/vendor/register",
                    "/vendor/status",
                    "/admin/login",
                    "/user/login",
                    "/user/register"
                ).permitAll()
                .requestMatchers("/vendor/**").permitAll()
                // .requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")
                // .requestMatchers("/user/**").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")

                // .anyRequest().authenticated()
                .anyRequest().permitAll()

            )

            .addFilterBefore(
                new JWTFilter(jwtUtil),
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}