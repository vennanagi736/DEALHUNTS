package org.example.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.example.dto.TodaysBestDealDTO;
import org.example.entity.Product;
import org.example.entity.TodaysBestDeal;
import org.example.repository.ProductRepository;
import org.example.repository.TodaysBestDealRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TodaysBestDealService {

    private final TodaysBestDealRepository todaysBestDealRepository;
    private final ProductRepository productRepository;

    public TodaysBestDealService(
            TodaysBestDealRepository todaysBestDealRepository,
            ProductRepository productRepository
    ) {
        this.todaysBestDealRepository = todaysBestDealRepository;
        this.productRepository = productRepository;
    }

    // ============================================================
    // GET ALL DEALS
    // ============================================================

    @Transactional(readOnly = true)
    public List<TodaysBestDealDTO> getAllDeals() {

        return todaysBestDealRepository
                .findAllByOrderByPriorityDescIdDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ============================================================
    // ADD DEAL
    // ============================================================

    @Transactional
    public TodaysBestDealDTO addDeal(TodaysBestDealDTO dto) {

        validateDTO(dto);

        if (dto.getProductId() == null) {
            throw new RuntimeException("Product is required");
        }

        Product product = productRepository
                .findById(dto.getProductId())
                .orElseThrow(() ->
                        new RuntimeException("Product not found")
                );

        if (!product.isActive()) {
            throw new RuntimeException(
                    "Cannot create a deal for an inactive product"
            );
        }

        if (todaysBestDealRepository
                .existsByProduct_Id(dto.getProductId())) {

            throw new RuntimeException(
                    "Today's Best Deal already exists for this product"
            );
        }

        TodaysBestDeal deal = new TodaysBestDeal();

        deal.setProduct(product);
        deal.setDealTitle(dto.getDealTitle().trim());

        deal.setOriginalPrice(
                dto.getOriginalPrice().setScale(2, RoundingMode.HALF_UP)
        );

        deal.setDiscount(
                dto.getDiscount().setScale(2, RoundingMode.HALF_UP)
        );

        deal.setDealPrice(
                calculateDealPrice(
                        dto.getOriginalPrice(),
                        dto.getDiscount()
                )
        );

        deal.setPriority(
                dto.getPriority() == null
                        ? 1
                        : dto.getPriority()
        );

        deal.setStartDate(dto.getStartDate());
        deal.setEndDate(dto.getEndDate());

        TodaysBestDeal saved =
                todaysBestDealRepository.save(deal);

        return convertToDTO(saved);
    }

    // ============================================================
    // UPDATE DEAL
    // ============================================================

    @Transactional
    public TodaysBestDealDTO updateDeal(
            Long id,
            TodaysBestDealDTO dto
    ) {

        validateDTO(dto);

        TodaysBestDeal deal =
                todaysBestDealRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Today's Best Deal not found"
                                )
                        );

        if (dto.getProductId() == null) {
            throw new RuntimeException("Product is required");
        }

        Product product =
                productRepository.findById(dto.getProductId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                )
                        );

        if (!product.isActive()) {
            throw new RuntimeException(
                    "Cannot use an inactive product"
            );
        }

        /*
         * Check whether another deal already uses
         * the selected product.
         */
        if (!deal.getProduct().getId()
                .equals(dto.getProductId())) {

            if (todaysBestDealRepository
                    .existsByProduct_Id(dto.getProductId())) {

                throw new RuntimeException(
                        "Today's Best Deal already exists for this product"
                );
            }
        }

        deal.setProduct(product);
        deal.setDealTitle(dto.getDealTitle().trim());

        deal.setOriginalPrice(
                dto.getOriginalPrice()
                        .setScale(2, RoundingMode.HALF_UP)
        );

        deal.setDiscount(
                dto.getDiscount()
                        .setScale(2, RoundingMode.HALF_UP)
        );

        /*
         * Always calculate the deal price on the backend.
         * This prevents invalid prices being submitted
         * from the frontend.
         */
        deal.setDealPrice(
                calculateDealPrice(
                        dto.getOriginalPrice(),
                        dto.getDiscount()
                )
        );

        deal.setPriority(
                dto.getPriority() == null
                        ? 1
                        : dto.getPriority()
        );

        deal.setStartDate(dto.getStartDate());
        deal.setEndDate(dto.getEndDate());

        TodaysBestDeal updated =
                todaysBestDealRepository.save(deal);

        return convertToDTO(updated);
    }

    // ============================================================
    // DELETE DEAL
    // ============================================================

    @Transactional
    public void deleteDeal(Long id) {

        if (!todaysBestDealRepository.existsById(id)) {
            throw new RuntimeException(
                    "Today's Best Deal not found"
            );
        }

        todaysBestDealRepository.deleteById(id);
    }

    // ============================================================
    // VALIDATION
    // ============================================================

    private void validateDTO(TodaysBestDealDTO dto) {

        if (dto == null) {
            throw new RuntimeException(
                    "Deal data is required"
            );
        }

        if (dto.getDealTitle() == null ||
                dto.getDealTitle().trim().isEmpty()) {

            throw new RuntimeException(
                    "Deal title is required"
            );
        }

        if (dto.getOriginalPrice() == null ||
                dto.getOriginalPrice().compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Original price must be greater than zero"
            );
        }

        if (dto.getDiscount() == null) {
            throw new RuntimeException(
                    "Discount is required"
            );
        }

        if (dto.getDiscount().compareTo(BigDecimal.ZERO) <= 0 ||
                dto.getDiscount().compareTo(new BigDecimal("100")) >= 0) {

            throw new RuntimeException(
                    "Discount must be greater than 0 and less than 100"
            );
        }

        if (dto.getPriority() != null &&
                dto.getPriority() < 1) {

            throw new RuntimeException(
                    "Priority must be at least 1"
            );
        }

        if (dto.getStartDate() == null) {
            throw new RuntimeException(
                    "Start date is required"
            );
        }

        if (dto.getEndDate() == null) {
            throw new RuntimeException(
                    "End date is required"
            );
        }

        if (dto.getEndDate()
                .isBefore(dto.getStartDate())) {

            throw new RuntimeException(
                    "End date cannot be before start date"
            );
        }
    }

    // ============================================================
    // DEAL PRICE CALCULATION
    // ============================================================

    private BigDecimal calculateDealPrice(
            BigDecimal originalPrice,
            BigDecimal discount
    ) {

        BigDecimal discountAmount =
                originalPrice
                        .multiply(discount)
                        .divide(
                                new BigDecimal("100"),
                                2,
                                RoundingMode.HALF_UP
                        );

        return originalPrice
                .subtract(discountAmount)
                .setScale(
                        2,
                        RoundingMode.HALF_UP
                );
    }

    // ============================================================
    // ENTITY -> DTO
    // ============================================================

    private TodaysBestDealDTO convertToDTO(
            TodaysBestDeal deal
    ) {

        TodaysBestDealDTO dto =
                new TodaysBestDealDTO();

        dto.setId(deal.getId());

        Product product = deal.getProduct();

        dto.setProductId(product.getId());
        dto.setProductName(product.getName());

        dto.setDealTitle(deal.getDealTitle());

        dto.setOriginalPrice(
                deal.getOriginalPrice()
        );

        dto.setDiscount(
                deal.getDiscount()
        );

        dto.setDealPrice(
                deal.getDealPrice()
        );

        dto.setPriority(
                deal.getPriority()
        );

        dto.setStartDate(
                deal.getStartDate()
        );

        dto.setEndDate(
                deal.getEndDate()
        );

        // ========================================================
        // ACTIVE STATUS
        // ========================================================

        LocalDate today = LocalDate.now();

        boolean active =
                !today.isBefore(deal.getStartDate())
                &&
                !today.isAfter(deal.getEndDate())
                &&
                product.isActive();

        dto.setActive(active);

        return dto;
    }
}