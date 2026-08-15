package org.example.service;

import java.util.List;

import org.example.entity.Color;
import org.example.entity.Product;
import org.example.entity.Variant;
import org.example.repository.ProductRepository;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository productRepository;


    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Save Product
public Product saveProduct(Product product) {

    // New products are available by default
    product.setActive(true);

    // Link Variants to Product
    if (product.getVariants() != null) {

        product.getVariants().forEach(variant -> {

            variant.setProduct(product);

            if (variant.getName() == null) {
                variant.setName(
                    variant.getRam() + " " + variant.getStorage()
                );
            }

        });
    }

    // Link Colors to Product
    if (product.getColors() != null) {

        product.getColors().forEach(color -> {
            color.setProduct(product);
        });

    }

    return productRepository.save(product);
}
    
    // Get all products alphabetically
    public List<Product> getAllProducts() {
        return productRepository.findAllByOrderByNameAsc();
    }


    // Search product
    public List<Product> searchProduct(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }


    // Get product by id
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElse(null);
    }


    // Delete product
    public void deleteProduct(Long id) {

    Product product = productRepository.findById(id)
            .orElseThrow(() ->
                new RuntimeException("Product not found")
            );

    product.setActive(false);

    productRepository.save(product);
}

    public Long getProductCount(){
        return productRepository.count();
    }
    public void restoreProduct(Long id) {

    Product product = productRepository.findById(id)
            .orElseThrow(() ->
                new RuntimeException("Product not found")
            );

    product.setActive(true);

    productRepository.save(product);
}
public Product updateProduct(Long id, Product product) {

    Product existing = productRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Product not found")
            );

    // =========================
    // BASIC PRODUCT INFORMATION
    // =========================

    existing.setName(product.getName());
    existing.setBrand(product.getBrand());
    existing.setCategory(product.getCategory());
    existing.setDescription(product.getDescription());

    // =========================
    // SPECIFICATIONS
    // =========================

    existing.setProcessor(product.getProcessor());
    existing.setDisplaySize(product.getDisplaySize());
    existing.setBattery(product.getBattery());


    // =========================
    // UPDATE VARIANTS
    // =========================

    if (product.getVariants() != null) {

        List<Variant> existingVariants = existing.getVariants();
        List<Variant> newVariants = product.getVariants();

        for (int i = 0; i < newVariants.size(); i++) {

            Variant newVariant = newVariants.get(i);

            // Existing variant
            if (i < existingVariants.size()) {

                Variant oldVariant = existingVariants.get(i);

                oldVariant.setRam(newVariant.getRam());
                oldVariant.setStorage(newVariant.getStorage());

                if (newVariant.getName() == null ||
                    newVariant.getName().isBlank()) {

                    oldVariant.setName(
                        newVariant.getRam() + " " +
                        newVariant.getStorage()
                    );

                } else {

                    oldVariant.setName(newVariant.getName());
                }
            }

            // New variant
            else {

                newVariant.setProduct(existing);

                if (newVariant.getName() == null ||
                    newVariant.getName().isBlank()) {

                    newVariant.setName(
                        newVariant.getRam() + " " +
                        newVariant.getStorage()
                    );
                }

                existingVariants.add(newVariant);
            }
        }
    }


    // =========================
    // UPDATE COLORS
    // =========================
if (product.getColors() != null) {

    List<Color> existingColors = existing.getColors();
    List<Color> newColors = product.getColors();

    // -----------------------------------------
    // UPDATE EXISTING / ADD NEW COLORS
    // -----------------------------------------

    for (int i = 0; i < newColors.size(); i++) {

        Color newColor = newColors.get(i);

        // Existing color
        if (i < existingColors.size()) {

            Color oldColor = existingColors.get(i);

            oldColor.setName(newColor.getName());
            oldColor.setHexCode(newColor.getHexCode());
        }

        // New color
        else {

            newColor.setProduct(existing);

            existingColors.add(newColor);
        }
    }

}

    return productRepository.save(existing);
}
}