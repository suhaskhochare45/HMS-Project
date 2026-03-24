package com.ers.ersbackend.security;

import com.ers.ersbackend.model.Permission;
import com.ers.ersbackend.model.User;
import com.ers.ersbackend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        if (path.startsWith("/auth") && !path.equals("/auth/me")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");

        String token = null;
        String email = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);

            try {
                email = jwtUtil.extractUsername(token);
            } catch (Exception e) {
                System.out.println("Invalid JWT Token");
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            if (jwtUtil.validateToken(token, email)) {

                Optional<User> optUser = userRepository.findByEmail(email);
                if (optUser.isPresent()) {
                    User user = optUser.get();
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    
                    // Add legacy base role
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().getName()));
                    
                    // Add dynamic permissions
                    if (user.getRole().getPermissions() != null) {
                        for (Permission p : user.getRole().getPermissions()) {
                            authorities.add(new SimpleGrantedAuthority(p.getName()));
                        }
                    }

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    email,
                                    null,
                                    authorities
                            );

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}