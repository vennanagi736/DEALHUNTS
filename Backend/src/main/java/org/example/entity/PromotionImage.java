package org.example.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "promotion_images")
public class PromotionImage {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // Image URL from Cloudinary
    @Column(nullable = false)
    private String imageUrl;


    // Carousel order
    private Integer displayOrder;



    // Many images belong to one promotion
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;



    public PromotionImage(){

    }



    public PromotionImage(
            String imageUrl,
            Integer displayOrder,
            Promotion promotion
    ){

        this.imageUrl = imageUrl;
        this.displayOrder = displayOrder;
        this.promotion = promotion;

    }



    // Getters and Setters


    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }



    public String getImageUrl() {
        return imageUrl;
    }


    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }



    public Integer getDisplayOrder() {
        return displayOrder;
    }


    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }



    public Promotion getPromotion() {
        return promotion;
    }


    public void setPromotion(Promotion promotion) {
        this.promotion = promotion;
    }

}