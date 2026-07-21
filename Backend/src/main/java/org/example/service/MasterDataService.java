package org.example.service;

import java.util.List;

import org.example.entity.Brand;
import org.example.entity.Category;
import org.example.entity.Color;
import org.example.entity.Variant;
import org.example.repository.BrandRepository;
import org.example.repository.CategoryRepository;
import org.example.repository.ColorRepository;
import org.example.repository.VariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MasterDataService {

    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ColorRepository colorRepository;
    private final VariantRepository variantRepository;

    @Autowired
    public MasterDataService(
            CategoryRepository categoryRepository,
            BrandRepository brandRepository,
            ColorRepository colorRepository,
            VariantRepository variantRepository) {

        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.colorRepository = colorRepository;
        this.variantRepository = variantRepository;
    }

    public Category addCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Brand addBrand(Brand brand) {
        return brandRepository.save(brand);
    }

    public Color addColor(Color color) {
        return colorRepository.save(color);
    }

    public Variant addVariant(Variant variant) {
        return variantRepository.save(variant);
    }
    public List<Category> getAllCategories() {
    return categoryRepository.findAll();
    }
    public List<Brand> getAllBrand() {
    return brandRepository.findAll();
    }
    public List<Color> getAllColor() {
    return colorRepository.findAll();
    }
    public List<Variant> getAllVariant() {
    return variantRepository.findAll();
    }
}
