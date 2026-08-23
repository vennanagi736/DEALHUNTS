package org.example.service;

import java.util.List;

import org.example.entity.Product;
import org.example.entity.TrendingDeal;
import org.example.repository.ProductRepository;
import org.example.repository.TrendingDealRepository;
import org.springframework.stereotype.Service;

@Service
public class TrendingDealService {

    private final TrendingDealRepository trendingDealRepository;
    private final ProductRepository productRepository;

    public TrendingDealService(
            TrendingDealRepository trendingDealRepository,
            ProductRepository productRepository) {

        this.trendingDealRepository = trendingDealRepository;
        this.productRepository = productRepository;
    }


    // ==========================================
    // GET ALL TRENDING DEALS
    // ==========================================

    public List<TrendingDeal> getAllTrendingDeals() {

        return trendingDealRepository
                .findAllByOrderByPositionAsc();
    }


    // ==========================================
    // ADD TRENDING DEAL
    // ==========================================

    public TrendingDeal addTrendingDeal(Long productId) {

        // 1. Check maximum 7
        long count = trendingDealRepository.count();

        if (count >= 7) {

            throw new RuntimeException(
                "Maximum 7 trending deals are allowed."
            );
        }


        // 2. Find product
        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Product not found."
                    )
                );


        // 3. Product must be active
        if (!product.isActive()) {

            throw new RuntimeException(
                "Unavailable product cannot be a trending deal."
            );
        }


        // 4. Prevent duplicate product
        if (trendingDealRepository
                .existsByProductId(productId)) {

            throw new RuntimeException(
                "Product is already a trending deal."
            );
        }


        // 5. Find next position
        int position =
                (int) count + 1;


        // 6. Create TrendingDeal
        TrendingDeal trendingDeal =
                new TrendingDeal();

        trendingDeal.setProduct(product);
        trendingDeal.setPosition(position);


        // 7. Save
        return trendingDealRepository
                .save(trendingDeal);
    }


    // ==========================================
    // DELETE TRENDING DEAL
    // ==========================================

    public void deleteTrendingDeal(Long id) {

        if (!trendingDealRepository.existsById(id)) {

            throw new RuntimeException(
                "Trending deal not found."
            );
        }

        trendingDealRepository.deleteById(id);
    }
}