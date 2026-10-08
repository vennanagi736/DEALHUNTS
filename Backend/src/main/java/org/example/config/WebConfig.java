package org.example.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry
    ) {

        // ========================================================
        // COMING SOON IMAGES
        // ========================================================

        registry.addResourceHandler(
                "/uploads/coming-soon/**"
        ).addResourceLocations(
                "file:uploads/coming-soon/"
        );


        // ========================================================
        // NEW ARRIVALS IMAGES
        // ========================================================

        registry.addResourceHandler(
                "/uploads/new-arrivals/**"
        ).addResourceLocations(
                "file:uploads/new-arrivals/"
        );
    }
}
