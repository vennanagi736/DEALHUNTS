package org.example.security;

import java.io.IOException;
import java.util.Collections;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JWTFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;

    public JWTFilter(JWTUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getRequestURI();

        return path.equals("/user/login")
                || path.equals("/user/register")
                || path.equals("/vendor/login")
                || path.equals("/vendor/register")
                || path.equals("/vendor/status")
                || path.equals("/admin/login");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        System.out.println("========================================");
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Authorization Header: " + header);

        if (header != null && header.startsWith("Bearer ")) {

            String token = header.substring(7);

            try {

                boolean valid = jwtUtil.validateToken(token);
                System.out.println("Token Valid: " + valid);

                if (valid) {

                    String email = jwtUtil.extractEmail(token);
                    String role = jwtUtil.extractRole(token);

                    System.out.println("Email: " + email);
                    System.out.println("Role From Token: " + role);

                    if (role == null) {
                        role = "ROLE_USER";
                    } else if (!role.startsWith("ROLE_")) {
                        role = "ROLE_" + role;
                    }

                    if (SecurityContextHolder.getContext().getAuthentication() == null) {

                        SimpleGrantedAuthority authority =
                                new SimpleGrantedAuthority(role);

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        email,
                                        null,
                                        Collections.singletonList(authority)
                                );

                        SecurityContextHolder.getContext().setAuthentication(auth);

                        System.out.println("Authentication Set Successfully");
                        System.out.println("Authorities: " + auth.getAuthorities());
                    }

                } else {
                    System.out.println("Invalid JWT Token");
                }

            } catch (Exception e) {
                System.out.println("JWT ERROR: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("No Bearer Token Found");
        }

        System.out.println("Current Authentication: "
                + SecurityContextHolder.getContext().getAuthentication());

        System.out.println("========================================");

        filterChain.doFilter(request, response);
    }
}



