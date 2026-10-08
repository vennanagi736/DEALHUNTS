package org.example.service;

import java.util.List;

import org.example.entity.WhyDealHunts;
import org.example.repository.WhyDealHuntsRepository;
import org.springframework.stereotype.Service;

@Service
public class WhyDealHuntsService {

    private final WhyDealHuntsRepository repository;

    public WhyDealHuntsService(WhyDealHuntsRepository repository) {
        this.repository = repository;
    }

    // ============================================================
    // GET ALL BENEFITS
    // ============================================================

    public List<WhyDealHunts> getAllBenefits() {
        return repository.findAll();
    }

    // ============================================================
    // ADD BENEFIT
    // ============================================================

    public WhyDealHunts addBenefit(
            String title,
            String description,
            String icon
    ) {

        if (title == null || title.trim().isEmpty()) {
            throw new RuntimeException("Title is required.");
        }

        if (description == null || description.trim().isEmpty()) {
            throw new RuntimeException("Description is required.");
        }

        // Maximum 6 Why DEALHUNTS benefits
        if (repository.count() >= 6) {
            throw new RuntimeException(
                    "You can add maximum 6 Why DEALHUNTS benefits."
            );
        }

        // Prevent duplicate titles
        if (repository.existsByTitleIgnoreCase(title.trim())) {
            throw new RuntimeException(
                    "This Why DEALHUNTS benefit is already added."
            );
        }

        WhyDealHunts benefit = new WhyDealHunts();

        benefit.setTitle(title.trim());
        benefit.setDescription(description.trim());

        if (icon == null || icon.trim().isEmpty()) {
            benefit.setIcon("⭐");
        } else {
            benefit.setIcon(icon.trim());
        }

        return repository.save(benefit);
    }

    // ============================================================
    // DELETE BENEFIT
    // ============================================================

    public void deleteBenefit(Long id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("Benefit not found.");
        }

        repository.deleteById(id);
    }
}