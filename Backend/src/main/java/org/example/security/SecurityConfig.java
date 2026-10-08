package org.example.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JWTUtil jwtUtil;

    private final CorsConfigurationSource corsConfigurationSource;


    public SecurityConfig(
            JWTUtil jwtUtil,
            CorsConfigurationSource corsConfigurationSource
    ) {

        this.jwtUtil =
                jwtUtil;

        this.corsConfigurationSource =
                corsConfigurationSource;
    }


    static {

        System.out.println(
                "=== SECURITY CONFIG CLASS LOADED ==="
        );
    }


    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        System.out.println(
                "=== MY SECURITY CONFIG IS LOADED ==="
        );


        http

            // =====================================================
            // CORS
            // =====================================================

            .cors(cors ->
                cors.configurationSource(
                    corsConfigurationSource
                )
            )


            // =====================================================
            // CSRF
            // =====================================================

            .csrf(csrf ->
                csrf.disable()
            )


            // =====================================================
            // STATELESS JWT SESSION
            // =====================================================

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )


            // =====================================================
            // AUTHORIZATION
            // =====================================================

            .authorizeHttpRequests(auth -> auth


                // -------------------------------------------------
                // CORS PREFLIGHT
                // -------------------------------------------------

                .requestMatchers(
                    HttpMethod.OPTIONS,
                    "/**"
                ).permitAll()


                // -------------------------------------------------
                // PUBLIC LOGIN / REGISTER / STATUS
                // -------------------------------------------------

                .requestMatchers(
                    "/user/login",
                    "/user/register",

                    "/vendor/login",
                    "/vendor/register",
                    "/vendor/status",

                    // Vendor email duplicate check
                    "/vendor/check-email",

                    // Google Maps location resolver
                    "/vendor/resolve-location",

                    // Customer available shops
                    "/vendor/all",

                    // Admin login
                    "/admin/login"
                ).permitAll()


                // -------------------------------------------------
                // PROFILE / CURRENT ACCOUNT
                // -------------------------------------------------

                .requestMatchers(
                    "/user/me",
                    "/user/address",
                    "/vendor/me",
                    "/admin/me"
                ).authenticated()


                // -------------------------------------------------
                // CART
                // -------------------------------------------------

                .requestMatchers(
                    "/cart/**"
                ).authenticated()


                // -------------------------------------------------
                // WISHLIST
                // -------------------------------------------------

                .requestMatchers(
                    "/wishlist/**"
                ).authenticated()


                // -------------------------------------------------
                // OTHER VENDOR APIs
                // -------------------------------------------------

                /*
                 * Existing project behavior is preserved.
                 *
                 * /vendor/me
                 * is protected above.
                 *
                 * /vendor/all
                 * is public above.
                 *
                 * /vendor/check-email
                 * is public above.
                 *
                 * /vendor/resolve-location
                 * is public above.
                 *
                 * Other vendor endpoints remain accessible
                 * according to the existing project configuration.
                 */

                .requestMatchers(
                    "/vendor/**"
                ).permitAll()


                // -------------------------------------------------
                // EVERYTHING ELSE
                // -------------------------------------------------

                .anyRequest().permitAll()
            )


            // =====================================================
            // JWT FILTER
            // =====================================================

            .addFilterBefore(
                new JWTFilter(jwtUtil),
                UsernamePasswordAuthenticationFilter.class
            );


        return http.build();
    }


    // =============================================================
    // PASSWORD ENCODER
    // =============================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }
}