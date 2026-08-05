package org.example.service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.example.entity.Promotion;
import org.example.repository.PromotionRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final CloudinaryService cloudinaryService;

    public PromotionService(
            PromotionRepository promotionRepository,
            CloudinaryService cloudinaryService
    ) {
        this.promotionRepository = promotionRepository;
        this.cloudinaryService = cloudinaryService;
    }

    public List<Promotion> getTrendingPromotions() {

    LocalDate today = LocalDate.now();

    return promotionRepository
            .findByStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByPriorityAsc(
                    today,
                    today
            );
}

    // ==========================
    // ADD PROMOTION
    // ==========================

    public Promotion addPromotion(
            String title,
            Integer priority,
            String startDate,
            String endDate,
            List<MultipartFile> images
    ) {

        if (images == null || images.isEmpty()) {
            throw new RuntimeException("Please upload a banner image.");
        }

        try {

            MultipartFile image = images.get(0);

            Map<?, ?> result = cloudinaryService.uploadImage(image);

            String imageUrl = result
                    .get("secure_url")
                    .toString();

            Promotion promotion = new Promotion();

            promotion.setTitle(title);
            promotion.setPriority(priority);
            promotion.setStartDate(LocalDate.parse(startDate));
            promotion.setEndDate(LocalDate.parse(endDate));
            promotion.setImageUrl(imageUrl);

            return promotionRepository.save(promotion);

        } catch (IOException e) {

            throw new RuntimeException(
                    "Image upload failed",
                    e
            );

        }

    }

    // ==========================
    // GET ALL PROMOTIONS
    // ==========================

    public List<Promotion> getAll() {
        return promotionRepository.findAll();
    }

    // ==========================
    // DELETE PROMOTION
    // ==========================

    public void deletePromotion(Long id) {

        Promotion promotion = promotionRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Promotion not found"));

        promotionRepository.delete(promotion);
    }

}