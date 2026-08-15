package org.example.dto;

public class ImageResponse {

    private Long id;
    private String thumbnailUrl;

    public ImageResponse(Long id, String thumbnailUrl) {
        this.id = id;
        this.thumbnailUrl = thumbnailUrl;
    }

    public Long getId() {
        return id;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }
}