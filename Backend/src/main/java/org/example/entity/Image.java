package org.example.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name="image")
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreationTimestamp
    @Column(name = "created_at", updatable=false)
    private LocalDateTime createdAt;


    private String thumbnailUrl;


    private String imageStatus;


    @ManyToOne
    @JoinColumn(name="product_id")
    @JsonBackReference
    private Product product;




    public Long getId(){
        return id;
    }


    public void setId(Long id){
        this.id=id;
    }

    public LocalDateTime getCreatedAt(){
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt){
        this.createdAt = createdAt;
    }


    public String getThumbnailUrl(){
        return thumbnailUrl;
    }


    public void setThumbnailUrl(String thumbnailUrl){
        this.thumbnailUrl=thumbnailUrl;
    }


    public String getImageStatus(){
        return imageStatus;
    }


    public void setImageStatus(String imageStatus){
        this.imageStatus=imageStatus;
    }


    public Product getProduct(){
        return product;
    }


    public void setProduct(Product product){
        this.product=product;
    }
}